import { NavLink } from "react-router-dom";

import {
  FaHome,
  FaUsers,
  FaBoxOpen,
  FaVideo,
  FaShoppingCart,
  FaClipboardList,
  FaWarehouse,
  FaTools,
  FaMoneyBillWave,
  FaChartBar,
  FaCog,
  FaShieldAlt,
  FaHandHoldingUsd,
} from "react-icons/fa";

const menu = [
  {
    title: "Dashboard",
    path: "/",
    icon: <FaHome />,
  },

  {
    title: "Mijozlar",
    path: "/customers",
    icon: <FaUsers />,
  },

  {
    title: "Mahsulotlar",
    path: "/products",
    icon: <FaBoxOpen />,
  },

  {
    title: "Kameralar",
    path: "/cameras",
    icon: <FaVideo />,
  },

  {
    title: "Sotuvlar",
    path: "/sales",
    icon: <FaShoppingCart />,
  },

  {
    title: "Qarzlar",
    path: "/debts",
    icon: <FaHandHoldingUsd />,
  },

  {
    title: "Moliya",
    path: "/finance",
    icon: <FaMoneyBillWave />,
  },

  {
    title: "Buyurtmalar",
    path: "/orders",
    icon: <FaClipboardList />,
  },

  {
    title: "Ombor",
    path: "/warehouse",
    icon: <FaWarehouse />,
  },

  {
    title: "Servis",
    path: "/services",
    icon: <FaTools />,
  },

  {
    title: "Xarajatlar",
    path: "/expenses",
    icon: <FaMoneyBillWave />,
  },

  {
    title: "Hisobotlar",
    path: "/reports",
    icon: <FaChartBar />,
  },

  {
    title: "Sozlamalar",
    path: "/settings",
    icon: <FaCog />,
  },
];

function Sidebar() {
  return (
    <aside
      style={{
        width: "260px",
        minWidth: "260px",
        height: "100vh",
        background: "#0F172A",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 20px rgba(0,0,0,.25)",
        position: "sticky",
        top: 0,
      }}
    >
      <div
        style={{
          padding: "25px",
          textAlign: "center",
          borderBottom: "1px solid #334155",
        }}
      >
        <FaShieldAlt
          size={46}
          color="#38BDF8"
        />

        <h2
          style={{
            marginTop: 12,
            marginBottom: 5,
          }}
        >
          SAFE HOME
        </h2>

        <p
          style={{
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
          overflowY: "auto",
          padding: "15px",
        }}
      >
        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "15px",
              padding: "14px 16px",
              marginBottom: "10px",
              borderRadius: "12px",
              textDecoration: "none",
              color: "#fff",
              background: isActive
                ? "#2563EB"
                : "transparent",
              transition: "0.2s",
              fontWeight: 500,
            })}
          >
            <span
              style={{
                fontSize: "20px",
              }}
            >
              {item.icon}
            </span>

            <span>
              {item.title}
            </span>
          </NavLink>
        ))}
      </div>

      <div
        style={{
          padding: "18px",
          textAlign: "center",
          borderTop: "1px solid #334155",
          color: "#94A3B8",
          fontSize: "14px",
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