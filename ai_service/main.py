from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import torch
import torch.nn as nn
import timm
import open_clip
from torchvision import models, transforms
from PIL import Image
import numpy as np
import io
import os
import base64
import time
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

app = FastAPI(
    title="Deepfake Detection AI Service",
    description="Multi-model deepfake tespit servisi",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_DIR = os.getenv("MODEL_DIR", "./models")

MODEL_WEIGHTS = {
    "Xception": 0.45,
    "EfficientNet-B4": 0.15,
    "ResNet50": 0.30,
    "CLIP": 0.10
}

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

models_dict = {}
gradcam_dict = {}
clip_model = None
clip_preprocess = None
clip_tokenizer = None
real_features = None
fake_features = None

def load_all_models():
    global models_dict, gradcam_dict
    global clip_model, clip_preprocess, clip_tokenizer, real_features, fake_features

    print("📦 Modeller yükleniyor...")

    print("   ⏳ Xception...")
    xception = timm.create_model('xception', pretrained=False, num_classes=1)
    xception.load_state_dict(torch.load(f"{MODEL_DIR}/best_xception_v2.pth", map_location=DEVICE))
    xception.to(DEVICE)
    xception.eval()
    models_dict["Xception"] = xception
    gradcam_dict["Xception"] = GradCAM(model=xception, target_layers=[xception.conv4])
    print("   ✅ Xception yüklendi")

    print("   ⏳ EfficientNet-B4...")
    effnet = timm.create_model('efficientnet_b4', pretrained=False, num_classes=1)
    effnet.load_state_dict(torch.load(f"{MODEL_DIR}/best_efficientnet_b4_v2_hibrit.pth", map_location=DEVICE))
    effnet.to(DEVICE)
    effnet.eval()
    models_dict["EfficientNet-B4"] = effnet
    gradcam_dict["EfficientNet-B4"] = GradCAM(model=effnet, target_layers=[effnet.conv_head])
    print("   ✅ EfficientNet-B4 yüklendi")

    print("   ⏳ ResNet50...")
    resnet = models.resnet50(weights=None)
    resnet.fc = nn.Sequential(
        nn.Dropout(0.5),
        nn.Linear(2048, 1)
    )
    resnet.load_state_dict(torch.load(f"{MODEL_DIR}/best_resnet50_v2_hibrit.pth", map_location=DEVICE))
    resnet.to(DEVICE)
    resnet.eval()
    models_dict["ResNet50"] = resnet
    gradcam_dict["ResNet50"] = GradCAM(model=resnet, target_layers=[resnet.layer4[-1]])
    print("   ✅ ResNet50 yüklendi")

    print("   ⏳ CLIP ViT-L-14...")
    clip_model, _, clip_preprocess = open_clip.create_model_and_transforms('ViT-L-14', pretrained='openai')
    clip_model.to(DEVICE)
    clip_model.eval()
    clip_tokenizer = open_clip.get_tokenizer('ViT-L-14')

    prompts_real = [
        "a real photo of a person",
        "a genuine photograph of a human face",
        "an authentic unedited photo of a real person",
    ]
    prompts_fake = [
        "a fake photo of a person",
        "an AI-generated image of a human face",
        "a deepfake synthetic face",
    ]

    with torch.no_grad():
        real_tokens = clip_tokenizer(prompts_real).to(DEVICE)
        real_features = clip_model.encode_text(real_tokens)
        real_features /= real_features.norm(dim=-1, keepdim=True)

        fake_tokens = clip_tokenizer(prompts_fake).to(DEVICE)
        fake_features = clip_model.encode_text(fake_tokens)
        fake_features /= fake_features.norm(dim=-1, keepdim=True)

    print("   ✅ CLIP yüklendi")
    print(f"\n🎉 Tüm modeller yüklendi! Device: {DEVICE}")

@app.on_event("startup")
async def startup_event():
    load_all_models()

def predict_cnn(model_name, img_tensor):
    """CNN modeli ile tahmin"""
    model = models_dict[model_name]
    with torch.no_grad():
        logit = model(img_tensor).squeeze()
        prob_real = torch.sigmoid(logit).item()
    prob_fake = 1 - prob_real
    return prob_fake, prob_real

def predict_clip(img_pil):
    """CLIP zero-shot tahmin"""
    img_tensor = clip_preprocess(img_pil).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        img_features = clip_model.encode_image(img_tensor)
        img_features /= img_features.norm(dim=-1, keepdim=True)

        real_sim = (100.0 * img_features @ real_features.T).mean().item()
        fake_sim = (100.0 * img_features @ fake_features.T).mean().item()

        exp_real, exp_fake = np.exp(real_sim), np.exp(fake_sim)
        prob_fake = exp_fake / (exp_real + exp_fake)
        prob_real = 1 - prob_fake

    return prob_fake, prob_real

def generate_gradcam(model_name, img_pil, img_tensor):
    """Grad-CAM görselini oluştur ve base64 döndür"""
    img_np = np.array(img_pil.resize((224, 224))) / 255.0

    cam = gradcam_dict[model_name](input_tensor=img_tensor, targets=None)[0]
    overlay = show_cam_on_image(img_np.astype(np.float32), cam, use_rgb=True)

    overlay_pil = Image.fromarray(overlay)
    buffer = io.BytesIO()
    overlay_pil.save(buffer, format="PNG")
    buffer.seek(0)
    base64_str = base64.b64encode(buffer.getvalue()).decode()

    return f"data:image/png;base64,{base64_str}"

def calculate_weighted_result(results):
    """Ağırlıklı ortalama ile nihai sonuç"""
    weighted_fake = 0
    weighted_real = 0

    for model_name, data in results.items():
        weight = MODEL_WEIGHTS[model_name]
        weighted_fake += data["probabilities"]["fake"] * weight
        weighted_real += data["probabilities"]["real"] * weight

    if weighted_fake >= 50:
        verdict = "FAKE"
        confidence = weighted_fake
    else:
        verdict = "REAL"
        confidence = weighted_real

    return {
        "verdict": verdict,
        "confidence": round(confidence, 2),
        "probabilities": {
            "fake": round(weighted_fake, 2),
            "real": round(weighted_real, 2)
        }
    }

@app.get("/")
async def root():
    return {
        "status": "online",
        "models": list(MODEL_WEIGHTS.keys()),
        "weights": MODEL_WEIGHTS,
        "device": DEVICE
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": len(models_dict),
        "clip_loaded": clip_model is not None
    }

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    """
    4 model ile analiz + ağırlıklı ortalama + Grad-CAM
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Sadece görsel dosyaları kabul edilir")

    try:
        start_time = time.time()

        contents = await file.read()
        img_pil = Image.open(io.BytesIO(contents)).convert("RGB")
        img_tensor = transform(img_pil).unsqueeze(0).to(DEVICE)

        results = {}

        t0 = time.time()
        fake_prob, real_prob = predict_cnn("Xception", img_tensor)
        gradcam_xception = generate_gradcam("Xception", img_pil, img_tensor)
        results["Xception"] = {
            "verdict": "FAKE" if fake_prob >= 0.5 else "REAL",
            "confidence": round((fake_prob if fake_prob >= 0.5 else real_prob) * 100, 2),
            "probabilities": {
                "fake": round(fake_prob * 100, 2),
                "real": round(real_prob * 100, 2)
            },
            "inferenceTime": round((time.time() - t0) * 1000, 2),
            "gradcam": gradcam_xception,
            "weight": MODEL_WEIGHTS["Xception"]
        }

        t0 = time.time()
        fake_prob, real_prob = predict_cnn("EfficientNet-B4", img_tensor)
        gradcam_effnet = generate_gradcam("EfficientNet-B4", img_pil, img_tensor)
        results["EfficientNet-B4"] = {
            "verdict": "FAKE" if fake_prob >= 0.5 else "REAL",
            "confidence": round((fake_prob if fake_prob >= 0.5 else real_prob) * 100, 2),
            "probabilities": {
                "fake": round(fake_prob * 100, 2),
                "real": round(real_prob * 100, 2)
            },
            "inferenceTime": round((time.time() - t0) * 1000, 2),
            "gradcam": gradcam_effnet,
            "weight": MODEL_WEIGHTS["EfficientNet-B4"]
        }

        t0 = time.time()
        fake_prob, real_prob = predict_cnn("ResNet50", img_tensor)
        gradcam_resnet = generate_gradcam("ResNet50", img_pil, img_tensor)
        results["ResNet50"] = {
            "verdict": "FAKE" if fake_prob >= 0.5 else "REAL",
            "confidence": round((fake_prob if fake_prob >= 0.5 else real_prob) * 100, 2),
            "probabilities": {
                "fake": round(fake_prob * 100, 2),
                "real": round(real_prob * 100, 2)
            },
            "inferenceTime": round((time.time() - t0) * 1000, 2),
            "gradcam": gradcam_resnet,
            "weight": MODEL_WEIGHTS["ResNet50"]
        }

        t0 = time.time()
        fake_prob, real_prob = predict_clip(img_pil)
        results["CLIP"] = {
            "verdict": "FAKE" if fake_prob >= 0.5 else "REAL",
            "confidence": round((fake_prob if fake_prob >= 0.5 else real_prob) * 100, 2),
            "probabilities": {
                "fake": round(fake_prob * 100, 2),
                "real": round(real_prob * 100, 2)
            },
            "inferenceTime": round((time.time() - t0) * 1000, 2),
            "gradcam": None,
            "weight": MODEL_WEIGHTS["CLIP"]
        }

        final_result = calculate_weighted_result(results)

        total_time = round((time.time() - start_time) * 1000, 2)

        return {
            "finalVerdict": final_result["verdict"],
            "finalConfidence": final_result["confidence"],
            "finalProbabilities": final_result["probabilities"],
            "totalInferenceTime": total_time,
            "modelResults": results,
            "weights": MODEL_WEIGHTS
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analiz hatası: {str(e)}")

@app.post("/analyze-path")
async def analyze_by_path(data: dict):
    """Sunucudaki görsel yolunu analiz et (NestJS'den çağrılacak)"""
    image_path = data.get("imagePath")

    if not image_path or not os.path.exists(image_path):
        raise HTTPException(status_code=404, detail="Görsel bulunamadı")

    try:
        start_time = time.time()

        img_pil = Image.open(image_path).convert("RGB")
        img_tensor = transform(img_pil).unsqueeze(0).to(DEVICE)

        results = {}

        t0 = time.time()
        fake_prob, real_prob = predict_cnn("Xception", img_tensor)
        gradcam_xception = generate_gradcam("Xception", img_pil, img_tensor)
        results["Xception"] = {
            "verdict": "FAKE" if fake_prob >= 0.5 else "REAL",
            "confidence": round((fake_prob if fake_prob >= 0.5 else real_prob) * 100, 2),
            "probabilities": {"fake": round(fake_prob * 100, 2), "real": round(real_prob * 100, 2)},
            "inferenceTime": round((time.time() - t0) * 1000, 2),
            "gradcam": gradcam_xception,
            "weight": MODEL_WEIGHTS["Xception"]
        }

        t0 = time.time()
        fake_prob, real_prob = predict_cnn("EfficientNet-B4", img_tensor)
        gradcam_effnet = generate_gradcam("EfficientNet-B4", img_pil, img_tensor)
        results["EfficientNet-B4"] = {
            "verdict": "FAKE" if fake_prob >= 0.5 else "REAL",
            "confidence": round((fake_prob if fake_prob >= 0.5 else real_prob) * 100, 2),
            "probabilities": {"fake": round(fake_prob * 100, 2), "real": round(real_prob * 100, 2)},
            "inferenceTime": round((time.time() - t0) * 1000, 2),
            "gradcam": gradcam_effnet,
            "weight": MODEL_WEIGHTS["EfficientNet-B4"]
        }

        t0 = time.time()
        fake_prob, real_prob = predict_cnn("ResNet50", img_tensor)
        gradcam_resnet = generate_gradcam("ResNet50", img_pil, img_tensor)
        results["ResNet50"] = {
            "verdict": "FAKE" if fake_prob >= 0.5 else "REAL",
            "confidence": round((fake_prob if fake_prob >= 0.5 else real_prob) * 100, 2),
            "probabilities": {"fake": round(fake_prob * 100, 2), "real": round(real_prob * 100, 2)},
            "inferenceTime": round((time.time() - t0) * 1000, 2),
            "gradcam": gradcam_resnet,
            "weight": MODEL_WEIGHTS["ResNet50"]
        }

        t0 = time.time()
        fake_prob, real_prob = predict_clip(img_pil)
        results["CLIP"] = {
            "verdict": "FAKE" if fake_prob >= 0.5 else "REAL",
            "confidence": round((fake_prob if fake_prob >= 0.5 else real_prob) * 100, 2),
            "probabilities": {"fake": round(fake_prob * 100, 2), "real": round(real_prob * 100, 2)},
            "inferenceTime": round((time.time() - t0) * 1000, 2),
            "gradcam": None,
            "weight": MODEL_WEIGHTS["CLIP"]
        }

        final_result = calculate_weighted_result(results)
        total_time = round((time.time() - start_time) * 1000, 2)

        return {
            "finalVerdict": final_result["verdict"],
            "finalConfidence": final_result["confidence"],
            "finalProbabilities": final_result["probabilities"],
            "totalInferenceTime": total_time,
            "modelResults": results,
            "weights": MODEL_WEIGHTS
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analiz hatası: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
