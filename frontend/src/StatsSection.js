import React from 'react';

import reportImage from './assets/scannerImage.avif';

function StatsSection() {
  return (
    <section className="stats-section">
      <div className="stats-content">
        <div className="stats-report-ui">
          <div className="report-header">
            <span className="report-logo" style={{ color: "var(--accent-color)" }}>Deepfake Detector</span>
            <span>Rapor</span>
          </div>
          
          <div className="report-body">
            <img 
              src={reportImage} 
              alt="Analiz Edilen Görsel" 
              className="report-image"
            />
            
            <div className="report-details">
              <div className="report-verdict-main">
                <span className="verdict-icon-fake">!</span>
                SAHTE (Likely Deepfake)
              </div>
              
              <div className="report-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
                <div className="report-stat-box">
                  <span>Tespit Sonucu</span>
                  <strong className="text-fake">SAHTE</strong>
                </div>
                <div className="report-stat-box">
                  <span>Güven Skoru</span>
                  <strong className="text-fake">87.3%</strong>
                </div>
              </div>
              
              <div className="report-breakdown">
                <div className="breakdown-header">
                  <span>Analiz Detayları</span>
                </div>
                
                <div className="breakdown-item-text">
                  <strong>Kullanılan Modeller:</strong>
                  <span>Xception, EfficientNet-B4, ResNet50, CLIP ViT-L/4</span>
                </div>
                
                <div className="breakdown-item-text">
                  <strong>Açıklanabilirlik (XAI):</strong>
                  <span>Grad-CAM Isı Haritası</span>
                </div>

                <div className="breakdown-item-text">
                  <strong>Analiz Yöntemi:</strong>
                  <span>Ağırlıklı Ortalama (Ensemble)</span>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="stats-features">
          <h2>Çoklu Model Yaklaşımı</h2>
          <p className="features-subtitle">
            Akademik literatüre dayalı, açıklanabilir ve modern yapay zekâ yöntemleri kullanılmaktadır.
          </p>
          
          <ul className="features-list">
            <li>3 finetune edilmiş derin öğrenme modeli (Xception, EfficientNet-B4, ResNet50)</li>
            <li>CLIP ViT-L/4 ile zero-shot (sıfır-atışlı) analiz</li>
            <li>Performansa dayalı ağırlıklı ortalama ile nihai karar</li>
            <li>Grad-CAM ile görsel açıklanabilirlik (XAI)</li>
          </ul>
          
          <div className="feature-highlight-box">
            <span>4 Model</span>
            <p>Her görsel 4 farklı AI modeli tarafından analiz edilir ve sonuçlar birleştirilir.</p>
          </div>
          <div className="feature-highlight-box">
            <span>Grad-CAM</span>
            <p>Model kararlarının hangi görsel bölgelere dayandığını gösteren ısı haritası ile şeffaf analiz.</p>
          </div>
        </div>
        
      </div>
    </section>
  );
}

export default StatsSection;