import React from "react";

function LoadingComponent({ imagePreview, fileName }) {
  const userEmail = localStorage.getItem("userEmail") || "Kullanıcı";

  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-spinner-wrapper">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <h2>AI Analizi Yapılıyor...</h2>
        <div className="loading-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p className="loading-status">Modeller çalışıyor, lütfen bekleyin...</p>
        </div>
        <div className="loading-info-card">
          <p>
            <strong>Kullanıcı:</strong> {userEmail}
          </p>
          <p>
            <strong>Dosya:</strong> {fileName}
          </p>
        </div>
        {imagePreview && (
          <div className="loading-preview-wrapper">
            <img
              src={imagePreview}
              alt="Analiz ediliyor"
              className="loading-preview"
            />
            <div className="loading-overlay">
              <span>Analiz ediliyor...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoadingComponent;
