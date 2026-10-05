import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";

import API from "./api";
import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetails";
import Products from "./pages/Products";
import Sales from "./pages/Sales";
import Debts from "./pages/Debts";
import Moliya from "./pages/Moliya";
import Orders from "./pages/Orders";
import Warehouse from "./pages/Warehouse";
import Cameras from "./pages/Cameras";
import Services from "./pages/Services";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Inquiries from "./pages/Inquiries";
import DailyOperations from "./pages/DailyOperations";
import Objects from "./pages/Objects";
import Employees from "./pages/Employees";


function Login() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await API.post("/auth/login", {
        login,
        password,
      });

      const token = response.data?.token;

      if (!token) {
        throw new Error("Token kelmadi");
      }

      localStorage.setItem("safe_home_token", token);
      localStorage.setItem("safe_home_logged_in", "true");

      navigate("/", { replace: true });
    } catch (err) {
      console.error("Login xatosi:", err);

      if (err.response?.status === 401) {
        setError("Login yoki parol noto'g'ri");
      } else {
        setError(
          err.response?.data?.detail ||
          "Server bilan bog'lanishda xato"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background:
          "linear-gradient(135deg, #07111f 0%, #0b1d35 50%, #123c69 100%)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Fon effektlari */}
      <div
        style={{
          position: "absolute",
          width: 500,
          height: 500,
          borderRadius: "50%",
          background: "rgba(37,99,235,0.18)",
          filter: "blur(80px)",
          top: -180,
          left: -120,
        }}
      />

      <div
        style={{
          position: "absolute",
          width: 450,
          height: 450,
          borderRadius: "50%",
          background: "rgba(14,165,233,0.13)",
          filter: "blur(90px)",
          bottom: -180,
          right: -100,
        }}
      />

      {/* Chap tomon */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          color: "white",
          position: "relative",
          zIndex: 1,
        }}
      >
        <div style={{ maxWidth: 600 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 30,
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                borderRadius: 16,
                background:
                  "linear-gradient(135deg,#2563eb,#0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 30,
                boxShadow:
                  "0 10px 35px rgba(37,99,235,.35)",
              }}
            >
              🏠
            </div>

            <div>
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 900,
                  letterSpacing: 1,
                }}
              >
                SAFE HOME
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "#93c5fd",
                  letterSpacing: 3,
                  fontWeight: 600,
                }}
              >
                SERVICES
              </div>
            </div>
          </div>

          <h1
            style={{
              fontSize: "clamp(38px,5vw,64px)",
              lineHeight: 1.05,
              margin: 0,
              fontWeight: 900,
              letterSpacing: -2,
            }}
          >
            Biznesingizni
            <br />
            <span style={{ color: "#60a5fa" }}>
              bir joydan
            </span>{" "}
            boshqaring.
          </h1>

          <p
            style={{
              fontSize: 18,
              lineHeight: 1.7,
              color: "#cbd5e1",
              maxWidth: 520,
              marginTop: 25,
            }}
          >
            Kamera, domofon, ombor, mijozlar,
            buyurtmalar va moliyani boshqarish
            uchun yagona ERP tizim.
          </p>

          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              marginTop: 30,
            }}
          >
            {[
              "📷 Videokuzatuv",
              "📦 Ombor",
              "💰 Moliya",
              "👥 Mijozlar",
            ].map((item) => (
              <div
                key={item}
                style={{
                  padding: "10px 15px",
                  borderRadius: 12,
                  background: "rgba(255,255,255,.07)",
                  border:
                    "1px solid rgba(255,255,255,.1)",
                  color: "#e2e8f0",
                  fontSize: 13,
                }}
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Login */}
      <div
        style={{
          width: "min(480px, 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 30,
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 410,
            background: "rgba(255,255,255,.97)",
            borderRadius: 24,
            padding: 38,
            boxSizing: "border-box",
            boxShadow:
              "0 30px 80px rgba(0,0,0,.3)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                margin: "0 auto 18px",
                borderRadius: 20,
                background:
                  "linear-gradient(135deg,#2563eb,#0ea5e9)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 36,
                boxShadow:
                  "0 12px 30px rgba(37,99,235,.3)",
              }}
            >
              🔐
            </div>

            <h2
              style={{
                margin: 0,
                fontSize: 27,
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              Tizimga kirish
            </h2>

            <p
              style={{
                marginTop: 8,
                marginBottom: 0,
                color: "#64748b",
                fontSize: 14,
              }}
            >
              SAFE HOME SERVICES ERP
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <label
              style={{
                display: "block",
                marginBottom: 8,
                color: "#334155",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Login
            </label>

            <div
              style={{
                position: "relative",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: 13,
                  fontSize: 18,
                }}
              >
                👤
              </span>

              <input
                type="text"
                value={login}
                onChange={(e) =>
                  setLogin(e.target.value)
                }
                placeholder="Loginni kiriting"
                autoComplete="username"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "13px 14px 13px 45px",
                  border:
                    "1px solid #dbe2ea",
                  borderRadius: 12,
                  fontSize: 15,
                  outline: "none",
                  background: "#f8fafc",
                }}
              />
            </div>

            <label
              style={{
                display: "block",
                marginBottom: 8,
                color: "#334155",
                fontWeight: 700,
                fontSize: 14,
              }}
            >
              Parol
            </label>

            <div
              style={{
                position: "relative",
                marginBottom: 18,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  left: 14,
                  top: 13,
                  fontSize: 18,
                }}
              >
                🔑
              </span>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                placeholder="Parolni kiriting"
                autoComplete="current-password"
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding:
                    "13px 48px 13px 45px",
                  border:
                    "1px solid #dbe2ea",
                  borderRadius: 12,
                  fontSize: 15,
                  outline: "none",
                  background: "#f8fafc",
                }}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                style={{
                  position: "absolute",
                  right: 10,
                  top: 8,
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 19,
                  padding: 5,
                }}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>

            {error && (
              <div
                style={{
                  color: "#b91c1c",
                  background: "#fef2f2",
                  border:
                    "1px solid #fecaca",
                  padding: 12,
                  borderRadius: 10,
                  marginBottom: 16,
                  textAlign: "center",
                  fontSize: 14,
                  fontWeight: 600,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: 14,
                border: "none",
                borderRadius: 12,
                background: loading
                  ? "#94a3b8"
                  : "linear-gradient(135deg,#2563eb,#0ea5e9)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 16,
                cursor: loading
                  ? "not-allowed"
                  : "pointer",
                boxShadow: loading
                  ? "none"
                  : "0 10px 25px rgba(37,99,235,.25)",
              }}
            >
              {loading
                ? "Kirilmoqda..."
                : "Kirish →"}
            </button>
          </form>

          <div
            style={{
              textAlign: "center",
              marginTop: 25,
              paddingTop: 18,
              borderTop:
                "1px solid #e2e8f0",
              color: "#94a3b8",
              fontSize: 12,
            }}
          >
            SAFE HOME SERVICES
            <br />
            ERP System • Version 1.0
          </div>
        </div>
      </div>
    </div>
  );
}


function ProtectedRoute({ children }) {
  const token = localStorage.getItem(
    "safe_home_token"
  );

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}


export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Dashboard />}
          />

          <Route
            path="objects"
            element={<Objects />}
          />

          <Route
            path="employees"
            element={<Employees />}
          />

          <Route
            path="customers"
            element={<Customers />}
          />

          <Route
            path="customers/:id"
            element={<CustomerDetail />}
          />

          <Route
            path="products"
            element={<Products />}
          />

          <Route
            path="cameras"
            element={<Cameras />}
          />

          <Route
            path="sales"
            element={<Sales />}
          />

          <Route
            path="debts"
            element={<Debts />}
          />

          <Route
            path="finance"
            element={<Moliya />}
          />

          <Route
            path="orders"
            element={<Orders />}
          />

          <Route
            path="daily-operations"
            element={<DailyOperations />}
          />

          <Route
            path="inquiries"
            element={<Inquiries />}
          />

          <Route
            path="warehouse"
            element={<Warehouse />}
          />

          <Route
            path="services"
            element={<Services />}
          />

          <Route
            path="expenses"
            element={<Expenses />}
          />

          <Route
            path="reports"
            element={<Reports />}
          />

          <Route
            path="settings"
            element={<Settings />}
          />
        </Route>

        <Route
          path="*"
          element={
            <Navigate
              to="/"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}


