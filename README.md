# Deepfake Tespit Sistemi

## Özet

Bu proje, görsel içeriklerde deepfake tespiti yapmak amacıyla geliştirilmiş bir web uygulamasıdır. Sistem, çoklu derin öğrenme modellerinin ensemble yaklaşımı ile çalışmakta ve açıklanabilir yapay zeka teknikleri kullanarak karar verme sürecini şeffaflaştırmaktadır.

## Mimari

Proje üç ana bileşenden oluşmaktadır:

### AI Servisi (ai_service)

Python ve FastAPI kullanılarak geliştirilmiş yapay zeka servisi. Dört farklı derin öğrenme modeli ile görsel analizi gerçekleştirmektedir:

- **Xception**: Depthwise separable convolutions kullanan evrişimli sinir ağı modeli
- **EfficientNet-B4**: Verimli ölçekleme teknolojisi ile optimize edilmiş model
- **ResNet50**: Residual connections içeren derin öğrenme mimarisi
- **CLIP ViT-L/14**: Zero-shot öğrenme ile görsel-dil eşleştirmesi yapan model

Modellerin çıktıları performanslarına göre ağırlıklandırılarak birleştirilmekte ve Grad-CAM tekniği ile model kararlarının görselleştirilmesi sağlanmaktadır.

### Backend Servisi (backend)

NestJS framework'ü ile geliştirilmiş RESTful API servisi. Kullanıcı kimlik doğrulama, görsel yükleme ve analiz geçmişi yönetimi gibi işlevleri sağlamaktadır.

### Frontend Uygulaması (frontend)

React kütüphanesi ile geliştirilmiş kullanıcı arayüzü. Görsel yükleme, analiz sonuçlarının görselleştirilmesi ve kullanıcı profil yönetimi gibi özellikleri içermektedir.

## Teknolojiler

- **AI Servisi**: Python 3.12, FastAPI, PyTorch, timm, open-clip-torch, pytorch-grad-cam
- **Backend**: Node.js, NestJS, MongoDB, JWT
- **Frontend**: React, Axios

## Kurulum

### Gereksinimler

- Python 3.12+
- Node.js 18+
- MongoDB

### AI Servisi

```bash
cd ai_service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Model dosyalarının `ai_service/models/` dizininde bulunması gerekmektedir.

### Backend Servisi

```bash
cd backend
npm install
```

MongoDB bağlantı ayarlarının yapılandırılması gerekmektedir.

### Frontend Uygulaması

```bash
cd frontend
npm install
```

## Çalıştırma

### Geliştirme Ortamı

AI servisi:
```bash
cd ai_service
uvicorn main:app --reload --port 8000
```

Backend servisi:
```bash
cd backend
npm run start:dev
```

Frontend uygulaması:
```bash
cd frontend
npm start
```

## Lisans

Bu proje akademik bir tez çalışması kapsamında geliştirilmiştir.

