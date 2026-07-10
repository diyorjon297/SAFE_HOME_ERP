import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaClipboardList,
  FaWarehouse,
  FaTools,
  FaMoneyBillWave,
  FaChartBar,
  FaCog,
  FaShieldAlt,
} from "react-icons/fa";

const menu = [
  { title: "Dashboard", path: "/", icon: <FaHome /> },
  { title: "Mijozlar", path: "/customers", icon: <FaUsers /> },
  { title: "Mahsulotlar", path: "/products", icon: <FaBoxOpen /> },
  { title: "Sotuvlar", path: "/sales", icon: <FaShoppingCart /> },
  { title: "Buyurtmalar", path: "/orders", icon: <FaClipboardList /> },
  { title: "Ombor", path: "/warehouse", icon: <FaWarehouse /> },
  { title: "Servis", path: "/services", icon: <FaTools /> },
  { title: "Xarajatlar", path: "/expenses", icon: <FaMoneyBillWave /> },
  { title: "Hisobotlar", path: "/reports", icon: <FaChartBar /> },
  { title: "Sozlamalar", path: "/settings", icon: <FaCog /> },
];

function Sidebar() {
  return (
    <aside
      style={{
        width: "260px",
        minHeight: "100vh",
        background: "#0F172A",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        boxShadow: "2px 0 10px rgba(0,0,0,0.15)",
      }}
    >
      <div
        style={{
          padding: "25px",
          borderBottom: "1px solid #334155",
          textAlign: "center",
        }}
      >
        <FaShieldAlt size={42} color="#38BDF8" />

        <h2
          style={{
            marginTop: "10px",
            marginBottom: "5px",
          }}
        >
          SAFE HOME
        </h2>

        <p
          style={{
            fontSize: "13px",
            color: "#94A3B8",
            margin: 0,
          }}
        >
          SERVICES ERP
        </p>
      </div>

      <div
        style={{
          flex: 1,
          padding: "20px 15px",
        }}
      >
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "14px",
              padding: "14px 18px",
              marginBottom: "10px",
              borderRadius: "12px",
              textDecoration: "none",
              color: "#fff",
              background: isActive ? "#2563EB" : "transparent",
              fontWeight: isActive ? "700" : "500",
              transition: "0.25s",
            })}
          >
            <span style={{ fontSize: "18px" }}>{item.icon}</span>
            <span>{item.title}</span>
          </NavLink>
        ))}
      </div>

      <div
        style={{
          padding: "18px",
          borderTop: "1px solid #334155",
          textAlign: "center",
          color: "#94A3B8",
          fontSize: "12px",
        }}
      >
        SAFE HOME SERVICES ERP
        <br />
        Version 1.0
      </div>
    </aside>
  );
}

export default Sidebar;