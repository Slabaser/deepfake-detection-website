import React, { useEffect } from "react";

function ResultsComponent({ result, imagePreview, onReset, heatmapPath }) {
  useEffect(() => {
    console.log("ResultsComponent - result:", result);
    console.log("ResultsComponent - imagePreview:", imagePreview);
    console.log("ResultsComponent - heatmapPath:", heatmapPath);
  }, [result, imagePreview, heatmapPath]);

  const formatModelResults = () => {
    if (!result) {
      console.warn("ResultsComponent: result is null or undefined");
      return [];
    }
    
    const modelResultsData = result.modelResults || result.model_results || {};
    
    if (Object.keys(modelResultsData).length === 0) {
      console.warn("ResultsComponent: model_results is empty");
      return [];
    }
    
    console.log("ResultsComponent - model_results data:", modelResultsData);
    
    const models = [];
    
    const modelNames = ["Xception", "EfficientNet-B4", "ResNet50", "CLIP"];
    
    modelNames.forEach((modelName) => {
      if (modelResultsData[modelName]) {
        const modelData = modelResultsData[modelName];
        models.push({
          name: modelName,
          key: modelName.toLowerCase().replace(/-/g, '_'),
          verdict: modelData.verdict,
          confidence: modelData.confidence,
          raw_score: (modelData.probabilities?.fake || 0) / 100,
          probabilities: modelData.probabilities || {
            fake: modelData.probabilities?.fake || 0,
            real: modelData.probabilities?.real || 0
          },
          gradcam: modelData.gradcam, // Base64 string
          weight: modelData.weight
        });
      }
    });
    
    console.log("ResultsComponent - formatted models:", models);
    return models;
  };

  const modelResults = formatModelResults();
  const finalVerdict = result?.finalVerdict || result?.verdict || "PENDING";
  const finalConfidence = result?.finalConfidence || result?.confidence || 0;
  
  const bestModel = modelResults.length > 0 
    ? modelResults.filter(m => m.gradcam).reduce((prev, current) => 
        (current.confidence > prev.confidence) ? current : prev, 
        modelResults.find(m => m.gradcam) || modelResults[0]
      )
    : null;
  
  const mainHeatmapUrl = bestModel?.gradcam || heatmapPath || result?.heatmap_path || result?.heatmapPath;
  
  console.log("ResultsComponent - mainHeatmapUrl:", mainHeatmapUrl ? "Base64 string mevcut" : "Yok");
  console.log("ResultsComponent - Her model için Grad-CAM:", modelResults.map(m => ({ name: m.name, hasGradcam: !!m.gradcam })));

  return (
    <div className="results-container">
      <h2>Analiz Sonuçları</h2>

      <div className="results-layout">
        <div className="results-images-section">
          <div className={`final-verdict-card ${finalVerdict.toLowerCase()}`}>
            <h3>Nihai Karar</h3>
            <div className="verdict-display">
              <span className={`verdict-badge ${finalVerdict.toLowerCase()}`}>
                {finalVerdict}
              </span>
              <span className="confidence-display">
                Güven: %{finalConfidence.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="image-comparison-section">
            <div className="image-pair">
              <div className="image-card">
                <h4>Orijinal Görsel</h4>
                <div className="image-wrapper">
                  <img 
                    src={imagePreview} 
                    alt="Orijinal görsel" 
                    className="result-image" 
                  />
                </div>
              </div>
              
              <div className="image-card">
                <h4>Grad-CAM Isı Haritası {bestModel && `(${bestModel.name})`}</h4>
                <div className="image-wrapper">
                  {mainHeatmapUrl ? (
                    <img 
                      src={mainHeatmapUrl} 
                      alt={`Grad-CAM ısı haritası - ${bestModel?.name || 'Model'}`}
                      className="result-image heatmap-image" 
                      onError={(e) => {
                        console.error("Grad-CAM görseli yüklenemedi");
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) {
                          e.target.nextSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : (
                    <div className="no-heatmap" style={{ display: 'flex' }}>
                      <p>Isı haritası mevcut değil</p>
                    </div>
                  )}
                </div>
                <p className="heatmap-info">
                  {bestModel 
                    ? `En yüksek güven skorlu model (${bestModel.name}) için oluşturulmuş gerçek Grad-CAM ısı haritası.`
                    : 'Grad-CAM ısı haritası yüklenemedi.'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="model-results-panel">
          <h3>Model Sonuçları</h3>
          
          {modelResults.length > 0 ? (
            <div className="models-list">
              {modelResults.map((model, index) => {
                const rawScore = model.raw_score || (model.confidence / 100);
                const fakePercent = (rawScore * 100).toFixed(1);
                const realPercent = ((1 - rawScore) * 100).toFixed(1);
                
                return (
                  <div key={model.key || index} className="model-result-card">
                    <div className="model-header-row">
                      <h4>{model.name}</h4>
                      <span className={`model-verdict-badge ${model.verdict?.toLowerCase()}`}>
                        {model.verdict}
                      </span>
                    </div>
                    
                    <div className="model-confidence">
                      <div className="confidence-bar-wrapper">
                        <div className="confidence-label">Güven Skoru</div>
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill" 
                            style={{ width: `${model.confidence}%` }}
                          />
                        </div>
                        <div className="confidence-value">{model.confidence.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="model-probabilities">
                      <div className="prob-row">
                        <span className="prob-label">FAKE</span>
                        <div className="prob-bar-container">
                          <div 
                            className="prob-bar-fill fake" 
                            style={{ width: `${fakePercent}%` }}
                          />
                        </div>
                        <span className="prob-value">{fakePercent}%</span>
                      </div>
                      <div className="prob-row">
                        <span className="prob-label">REAL</span>
                        <div className="prob-bar-container">
                          <div 
                            className="prob-bar-fill real" 
                            style={{ width: `${realPercent}%` }}
                          />
                        </div>
                        <span className="prob-value">{realPercent}%</span>
                      </div>
                    </div>

                    {model.gradcam && (
                      <div className="model-gradcam-preview">
                        <h5>Grad-CAM Isı Haritası</h5>
                        <div className="gradcam-preview-wrapper">
                          <img 
                            src={model.gradcam} 
                            alt={`${model.name} Grad-CAM`}
                            className="gradcam-preview-image"
                            onClick={() => {
                              const mainHeatmap = document.querySelector('.heatmap-image');
                              if (mainHeatmap) {
                                mainHeatmap.src = model.gradcam;
                                const heatmapTitle = document.querySelector('.image-card h4');
                                if (heatmapTitle) {
                                  heatmapTitle.textContent = `Grad-CAM Isı Haritası (${model.name})`;
                                }
                              }
                            }}
                          />
                          <span className="gradcam-click-hint">Tıklayarak büyük görüntüde göster</span>
                        </div>
                      </div>
                    )}
                    {!model.gradcam && model.name === "CLIP" && (
                      <div className="model-gradcam-info">
                        <p className="gradcam-unavailable">CLIP zero-shot model olduğu için Grad-CAM uygulanamaz</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="no-results">
              <p>Model sonuçları yükleniyor...</p>
            </div>
          )}

          {result?.finalProbabilities && (
            <div className="weighted-average-info">
              <h4>Ağırlıklı Ortalama</h4>
              <p>
                <strong>FAKE:</strong> {result.finalProbabilities.fake}%
              </p>
              <p>
                <strong>REAL:</strong> {result.finalProbabilities.real}%
              </p>
              {result.totalInferenceTime && (
                <p>
                  <strong>Süre:</strong> {result.totalInferenceTime} ms
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <button onClick={onReset} className="reset-button">
        Yeni Bir Görsel Analiz Et
      </button>
    </div>
  );
}

export default ResultsComponent;
