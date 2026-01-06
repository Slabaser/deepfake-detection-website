import React, { useState, useRef, useEffect } from "react";

function Navbar({ onLoginClick, isLoggedIn, user, onLogout, onViewChange }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownTimeoutRef = useRef(null);
  const wrapperRef = useRef(null);

  const handlePageChange = (pageName) => {
    onViewChange(pageName);
    setShowDropdown(false);
  };

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowDropdown(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className="navbar">
      <div className="nav-left">
        <span
          className="nav-logo"
          onClick={() => handlePageChange("home")}
          style={{ cursor: "pointer" }}
        >
          Deepfake Detector
        </span>
        <a
          href="#info"
          className="nav-link"
          onClick={() => handlePageChange("home")}
        >
          Daha Fazla Bilgi
        </a>
      </div>

      <div className="nav-right">
        {!isLoggedIn ? (
          <button onClick={onLoginClick} className="nav-button">
            Giriş Yap
          </button>
        ) : (
          <div
            ref={wrapperRef}
            className="user-menu-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="user-account-trigger">
              <div className="user-avatar">{user?.email[0].toUpperCase()}</div>
              <span className="user-name-text">Hesabım</span>
            </div>

            {showDropdown && (
              <div 
                className="dropdown-menu"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div
                  className="dropdown-item"
                  onClick={() => handlePageChange("history")}
                >
                  Geçmiş Analizlerim
                </div>
                <div
                  className="dropdown-item"
                  onClick={() => handlePageChange("profile")}
                >
                  Profil Ayarları
                </div>
                <div className="dropdown-divider"></div>
                <div className="dropdown-item logout-item" onClick={onLogout}>
                  Çıkış Yap
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
