import {
  FaHome,
  FaUsers,
  FaBuilding,
  FaWarehouse,
  FaMoneyBillWave,
  FaClipboardList,
  FaChartBar,
  FaCog,
  FaShieldAlt,
  FaReceipt,
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

const menu = [
  {
    title: "Dashboard",
    path: "/",
    icon: <FaHome />,
  },
  {
    title: "Obyektlar",
    path: "/objects",
    icon: <FaBuilding />,
  },
  {
    title: "Mijozlar",
    path: "/customers",
    icon: <FaUsers />,
  },
  {
    title: "Ombor",
    path: "/warehouse",
    icon: <FaWarehouse />,
  },
  {
    title: "Moliya",
    path: "/finance",
    icon: <FaMoneyBillWave />,
  },
  {
    title: "Xarajatlar",
    path: "/expenses",
    icon: <FaReceipt />,
  },
  {
    title: "Buyurtmalar",
    path: "/orders",
    icon: <FaClipboardList />,
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

export default function Sidebar() {
  return (
    <aside
      style={{
        width: "275px",
        minWidth: "275px",
        height: "100vh",
        background:
          "linear-gradient(180deg, #07111f 0%, #0b1b30 45%, #0d2238 100%)",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        left: 0,
        overflow: "hidden",
        borderRight: "1px solid rgba(56,189,248,0.18)",
        boxShadow: "10px 0 35px rgba(2,12,27,0.35)",
        zIndex: 100,
      }}
    >
      {/* LOGO */}
      <div
        style={{
          padding: "22px 19px 20px",
          borderBottom: "1px solid rgba(148,163,184,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "13px",
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              minWidth: "50px",
              borderRadius: "15px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, #06b6d4 0%, #2563eb 55%, #4f46e5 100%)",
              boxShadow: "0 8px 28px rgba(37,99,235,0.42)",
            }}
          >
            <FaShieldAlt size={26} color="#ffffff" />
          </div>

          <div>
            <div
              style={{
                fontSize: "20px",
                fontWeight: 850,
                letterSpacing: "0.6px",
                lineHeight: 1.1,
                color: "#ffffff",
              }}
            >
              SAFE HOME
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#38bdf8",
                fontSize: "10px",
                fontWeight: 800,
                letterSpacing: "2.2px",
              }}
            >
              SERVICES ERP
            </div>
          </div>
        </div>
      </div>

      {/* MENU */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "18px 12px",
          scrollbarWidth: "thin",
          scrollbarColor: "#2563eb transparent",
        }}
      >
        <div
          style={{
            padding: "0 11px 11px",
            color: "#64748b",
            fontSize: "10px",
            fontWeight: 800,
            letterSpacing: "1.8px",
          }}
        >
          ASOSIY MENYU
        </div>

        {menu.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "13px",
              height: "52px",
              padding: "0 11px",
              marginBottom: "7px",
              borderRadius: "13px",
              textDecoration: "none",

              color: isActive ? "#ffffff" : "#a8b7ca",

              background: isActive
                ? "linear-gradient(90deg, #2563eb 0%, #1d4ed8 55%, #4338ca 100%)"
                : "rgba(15,23,42,0.28)",

              border: isActive
                ? "1px solid rgba(96,165,250,0.38)"
                : "1px solid rgba(148,163,184,0.04)",

              boxShadow: isActive
                ? "0 8px 22px rgba(37,99,235,0.32)"
                : "none",

              fontWeight: isActive ? 700 : 550,

              transition: "all 0.18s ease",
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  style={{
                    width: "38px",
                    height: "38px",
                    minWidth: "38px",
                    borderRadius: "11px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "17px",
                    color: isActive ? "#ffffff" : "#7dd3fc",
                    background: isActive
                      ? "rgba(255,255,255,0.16)"
                      : "rgba(14,165,233,0.09)",
                    border: isActive
                      ? "1px solid rgba(255,255,255,0.10)"
                      : "1px solid rgba(56,189,248,0.07)",
                  }}
                >
                  {item.icon}
                </span>

                <span
                  style={{
                    fontSize: "14.5px",
                    letterSpacing: "0.15px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {item.title}
                </span>

                {isActive && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: "7px",
                      height: "7px",
                      borderRadius: "50%",
                      background: "#ffffff",
                      boxShadow: "0 0 12px rgba(255,255,255,0.95)",
                    }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* STATUS */}
      <div
        style={{
          margin: "0 12px 11px",
          padding: "12px 13px",
          borderRadius: "13px",
          background:
            "linear-gradient(135deg, rgba(15,23,42,0.75), rgba(14,116,144,0.12))",
          border: "1px solid rgba(56,189,248,0.12)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span
            style={{
              width: "9px",
              height: "9px",
              minWidth: "9px",
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 12px rgba(34,197,94,0.8)",
            }}
          />

          <div>
            <div
              style={{
                color: "#e2e8f0",
                fontSize: "12px",
                fontWeight: 750,
              }}
            >
              Tizim faol
            </div>

            <div
              style={{
                color: "#64748b",
                fontSize: "9px",
                marginTop: "3px",
              }}
            >
              SAFE HOME ERP
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          padding: "12px 14px 16px",
          textAlign: "center",
          borderTop: "1px solid rgba(148,163,184,0.10)",
          color: "#475569",
          fontSize: "9px",
          lineHeight: 1.5,
        }}
      >
        <div
          style={{
            color: "#64748b",
            fontWeight: 700,
            letterSpacing: "0.5px",
          }}
        >
          SAFE HOME SERVICES
        </div>

        <div style={{ marginTop: "3px" }}>
          ERP System • Version 1.0
        </div>
      </div>
    </aside>
  );
}