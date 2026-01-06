import React from 'react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>
          <strong>Deepfake Detector</strong> | Bu platform, "Görsel İçeriklerde Deepfake Tespiti İçin Yapay Zekâ Tabanlı Web Platform Geliştirilmesi" başlıklı lisans tezi kapsamında geliştirilmektedir.
        </p>
        <p>
          &copy; {new Date().getFullYear()} Emine Sıla BAŞER. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}

export default Footer;