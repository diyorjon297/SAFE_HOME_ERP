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
import Finance from "./pages/Finance";
import Orders from "./pages/Orders";
import Warehouse from "./pages/Warehouse";
import Services from "./pages/Services";
import Expenses from "./pages/Expenses";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

// =====================================================
// LOGIN
// =====================================================

function Login() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
        alignItems: "center",
        justifyContent: "center",
        background: "#f1f5f9",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          padding: 32,
          borderRadius: 16,
          boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            textAlign: "center",
            marginBottom: 28,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#111827",
              fontWeight: 800,
            }}
          >
            SAFE HOME
          </h2>

          <p
            style={{
              marginTop: 6,
              color: "#64748b",
            }}
          >
            SERVICES ERP
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <label
            style={{
              display: "block",
              marginBottom: 7,
              fontWeight: 600,
            }}
          >
            Login
          </label>

          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Loginni kiriting"
            autoComplete="username"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 12,
              marginBottom: 16,
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              fontSize: 15,
              outline: "none",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: 7,
              fontWeight: 600,
            }}
          >
            Parol
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Parolni kiriting"
            autoComplete="current-password"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: 12,
              marginBottom: 16,
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              fontSize: 15,
              outline: "none",
            }}
          />

          {error && (
            <div
              style={{
                color: "#dc2626",
                background: "#fee2e2",
                padding: 10,
                borderRadius: 8,
                marginBottom: 15,
                textAlign: "center",
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
              padding: 13,
              border: "none",
              borderRadius: 10,
              background: loading ? "#94a3b8" : "#2563eb",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>
      </div>
    </div>
  );
}

// =====================================================
// PROTECTED ROUTE
// =====================================================

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("safe_home_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// =====================================================
// APP
// =====================================================

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/login"
          element={<Login />}
        />

        {/* MAIN ERP */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >

          {/* DASHBOARD */}
          <Route
            index
            element={<Dashboard />}
          />

          {/* MIJOZLAR */}
          <Route
            path="customers"
            element={<Customers />}
          />

          <Route
            path="customers/:id"
            element={<CustomerDetail />}
          />

          {/* MAHSULOTLAR */}
          <Route
            path="products"
            element={<Products />}
          />

          {/* SAVDO */}
          <Route
            path="sales"
            element={<Sales />}
          />

          {/* QARZLAR */}
          <Route
            path="debts"
            element={<Debts />}
          />

          {/* MOLIYA */}
          <Route
            path="finance"
            element={<Finance />}
          />

          {/* BUYURTMALAR */}
          <Route
            path="orders"
            element={<Orders />}
          />

          {/* OMBOR */}
          <Route
            path="warehouse"
            element={<Warehouse />}
          />

          {/* XIZMATLAR */}
          <Route
            path="services"
            element={<Services />}
          />

          {/* XARAJATLAR */}
          <Route
            path="expenses"
            element={<Expenses />}
          />

          {/* HISOBOTLAR */}
          <Route
            path="reports"
            element={<Reports />}
          />

          {/* SOZLAMALAR */}
          <Route
            path="settings"
            element={<Settings />}
          />

        </Route>

        {/* NOT FOUND */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}