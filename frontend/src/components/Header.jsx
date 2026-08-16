import {
  FaBell,
  FaUserCircle,
  FaSearch,
  FaCalendarAlt,
  FaSignOutAlt,
} from "react-icons/fa";

import { useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();

  const today = new Date().toLocaleDateString("uz-UZ", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const handleLogout = () => {
    localStorage.removeItem("safe_home_logged_in");
    navigate("/login", { replace: true });
  };

  return (
    <header
      style={{
        height: "75px",
        background: "#fff",
        borderRadius: "15px",
        padding: "0 25px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 4px 12px rgba(0,0,0,.08)",
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            color: "#0F172A",
          }}
        >
          SAFE HOME SERVICES ERP
        </h2>

        <p
          style={{
            margin: "5px 0 0",
            color: "#64748B",
            fontSize: "14px",
          }}
        >
          <FaCalendarAlt style={{ marginRight: "8px" }} />
          {today}
        </p>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            background: "#F1F5F9",
            padding: "10px 15px",
            borderRadius: "10px",
          }}
        >
          <FaSearch color="#64748B" />

          <input
            type="text"
            placeholder="Qidirish..."
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: "14px",
              width: "180px",
            }}
          />
        </div>

        <FaBell
          size={20}
          color="#2563EB"
          style={{ cursor: "pointer" }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <FaUserCircle size={40} color="#2563EB" />

          <div>
            <div
              style={{
                fontWeight: "bold",
              }}
            >
              Administrator
            </div>

            <div
              style={{
                fontSize: "12px",
                color: "#64748B",
              }}
            >
              SAFE HOME
            </div>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Chiqish"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "none",
            background: "#FEE2E2",
            color: "#DC2626",
            padding: "10px 14px",
            borderRadius: "10px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          <FaSignOutAlt />
          Chiqish
        </button>
      </div>
    </header>
  );
}

export default Header;