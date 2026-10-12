
import {
  FaBell,
  FaUserCircle,
  FaSearch,
  FaCalendarAlt,
  FaSignOutAlt,
  FaBars,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function Header({ onMenuClick = () => {} }) {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleLogout = () => {
    localStorage.removeItem("safe_home_logged_in");
    localStorage.removeItem("safe_home_token");
    navigate("/login", { replace: true });
  };

  return (
    <header className="erp-header">
      <div className="erp-header-left">
        <button
          type="button"
          className="erp-mobile-menu-button"
          onClick={onMenuClick}
          aria-label="Menyuni ochish"
          title="Menyu"
        >
          <FaBars />
        </button>

        <div className="erp-header-title">
          <h2>SAFE HOME SERVICES ERP</h2>
          <p>
            <FaCalendarAlt />
            <span>{today}</span>
          </p>
        </div>
      </div>

      <div className="erp-header-actions">
        <div className="erp-header-search">
          <FaSearch color="#64748B" />
          <input type="text" placeholder="Qidirish..." />
        </div>

        <button
          type="button"
          className="erp-header-bell"
          aria-label="Bildirishnomalar"
          title="Bildirishnomalar"
        >
          <FaBell />
        </button>

        <div className="erp-header-user">
          <FaUserCircle className="erp-header-avatar" />
          <div className="erp-header-user-info">
            <div className="erp-header-user-name">Administrator</div>
            <div className="erp-header-user-caption">SAFE HOME</div>
          </div>
        </div>

        <button
          type="button"
          className="erp-header-logout"
          onClick={handleLogout}
          title="Chiqish"
        >
          <FaSignOutAlt />
          <span>Chiqish</span>
        </button>
      </div>
    </header>
  );
}

export default Header;
