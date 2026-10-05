import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import API from "../api";

function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    unit: "dona",
    sale_price: "",
    cost_price: "",
    category: "",
    description: "",
  });

  const loadServices = async () => {
    try {
      setLoading(true);
      const response = await API.get("/services/");
      setServices(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Xizmatlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const addService = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      setError("Xizmat nomini kiriting");
      return;
    }

    try {
      await API.post("/services/", {
        name: form.name,
        unit: form.unit,
        sale_price: Number(form.sale_price || 0),
        cost_price: Number(form.cost_price || 0),
        category: form.category || null,
        description: form.description || null,
      });

      setForm({
        name: "",
        unit: "dona",
        sale_price: "",
        cost_price: "",
        category: "",
        description: "",
      });

      setShowForm(false);
      setError("");
      await loadServices();
    } catch (err) {
      console.error(err);
      setError("Xizmatni saqlashda xatolik");
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Bu xizmatni o‘chirishni xohlaysizmi?")) return;

    try {
      await API.delete(`/services/${id}`);
      await loadServices();
    } catch (err) {
      console.error(err);
      setError("Xizmatni o‘chirishda xatolik");
    }
  };


  // =========================
  // EXCEL EXPORT
  // =========================

  const exportServicesExcel = () => {

    if (!services.length) {
      alert("Eksport qilish uchun xizmatlar mavjud emas");
      return;
    }

    const data = services.map((service, index) => ({
      "№": index + 1,
      ID: service.id || "",
      "Xizmat nomi": service.name || "",
      Birlik: service.unit || "",
      "Sotuv narxi": Number(service.sale_price || 0),
      Tannarx: Number(service.cost_price || 0),
      Foyda: Number(
        service.profit ||
        Number(service.sale_price || 0) -
        Number(service.cost_price || 0)
      ),
      Kategoriya: service.category || "",
      Tavsif: service.description || "",
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Xizmatlar"
    );

    XLSX.writeFile(
      workbook,
      "Xizmatlar.xlsx"
    );
  };
  const formatMoney = (value) =>
    Number(value || 0).toLocaleString("uz-UZ") + " so‘m";

  return (
    <div style={page}>
      <div style={header}>
        <div>
          <h1 style={title}>Xizmatlar</h1>
          <p style={subtitle}>
            Xizmatlar katalogi va narxlarini boshqarish
          </p>
        </div>

        <button
          style={{
            ...addButton,
            background: "#15803d",
            marginRight: "10px",
          }}
          onClick={exportServicesExcel}
        >
          Excel
        </button>
        <button style={addButton} onClick={() => setShowForm(!showForm)}>
          {showForm ? "✕ Yopish" : "+ Xizmat qo‘shish"}
        </button>
      </div>

      {error && <div style={errorBox}>{error}</div>}

      {showForm && (
        <form onSubmit={addService} style={formCard}>
          <h2 style={formTitle}>Yangi xizmat</h2>

          <div style={formGrid}>
            <div>
              <label style={label}>Xizmat nomi</label>
              <input
                style={input}
                placeholder="Masalan: Kabel tortish"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div>
              <label style={label}>Birlik</label>
              <select
                style={input}
                value={form.unit}
                onChange={(e) =>
                  setForm({ ...form, unit: e.target.value })
                }
              >
                <option value="dona">Dona</option>
                <option value="metr">Metr</option>
                <option value="xizmat">Xizmat</option>
                <option value="komplekt">Komplekt</option>
                <option value="soat">Soat</option>
              </select>
            </div>

            <div>
              <label style={label}>Sotuv narxi</label>
              <input
                type="number"
                style={input}
                placeholder="0"
                value={form.sale_price}
                onChange={(e) =>
                  setForm({ ...form, sale_price: e.target.value })
                }
              />
            </div>

            <div>
              <label style={label}>Tannarx</label>
              <input
                type="number"
                style={input}
                placeholder="0"
                value={form.cost_price}
                onChange={(e) =>
                  setForm({ ...form, cost_price: e.target.value })
                }
              />
            </div>

            <div>
              <label style={label}>Kategoriya</label>
              <input
                style={input}
                placeholder="Montaj"
                value={form.category}
                onChange={(e) =>
                  setForm({ ...form, category: e.target.value })
                }
              />
            </div>

            <div>
              <label style={label}>Tavsif</label>
              <input
                style={input}
                placeholder="Xizmat haqida"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>
          </div>

          <button type="submit" style={saveButton}>
            Saqlash
          </button>
        </form>
      )}

      <div style={card}>
        <div style={cardHeader}>
          <h2 style={cardTitle}>Xizmatlar ro‘yxati</h2>
          <span style={countBadge}>{services.length} ta</span>
        </div>

        {loading ? (
          <div style={empty}>Yuklanmoqda...</div>
        ) : services.length === 0 ? (
          <div style={empty}>
            Hozircha xizmatlar mavjud emas.
          </div>
        ) : (
          <div style={tableWrapper}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>№</th>
                  <th style={th}>Xizmat</th>
                  <th style={th}>Birlik</th>
                  <th style={th}>Sotuv narxi</th>
                  <th style={th}>Tannarx</th>
                  <th style={th}>Foyda</th>
                  <th style={th}>Kategoriya</th>
                  <th style={th}>Amal</th>
                </tr>
              </thead>

              <tbody>
                {services.map((service, index) => (
                  <tr key={service.id}>
                    <td style={td}>{index + 1}</td>

                    <td style={td}>
                      <strong>{service.name}</strong>
                      {service.description && (
                        <div style={description}>
                          {service.description}
                        </div>
                      )}
                    </td>

                    <td style={td}>
                      <span style={unitBadge}>{service.unit}</span>
                    </td>

                    <td style={td}>
                      {formatMoney(service.sale_price)}
                    </td>

                    <td style={td}>
                      {formatMoney(service.cost_price)}
                    </td>

                    <td style={td}>
                      <strong style={profit}>
                        {formatMoney(service.profit)}
                      </strong>
                    </td>

                    <td style={td}>
                      {service.category || "—"}
                    </td>

                    <td style={td}>
                      <button
                        style={deleteButton}
                        onClick={() => deleteService(service.id)}
                      >
                        🗑 O‘chirish
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const page = {
  padding: "28px",
  minHeight: "100%",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
};

const title = {
  margin: 0,
  fontSize: "30px",
  fontWeight: 700,
};

const subtitle = {
  margin: "6px 0 0",
  color: "#64748b",
};

const addButton = {
  border: "none",
  borderRadius: "10px",
  padding: "12px 18px",
  background: "#2563eb",
  color: "#fff",
  fontSize: "14px",
  fontWeight: 600,
  cursor: "pointer",
};

const formCard = {
  background: "#fff",
  borderRadius: "16px",
  padding: "22px",
  marginBottom: "22px",
  boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
};

const formTitle = {
  marginTop: 0,
  marginBottom: "18px",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: "16px",
};

const label = {
  display: "block",
  marginBottom: "7px",
  fontSize: "13px",
  fontWeight: 600,
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #dbe2ea",
  borderRadius: "9px",
  fontSize: "14px",
  outline: "none",
};

const saveButton = {
  marginTop: "18px",
  border: "none",
  borderRadius: "9px",
  padding: "11px 20px",
  background: "#16a34a",
  color: "#fff",
  fontWeight: 600,
  cursor: "pointer",
};

const card = {
  background: "#fff",
  borderRadius: "16px",
  boxShadow: "0 4px 18px rgba(0,0,0,0.06)",
  overflow: "hidden",
};

const cardHeader = {
  padding: "20px 22px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #eef2f7",
};

const cardTitle = {
  margin: 0,
  fontSize: "19px",
};

const countBadge = {
  background: "#eff6ff",
  color: "#2563eb",
  padding: "6px 10px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: 600,
};

const tableWrapper = {
  overflowX: "auto",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: "12px",
  color: "#64748b",
  background: "#f8fafc",
  whiteSpace: "nowrap",
};

const td = {
  padding: "15px 16px",
  borderTop: "1px solid #eef2f7",
  fontSize: "14px",
  whiteSpace: "nowrap",
};

const unitBadge = {
  background: "#f1f5f9",
  padding: "5px 9px",
  borderRadius: "7px",
  fontSize: "12px",
};

const description = {
  marginTop: "4px",
  fontSize: "12px",
  color: "#94a3b8",
};

const profit = {
  color: "#16a34a",
};

const deleteButton = {
  border: "none",
  borderRadius: "8px",
  padding: "8px 10px",
  background: "#fee2e2",
  color: "#dc2626",
  cursor: "pointer",
  fontSize: "12px",
};

const errorBox = {
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "12px 15px",
  borderRadius: "10px",
  marginBottom: "18px",
};

const empty = {
  padding: "50px",
  textAlign: "center",
  color: "#64748b",
};

export default Services;





