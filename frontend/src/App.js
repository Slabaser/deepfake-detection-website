import React, { useState, useEffect } from "react";
import "./App.css";
import Navbar from "./Navbar";
import StatsSection from "./StatsSection";
import UploadComponent from "./UploadComponent";
import ResultsComponent from "./ResultsComponent";
import LoadingComponent from "./LoadingComponent";
import AuthModal from "./AuthModal";
import HomepageContent from "./HomepageContent";
import Footer from "./Footer";
import AnalysisHistory from "./AnalysisHistory";
import ProfileSettings from "./ProfileSettings";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "./api/axios";

function App() {
  const [image, setImage] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [modalState, setModalState] = useState("none");
  const [view, setView] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("userEmail");
    if (token) {
      setIsLoggedIn(true);
      setUser({ email: storedUser || "Kullanıcı" });
    }
  }, []);
  const handleUpload = async (file) => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.warn("🔑 Analiz yapabilmek için lütfen giriş yapın!", {
        position: "top-right",
        theme: "dark",
      });
      setModalState("login");
      return;
    }

    setImage(file);
    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("image", file);

    try {
      const { data: uploadData } = await api.post(
        "/analysis/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("🚀 Görsel yüklendi, AI analizi başlatılıyor...", {
        theme: "dark",
      });
      const aiFormData = new FormData();
      aiFormData.append("file", file);
      if (uploadData.analysisId) {
        aiFormData.append("analysis_id", uploadData.analysisId);
      }

      try {
        console.log("AI servise istek gönderiliyor...");
        const aiResponse = await fetch("http://localhost:8000/analyze", {
          method: "POST",
          body: aiFormData,
        });

        console.log("AI servis response status:", aiResponse.status);

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error("AI servis hata response:", errorText);
          throw new Error(
            `AI servis hatası: ${aiResponse.status} - ${errorText}`
          );
        }

        const aiResult = await aiResponse.json();
        console.log("AI servis sonucu:", aiResult);
        const formattedResult = {
          verdict: aiResult.finalVerdict || aiResult.verdict || "PENDING",
          confidence: aiResult.finalConfidence || aiResult.confidence || 0,
          finalVerdict: aiResult.finalVerdict,
          finalConfidence: aiResult.finalConfidence,
          finalProbabilities: aiResult.finalProbabilities,
          model_results: aiResult.modelResults || aiResult.model_results || {},
          modelResults: aiResult.modelResults || {},
          weighted_average: {
            weighted_score: (aiResult.finalProbabilities?.fake || 0) / 100,
          },
          totalInferenceTime: aiResult.totalInferenceTime,
          analysisId: uploadData.analysisId,
        };

        console.log("Formatlanmış sonuç:", formattedResult);

        setAnalysisResult(formattedResult);
        setIsAnalyzing(false);

        toast.success("✅ Analiz tamamlandı!", {
          theme: "dark",
        });
      } catch (aiError) {
        console.error("AI servis hatası detayları:", aiError);
        console.error("Hata mesajı:", aiError.message);
        console.error("Hata stack:", aiError.stack);
        const errorMessage =
          aiError.message || "AI analizi sırasında bilinmeyen bir hata oluştu";
        toast.error(`⚠️ ${errorMessage}`, {
          theme: "dark",
          autoClose: 6000,
        });
        setIsAnalyzing(false);
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Yükleme hatası oluştu.";
      toast.error(`❌ Hata: ${errorMsg}`, { theme: "dark" });
      setIsAnalyzing(false);
    }
  };
  const handleReset = () => {
    setImage(null);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setView("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    setIsLoggedIn(false);
    setUser(null);
    toast.info("Çıkış yapıldı.", { theme: "dark" });
    setTimeout(() => window.location.reload(), 1000);
  };
  const renderMainComponent = () => {
    if (analysisResult && image) {
      return (
        <ResultsComponent
          result={analysisResult}
          imagePreview={URL.createObjectURL(image)}
          onReset={handleReset}
          heatmapPath={analysisResult.heatmap_path}
        />
      );
    }
    if (isAnalyzing && image) {
      return (
        <LoadingComponent
          imagePreview={URL.createObjectURL(image)}
          fileName={image?.name}
        />
      );
    }
    if (view === "history") {
      return (
        <AnalysisHistory onBack={setView} onViewAnalysis={handleViewAnalysis} />
      );
    }
    if (view === "profile") {
      return <ProfileSettings user={user} onBack={setView} />;
    }
    return (
      <>
        <UploadComponent onUpload={handleUpload} />
        <HomepageContent />
      </>
    );
  };
  const handleViewAnalysis = async (analysisId, imageUrl) => {
    try {
      const { data } = await api.get(`/analysis/${analysisId}`);

      if (
        data.verdict &&
        data.verdict !== "PENDING" &&
        data.verdict !== "ERROR"
      ) {
        try {
          const imageResponse = await fetch(
            `http://localhost:5001/analysis/uploads/${imageUrl}`
          );
          if (!imageResponse.ok) {
            throw new Error("Görsel yüklenemedi");
          }
          const imageBlob = await imageResponse.blob();
          const imageFile = new File([imageBlob], imageUrl, {
            type: imageBlob.type,
          });

          setImage(imageFile);
          setAnalysisResult({
            verdict: data.verdict,
            finalVerdict: data.verdict,
            confidence: data.confidence || 0,
            finalConfidence: data.confidence || 0,
            modelUsed: data.modelUsed,
            analysisId: data._id,
            modelResults: data.modelResults || {},
            model_results: data.modelResults || {},
            finalProbabilities: data.finalProbabilities || {
              fake:
                data.verdict === "FAKE"
                  ? data.confidence || 0
                  : 100 - (data.confidence || 0),
              real:
                data.verdict === "REAL"
                  ? data.confidence || 0
                  : 100 - (data.confidence || 0),
            },
            totalInferenceTime: data.inferenceTime,
          });

          setView("home");

          toast.success("Analiz detayları yüklendi.", { theme: "dark" });
        } catch (imgError) {
          console.error("Görsel yükleme hatası:", imgError);
          toast.error(
            "Görsel yüklenemedi, ancak analiz sonuçları gösteriliyor.",
            { theme: "dark" }
          );
        }
      } else if (data.verdict === "PENDING") {
        toast.info("Bu analiz henüz tamamlanmamış.", { theme: "dark" });
      } else if (data.verdict === "ERROR") {
        toast.error("Bu analiz sırasında bir hata oluşmuş.", { theme: "dark" });
      }
    } catch (error) {
      console.error("Analiz detayı yükleme hatası:", error);
      toast.error("Analiz detayları yüklenemedi.", { theme: "dark" });
    }
  };

  return (
    <div className="App">
      <Navbar
        onLoginClick={() => setModalState("login")}
        isLoggedIn={isLoggedIn}
        user={user}
        onLogout={handleLogout}
        onViewChange={setView}
      />
      {view === "home" && !analysisResult && !isAnalyzing && <StatsSection />}

      <main className="app-content">{renderMainComponent()}</main>

      {modalState !== "none" && (
        <AuthModal
          modalType={modalState}
          onClose={() => setModalState("none")}
          onSwitch={(type) => setModalState(type)}
          onLoginSuccess={(userData) => {
            setIsLoggedIn(true);
            setUser(userData);
            localStorage.setItem("userEmail", userData.email);
            setModalState("none");
            toast.success(`Hoş geldiniz!`);
          }}
        />
      )}

      <Footer />
      <ToastContainer position="top-right" autoClose={4000} theme="dark" />
    </div>
  );
}

export default App;
