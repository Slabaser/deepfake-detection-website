import React, { useState } from "react";
import api from "./api/axios";
import { toast } from "react-toastify";

function AuthModal({ modalType, onClose, onSwitch, onLoginSuccess }) {
  const isLogin = modalType === "login";

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";

    try {
      const response = await api.post(endpoint, formData);

      if (isLogin) {
        localStorage.setItem("token", response.data.access_token);
        localStorage.setItem("userEmail", formData.email);
        onLoginSuccess({ email: formData.email });
        toast.success("Giriş başarılı! Hoş geldiniz.");
      } else {
        toast.success("Hesabınız oluşturuldu! Şimdi giriş yapabilirsiniz.");
        onSwitch("login");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "İşlem başarısız oldu.";
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="modal-close-btn">
          &times;
        </button>

        <div className="modal-header">
          <h2>{isLogin ? "Giriş Yap" : "Hesap Oluştur"}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
            {isLogin
              ? "Sisteme erişmek için bilgilerinizi girin."
              : "Analiz yapabilmek için topluluğumuza katılın."}
          </p>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="form-group">
              <label htmlFor="fullName">Ad Soyad</label>
              <input
                type="text"
                id="fullName"
                placeholder="Adınız Soyadınız"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              type="email"
              id="email"
              placeholder="email@adresiniz.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Parola</label>
            <input
              type="password"
              id="password"
              placeholder="Parolanız"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className="modal-submit-btn" disabled={loading}>
            {loading
              ? "İşlem yapılıyor..."
              : isLogin
              ? "Giriş Yap"
              : "Kayıt Ol"}
          </button>
        </form>

        <div className="modal-footer">
          {isLogin ? (
            <p>
              Hesabınız yok mu?{" "}
              <span onClick={() => onSwitch("signup")}>Yeni hesap oluştur</span>
            </p>
          ) : (
            <p>
              Zaten hesabınız var mı?{" "}
              <span onClick={() => onSwitch("login")}>Giriş yap</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
