import React, { useState, useEffect } from "react";
import api from "./api/axios";
import { toast } from "react-toastify";

function ProfileSettings({ user, onBack }) {
  const [fullName, setFullName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.patch("/auth/update-profile", {
        fullName,
        currentPassword,
        newPassword,
      });
      toast.success("Profil başarıyla güncellendi!");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Güncelleme başarısız.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="history-header">
        <div>
          <h2 className="section-title">Profil Ayarları</h2>
          <p className="section-subtitle">
            Hesap bilgilerinizi buradan yönetebilirsiniz.
          </p>
        </div>
        <button className="nav-button" onClick={() => onBack("home")}>
          Ana Sayfaya Dön
        </button>
      </div>

      <div className="content-card profile-card">
        <form onSubmit={handleUpdateProfile} className="modal-form">
          <div className="form-group">
            <label>E-posta (Değiştirilemez)</label>
            <input
              type="text"
              value={user?.email}
              disabled
              style={{ opacity: 0.6 }}
            />
          </div>

          <div className="form-group">
            <label>Ad Soyad</label>
            <input
              type="text"
              placeholder="Yeni Ad Soyad"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <hr className="dropdown-divider" style={{ margin: "20px 0" }} />
          <h3 style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
            Parola Değiştir
          </h3>

          <div className="form-group">
            <label>Mevcut Parola</label>
            <input
              type="password"
              placeholder="Şu anki parolanız"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Yeni Parola</label>
            <input
              type="password"
              placeholder="Yeni parolanız"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="modal-submit-btn" disabled={loading}>
            {loading ? "Güncelleniyor..." : "Bilgileri Kaydet"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSettings;
