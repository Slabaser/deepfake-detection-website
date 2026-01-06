import React, { useState } from 'react';

import faceSwapImage from './assets/celebrity-face-swap-3.jpg'; 
import lipSyncImage from './assets/MOuK8L3sGAOZjut5.webp';   
import ganImage from './assets/fakephoto1.jpeg';       
import catfishingImage from './assets/7d77b274-fc40-4ada-8d90-33894c85838c.webp'; 
import voiceCloneImage from './assets/Depositphotos_250830158_XL-scaled.jpg'; 

const faqData = [
  {
    id: 1,
    question: "Bu platform hangi modelleri kullanıyor?",
    answer: "Platform, 4 farklı yapay zekâ modeli kullanmaktadır: (1) Xception - depthwise separable convolutions ile yüksek performans, (2) EfficientNet-B4 - verimli ölçekleme teknolojisi, (3) ResNet50 - residual connections ile derin öğrenme, ve (4) CLIP ViT-L/4 - zero-shot öğrenme ile görsel-dil eşleştirmesi. Her modelin sonuçları, performanslarına göre ağırlıklandırılarak birleştirilir."
  },
  {
    id: 2,
    question: "Modelin kararına nasıl güvenebilirim?",
    answer: "Platform, Açıklanabilir Yapay Zekâ (XAI) tekniklerini kullanır. Her analiz sonucunda, modelin görselin hangi bölgelerine odaklandığını gösteren Grad-CAM ısı haritası (heatmap) sunulur. Ayrıca, 4 farklı modelin ayrı ayrı sonuçlarını ve güven skorlarını görebilir, ağırlıklı ortalama ile nihai kararı inceleyebilirsiniz. Bu şeffaflık, model kararlarının güvenilirliğini artırır."
  },
  {
    id: 4,
    question: "Analiz sonuçları %100 güvenilir mi?",
    answer: "Hiçbir yapay zekâ modeli %100 doğruluk garantisi veremez. Bu platform, akademik bir tez çalışması kapsamında geliştirilmiş bir prototiptir. Sonuçlar, modellerin eğitildiği veri setlerine dayanarak yaptığı en iyi tahminleri gösterir. Önemli kararlar için sonuçları sadece bir referans olarak kullanmanız ve gerekirse uzman görüşü almanız önerilir."
  },
  {
    id: 5,
    question: "Görsellerim güvende mi? Gizlilik nasıl sağlanıyor?",
    answer: "Yüklediğiniz görseller sadece analiz amacıyla kullanılır ve güvenli bir şekilde saklanır. Görselleriniz üçüncü taraflarla paylaşılmaz. Analiz sonrası istediğiniz zaman geçmiş analizlerinizden görsellerinizi silebilirsiniz. Platform, kullanıcı kimlik doğrulama sistemi ile korunmaktadır ve sadece kayıtlı kullanıcılar analiz yapabilir."
  },
  {
    id: 6,
    question: "Analiz ne kadar sürer?",
    answer: "Analiz süresi, görselin boyutuna ve sunucu yüküne bağlı olarak değişir. Genellikle 4 modelin çalışması ve Grad-CAM görselleştirmesi ile birlikte birkaç saniye içinde tamamlanır."
  },
];


function HomepageContent() {
  const [openFaqId, setOpenFaqId] = useState(null);

  const toggleFaq = (id) => {
    if (openFaqId === id) {
      setOpenFaqId(null);
    } else {
      setOpenFaqId(id);
    }
  };

  return (
    <div className="homepage-content" id="info">
      <section className="content-section">
        <h2 className="section-title">Deepfake Sadece Yüz Değiştirme Değildir</h2>
        <p className="section-subtitle">
          Bu teknoloji, farklı formlarda karşınıza çıkabilir.
        </p>
        <div className="card-grid">
          
          <div className="content-card">
            <img src={faceSwapImage} alt="Face Swap" className="card-image" />
            <h3>Face Swap (Yüz Değiştirme)</h3>
            <p>Bir kişinin yüzünün hedef videodaki başka bir kişinin yüzüyle değiştirilmesi. Siyasi veya ünlü kişileri taklit etmede sıkça kullanılır.</p>
          </div>
          
          <div className="content-card">
            <img src={lipSyncImage} alt="Lip Sync" className="card-image" />
            <h3>Lip Sync (Dudak Senkronizasyonu)</h3>
            <p>Bir kişinin mevcut videosu üzerine, o kişinin söylemediği sözleri söylüyormuş gibi dudak hareketlerinin yeniden sentezlenmesi.</p>
          </div>
          
          <div className="content-card">
            <img src={ganImage} alt="GAN ve Diffusion" className="card-image" />
            <h3>GAN & Diffusion Modelleri</h3>
            <p>Var olmayan, tamamen yapay zekâ tarafından (GAN veya DALL-E, Midjourney gibi diffusion modelleri) üretilmiş sahte yüzler ve görseller.</p>
          </div>
          
          <div className="content-card">
            <img src={catfishingImage} alt="Catfishing" className="card-image" />
            <h3>Catfishing & Sosyal Medya</h3>
            <p>Başkalarının fotoğraflarını veya videolarını kullanarak sahte sosyal medya profilleri oluşturma ve dolandırıcılık vakaları.</p>
          </div>

          <div className="content-card">
            <img src={voiceCloneImage} alt="Ses Klonlama" className="card-image" />
            <h3>Ses Klonlama (Voice Cloning)</h3>
            <p>Yapay zekâ, bir kişinin sesini sadece birkaç saniyelik bir örnekle klonlayabilir ve istenilen metni o kişinin sesiyle okuyabilir.</p>
          </div>

        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title">Platform Nasıl Çalışır?</h2>
        <p className="section-subtitle">
          Yapay zekâ modellerimiz, görsellerinizi analiz ederek deepfake içerikleri tespit eder.
        </p>
        <div className="how-it-works-grid">
          <div className="how-it-works-card">
            <div className="step-number">1</div>
            <h3>Görsel Yükleme</h3>
            <p>Analiz etmek istediğiniz görseli platforma yükleyin. Sistem JPG, PNG ve JPEG formatlarını destekler.</p>
          </div>
          <div className="how-it-works-card">
            <div className="step-number">2</div>
            <h3>Çoklu Model Analizi</h3>
            <p>Görseliniz 4 farklı AI modeli tarafından analiz edilir: Xception, EfficientNet-B4, ResNet50 ve CLIP ViT-L/4.</p>
          </div>
          <div className="how-it-works-card">
            <div className="step-number">3</div>
            <h3>Ağırlıklı Ortalama</h3>
            <p>Her modelin sonuçları, performanslarına göre ağırlıklandırılarak birleştirilir ve nihai karar verilir.</p>
          </div>
          <div className="how-it-works-card">
            <div className="step-number">4</div>
            <h3>Grad-CAM Görselleştirme</h3>
            <p>Modelin görselin hangi bölgelerine odaklandığını gösteren ısı haritası ile sonuçlar açıklanabilir hale getirilir.</p>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title">Deepfake'in Tehlikeleri</h2>
        <p className="section-subtitle">
          Bu teknoloji kötüye kullanıldığında ciddi sonuçlar doğurabilir.
        </p>
        <div className="dangers-grid">
          <div className="danger-card">
            <div className="danger-icon">⚠️</div>
            <h3>Sahte Haberler</h3>
            <p>Siyasi liderler veya ünlülerin söylemedikleri sözleri söylüyormuş gibi gösterilmesi, toplumsal manipülasyona yol açabilir.</p>
          </div>
          <div className="danger-card">
            <div className="danger-icon">🔒</div>
            <h3>Kimlik Hırsızlığı</h3>
            <p>Sahte videolar kullanılarak finansal dolandırıcılık veya kimlik avı saldırıları gerçekleştirilebilir.</p>
          </div>
          <div className="danger-card">
            <div className="danger-icon">⚖️</div>
            <h3>Yasal Sorunlar</h3>
            <p>Deepfake içerikler, iftira, hakaret ve telif hakkı ihlalleri gibi yasal sorunlara yol açabilir.</p>
          </div>
        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title">Etik Kullanım ve Sorumluluk</h2>
        <div className="ethics-content">
          <div className="ethics-card">
            <h3>✅ Doğru Kullanım</h3>
            <ul>
              <li>Kendi görsellerinizi analiz etmek</li>
              <li>Eğitim ve araştırma amaçlı kullanım</li>
              <li>İçerik doğrulama ve fact-checking</li>
              <li>Medya ve gazetecilik alanında kullanım</li>
            </ul>
          </div>
          <div className="ethics-card">
            <h3>❌ Yanlış Kullanım</h3>
            <ul>
              <li>Başkalarının görsellerini izinsiz analiz etmek</li>
              <li>Kişisel verilerin kötüye kullanılması</li>
              <li>Toplumsal manipülasyon amaçlı kullanım</li>
              <li>Yasal olmayan içerik üretimi</li>
            </ul>
          </div>
        </div>
        <div className="privacy-notice">
          <h4>🔐 Gizlilik ve Güvenlik</h4>
          <p>
            Yüklediğiniz görseller sadece analiz amacıyla kullanılır ve güvenli bir şekilde saklanır. 
            Görselleriniz üçüncü taraflarla paylaşılmaz ve analiz sonrası istediğiniz zaman silinebilir.
          </p>
        </div>
      </section>

      <section className="content-section">
        <h2 className="section-title">Sıkça Sorulan Sorular (SSS)</h2>
        <div className="faq-list">
          
          {faqData.map((faq) => (
            <div 
              className={`faq-item ${openFaqId === faq.id ? 'active' : ''}`} 
              key={faq.id}
              onClick={() => toggleFaq(faq.id)}
            >
              <h3 className="faq-question">
                {faq.question}
                <span className="faq-icon"></span>
              </h3>
              <p className="faq-answer">{faq.answer}</p>
            </div>
          ))}

        </div>
      </section>
    </div>
  );
}

export default HomepageContent;