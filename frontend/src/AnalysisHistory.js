import React, { useEffect, useState } from "react";
import api from "./api/axios";
import { toast } from "react-toastify";

function AnalysisHistory({ onBack, onViewAnalysis }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const { data } = await api.get("/analysis/history");
        setHistory(data);
      } catch (error) {
        toast.error("Geçmiş veriler yüklenemedi.");
        console.error("Geçmiş yükleme hatası:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading)
    return <div className="spinner" style={{ marginTop: "100px" }}></div>;

  return (
    <div className="history-container">
      <div className="history-header">
        <div>
          <h2 className="section-title">Geçmiş Analizlerim</h2>
          <p className="section-subtitle">
            Daha önce gerçekleştirdiğin tüm tespit işlemleri aşağıda
            listelenmiştir.
          </p>
        </div>
        <button
          className="nav-button"
          onClick={() => onBack("home")}
          style={{ height: "fit-content" }}
        >
          + Yeni Bir Görsel Analiz Et
        </button>
      </div>

      {history.length === 0 ? (
        <div
          className="content-card"
          style={{ textAlign: "center", padding: "50px" }}
        >
          <p>Henüz bir analiz kaydınız bulunmuyor.</p>
          <button className="reset-button" onClick={() => onBack("home")}>
            İlk Analizini Başlat
          </button>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => {
            const imageUrl = `http://localhost:5001/analysis/uploads/${item.imageUrl}`;

            return (
              <div
                key={item._id}
                className="history-card"
                onClick={() => {
                  if (item.verdict !== "PENDING" && onViewAnalysis) {
                    onViewAnalysis(item._id, item.imageUrl);
                  } else if (item.verdict === "PENDING") {
                    toast.info("Bu analiz henüz tamamlanmamış.", {
                      theme: "dark",
                    });
                  }
                }}
                style={{
                  cursor: item.verdict !== "PENDING" ? "pointer" : "default",
                }}
              >
                <div className="history-card-image">
                  <img
                    src={imageUrl}
                    alt="Analiz edilen görsel"
                    onError={(e) => {
                      e.target.style.display = "none";
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = "flex";
                      }
                    }}
                  />
                  <div
                    className="history-image-placeholder"
                    style={{ display: "none" }}
                  >
                    <span>Görsel yüklenemedi</span>
                  </div>
                </div>

                <div className="history-card-content">
                  <div className="history-card-header">
                    <span
                      className={`status-badge ${item.verdict.toLowerCase()}`}
                    >
                      {item.verdict}
                    </span>
                    <span className="history-date">
                      {new Date(item.createdAt).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div className="history-card-body">
                    <p>
                      <strong>Güven Skoru:</strong> %{item.confidence || 0}
                    </p>
                    <p>
                      <strong>Model:</strong> {item.modelUsed}
                    </p>
                  </div>
                  {item.verdict === "PENDING" && (
                    <div className="pending-notice">
                      <span className="dot-animation"></span>
                      Analiz devam ediyor, sonuçlar yakında burada olacak.
                    </div>
                  )}
                  {item.verdict !== "PENDING" && (
                    <div className="view-analysis-hint">
                      <span>📊 Detayları görüntülemek için tıklayın</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AnalysisHistory;
