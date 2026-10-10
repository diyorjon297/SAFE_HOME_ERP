import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "https://safe-home-erp.onrender.com";

const emptyForm = {
  customer_id: "",
  customer_name: "",
  phone: "",
  inquiry_type: "Kamera",
  subject: "",
  description: "",
  address: "",
  object_name: "",
  priority: "Oddiy",
  status: "Yangi",
  responsible: "",
  note: "",
};

export default function Inquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =========================
  // MA'LUMOTLARNI OLISH
  // =========================

  const loadInquiries = async () => {
    try {
      const res = await axios.get(`${API}/inquiries/`);
      setInquiries(res.data);
    } catch (err) {
      console.error(err);
      setError("Murojaatlarni yuklashda xatolik");
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await axios.get(`${API}/customers/`);
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadInquiries();
    loadCustomers();
  }, []);

  // =========================
  // INPUT
  // =========================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "customer_id") {
      const customer = customers.find(
        (item) => String(item.id) === String(value)
      );

      setForm((prev) => ({
        ...prev,
        customer_id: value,
        customer_name: customer?.name || "",
        phone: customer?.phone || "",
        address: customer?.address || "",
        object_name: customer?.object || "",
      }));

      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // SAQLASH
  // =========================

  const saveInquiry = async (e) => {
    e.preventDefault();

    if (!form.customer_name.trim()) {
      alert("Mijoz ismini kiriting");
      return;
    }

    if (!form.subject.trim()) {
      alert("Murojaat mavzusini kiriting");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = {
        ...form,
        customer_id: form.customer_id
          ? Number(form.customer_id)
          : null,
      };

      if (editingId) {
        await axios.put(`${API}/inquiries/${editingId}`, data);
      } else {
        await axios.post(`${API}/inquiries/`, data);
      }

      setForm(emptyForm);
      setEditingId(null);

      await loadInquiries();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail ||
          "Murojaatni saqlashda xatolik"
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // TAHRIRLASH
  // =========================

  const editInquiry = (item) => {
    setEditingId(item.id);

    setForm({
      customer_id: item.customer_id || "",
      customer_name: item.customer_name || "",
      phone: item.phone || "",
      inquiry_type: item.inquiry_type || "Kamera",
      subject: item.subject || "",
      description: item.description || "",
      address: item.address || "",
      object_name: item.object_name || "",
      priority: item.priority || "Oddiy",
      status: item.status || "Yangi",
      responsible: item.responsible || "",
      note: item.note || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // O'CHIRISH
  // =========================

  const deleteInquiry = async (id) => {
    const ok = window.confirm(
      "Bu murojaatni oвЂchirishni tasdiqlaysizmi?"
    );

    if (!ok) return;

    try {
      await axios.delete(`${API}/inquiries/${id}`);
      await loadInquiries();
    } catch (err) {
      console.error(err);
      alert("OвЂchirishda xatolik");
    }
  };

  // =========================
  // BEKOR
  // =========================

  const cancelEdit = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  // =========================
  // STATUS
  // =========================

  const statusStyle = (status) => {
    const styles = {
      Yangi: {
        background: "#e3f2fd",
        color: "#1565c0",
      },
      "Jarayonda": {
        background: "#fff3e0",
        color: "#ef6c00",
      },
      Tugallangan: {
        background: "#e8f5e9",
        color: "#2e7d32",
      },
      Bekor: {
        background: "#ffebee",
        color: "#c62828",
      },
    };

    return (
      styles[status] || {
        background: "#f5f5f5",
        color: "#555",
      }
    );
  };

  const priorityStyle = (priority) => {
    const styles = {
      Oddiy: {
        background: "#f5f5f5",
        color: "#555",
      },
      Muhim: {
        background: "#fff3e0",
        color: "#e65100",
      },
      Shoshilinch: {
        background: "#ffebee",
        color: "#c62828",
      },
    };

    return (
      styles[priority] || {
        background: "#f5f5f5",
        color: "#555",
      }
    );
  };

  return (
    <div
      style={{
        padding: "24px",
        minHeight: "100vh",
        background: "#f7f8fa",
        color: "#1f2937",
      }}
    >
      {/* =========================
          HEADER
      ========================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "28px",
              fontWeight: 700,
            }}
          >
            Murojaatlar
          </h1>

          <div
            style={{
              marginTop: "6px",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Mijozlardan kelgan murojaat va buyurtmalar
          </div>
        </div>

        <div
          style={{
            background: "#ffffff",
            padding: "12px 18px",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            fontWeight: 600,
          }}
        >
          Jami: {inquiries.length} ta
        </div>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "18px",
            padding: "12px 16px",
            borderRadius: "10px",
            background: "#ffebee",
            color: "#c62828",
          }}
        >
          {error}
        </div>
      )}

      {/* =========================
          FORM
      ========================= */}

      <form
        onSubmit={saveInquiry}
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "22px",
          border: "1px solid #e5e7eb",
          marginBottom: "24px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "18px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "19px",
            }}
          >
            {editingId
              ? "Murojaatni tahrirlash"
              : "Yangi murojaat"}
          </h2>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={buttonSecondary}
            >
              Bekor qilish
            </button>
          )}
        </div>

        <div style={gridStyle}>
          {/* MIJOZ */}

          <div>
            <label style={labelStyle}>Mijoz</label>

            <select
              name="customer_id"
              value={form.customer_id}
              onChange={handleChange}
              style={inputStyle}
            >
              <option value="">
                Mijozni tanlang
              </option>

              {customers.map((customer) => (
                <option
                  key={customer.id}
                  value={customer.id}
                >
                  {customer.name}
                  {customer.phone
                    ? ` вЂ” ${customer.phone}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* ISM */}

          <div>
            <label style={labelStyle}>
              Mijoz ismi *
            </label>

            <input
              name="customer_name"
              value={form.customer_name}
              onChange={handleChange}
              placeholder="Ism familiya"
              style={inputStyle}
            />
          </div>

          {/* TELEFON */}

          <div>
            <label style={labelStyle}>
              Telefon
            </label>

            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="+998 90 123 45 67"
              style={inputStyle}
            />
          </div>

          {/* MUROJAAT TURI */}

          <div>
            <label style={labelStyle}>
              Murojaat turi
            </label>

            <select
              name="inquiry_type"
              value={form.inquiry_type}
              onChange={handleChange}
              style={inputStyle}
            >
              <option>Kamera</option>
              <option>Domofon</option>
              <option>Elektron qulf</option>
              <option>SIM karta</option>
              <option>Internet / Wi-Fi</option>
              <option>Ta'mirlash</option>
              <option>O'rnatish</option>
              <option>Servis</option>
              <option>Boshqa</option>
            </select>
          </div>

          {/* MAVZU */}

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>
              Mavzu *
            </label>

            <input
              name="subject"
              value={form.subject}
              onChange={handleChange}
              placeholder="Masalan: 4 ta kamera oвЂrnatish kerak"
              style={inputStyle}
            />
          </div>

          {/* MANZIL */}

          <div>
            <label style={labelStyle}>
              Manzil
            </label>

            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Manzil"
              style={inputStyle}
            />
          </div>

          {/* OBYEKT */}

          <div>
            <label style={labelStyle}>
              Obyekt
            </label>

            <input
              name="object_name"
              value={form.object_name}
              onChange={handleChange}
              placeholder="Uy, doвЂkon, maktab..."
              style={inputStyle}
            />
          </div>

          {/* MUHIMLIK */}

          <div>
            <label style={labelStyle}>
              Muhimlik
            </label>

            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              style={inputStyle}
            >
              <option>Oddiy</option>
              <option>Muhim</option>
              <option>Shoshilinch</option>
            </select>
          </div>

          {/* HOLAT */}

          <div>
            <label style={labelStyle}>
              Holat
            </label>

            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              style={inputStyle}
            >
              <option>Yangi</option>
              <option>Jarayonda</option>
              <option>Tugallangan</option>
              <option>Bekor</option>
            </select>
          </div>

          {/* MAS'UL */}

          <div>
            <label style={labelStyle}>
              Mas'ul
            </label>

            <input
              name="responsible"
              value={form.responsible}
              onChange={handleChange}
              placeholder="Mas'ul xodim"
              style={inputStyle}
            />
          </div>

          {/* TAVSIF */}

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>
              Murojaat tafsiloti
            </label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Mijoz nima soвЂradi..."
              rows={3}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
          </div>

          {/* IZOH */}

          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelStyle}>
              Ichki izoh
            </label>

            <textarea
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="QoвЂshimcha izoh"
              rows={2}
              style={{
                ...inputStyle,
                resize: "vertical",
              }}
            />
          </div>
        </div>

        <div
          style={{
            marginTop: "20px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              style={buttonSecondary}
            >
              Bekor qilish
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            style={buttonPrimary}
          >
            {loading
              ? "Saqlanmoqda..."
              : editingId
              ? "Saqlash"
              : "Murojaat qoвЂshish"}
          </button>
        </div>
      </form>

      {/* =========================
          TABLE
      ========================= */}

      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          border: "1px solid #e5e7eb",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        <div
          style={{
            padding: "18px 20px",
            borderBottom: "1px solid #e5e7eb",
            fontWeight: 700,
            fontSize: "17px",
          }}
        >
          Murojaatlar roвЂyxati
        </div>

        {inquiries.length === 0 ? (
          <div
            style={{
              padding: "50px",
              textAlign: "center",
              color: "#9ca3af",
            }}
          >
            Hozircha murojaatlar yoвЂq
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "1100px",
              }}
            >
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={thStyle}>#</th>
                  <th style={thStyle}>Mijoz</th>
                  <th style={thStyle}>Telefon</th>
                  <th style={thStyle}>Turi</th>
                  <th style={thStyle}>Mavzu</th>
                  <th style={thStyle}>Obyekt</th>
                  <th style={thStyle}>Muhimlik</th>
                  <th style={thStyle}>Holat</th>
                  <th style={thStyle}>Mas'ul</th>
                  <th style={thStyle}>Amallar</th>
                </tr>
              </thead>

              <tbody>
                {inquiries.map((item, index) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>
                      {index + 1}
                    </td>

                    <td style={tdStyle}>
                      <strong>
                        {item.customer_name}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      {item.phone || "вЂ”"}
                    </td>

                    <td style={tdStyle}>
                      {item.inquiry_type || "вЂ”"}
                    </td>

                    <td style={tdStyle}>
                      {item.subject}
                    </td>

                    <td style={tdStyle}>
                      {item.object_name || "вЂ”"}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          ...priorityStyle(
                            item.priority
                          ),
                        }}
                      >
                        {item.priority}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          ...statusStyle(item.status),
                        }}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {item.responsible || "вЂ”"}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "7px",
                        }}
                      >
                        <button
                          onClick={() =>
                            editInquiry(item)
                          }
                          style={editButton}
                        >
                          Tahrirlash
                        </button>

                        <button
                          onClick={() =>
                            deleteInquiry(item.id)
                          }
                          style={deleteButton}
                        >
                          OвЂchirish
                        </button>
                      </div>
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


// ========================================
// STYLES
// ========================================

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "16px",
};

const labelStyle = {
  display: "block",
  marginBottom: "7px",
  fontSize: "13px",
  fontWeight: 600,
  color: "#374151",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 13px",
  border: "1px solid #d1d5db",
  borderRadius: "9px",
  outline: "none",
  fontSize: "14px",
  background: "#ffffff",
  color: "#111827",
};

const buttonPrimary = {
  border: "none",
  borderRadius: "9px",
  padding: "11px 20px",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 600,
  cursor: "pointer",
};

const buttonSecondary = {
  border: "1px solid #d1d5db",
  borderRadius: "9px",
  padding: "10px 18px",
  background: "#ffffff",
  color: "#374151",
  fontWeight: 600,
  cursor: "pointer",
};

const thStyle = {
  textAlign: "left",
  padding: "13px 15px",
  fontSize: "12px",
  fontWeight: 700,
  color: "#6b7280",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px 15px",
  borderBottom: "1px solid #f0f0f0",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const badgeStyle = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: "20px",
  fontSize: "12px",
  fontWeight: 600,
};

const editButton = {
  border: "1px solid #dbeafe",
  background: "#eff6ff",
  color: "#2563eb",
  borderRadius: "7px",
  padding: "7px 10px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};

const deleteButton = {
  border: "1px solid #fee2e2",
  background: "#fef2f2",
  color: "#dc2626",
  borderRadius: "7px",
  padding: "7px 10px",
  cursor: "pointer",
  fontSize: "12px",
  fontWeight: 600,
};
