import { useState } from "react";

const initialEmployees = [
  {
    id: 1,
    name: "Xodim namunasi",
    phone: "",
    position: "Montajchi",
    daily: 0,
    salary: 0,
    active: true,
  },
];

export default function Employees() {
  const [employees, setEmployees] =
    useState(initialEmployees);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    position: "",
    daily: "",
    salary: "",
    active: true,
  });

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      position: "",
      daily: "",
      salary: "",
      active: true,
    });

    setEditingId(null);
    setShowForm(false);
  };

  const saveEmployee = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Xodim ism-familiyasini kiriting");
      return;
    }

    const employee = {
      id: editingId || Date.now(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      position: form.position.trim(),
      daily: Number(form.daily) || 0,
      salary: Number(form.salary) || 0,
      active: form.active,
    };

    if (editingId) {
      setEmployees((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? employee
            : item
        )
      );
    } else {
      setEmployees((prev) => [
        ...prev,
        employee,
      ]);
    }

    resetForm();
  };

  const editEmployee = (employee) => {
    setEditingId(employee.id);

    setForm({
      name: employee.name || "",
      phone: employee.phone || "",
      position: employee.position || "",
      daily: employee.daily || "",
      salary: employee.salary || "",
      active: employee.active !== false,
    });

    setShowForm(true);
  };

  const deleteEmployee = (id) => {
    if (
      !confirm(
        "Bu xodimni o'chirishni tasdiqlaysizmi?"
      )
    ) {
      return;
    }

    setEmployees((prev) =>
      prev.filter((item) => item.id !== id)
    );
  };

  const money = (value) => {
    return new Intl.NumberFormat("uz-UZ").format(
      Number(value) || 0
    );
  };

  const activeCount = employees.filter(
    (item) => item.active
  ).length;

  const totalDaily = employees.reduce(
    (sum, item) =>
      sum + (Number(item.daily) || 0),
    0
  );

  const totalSalary = employees.reduce(
    (sum, item) =>
      sum + (Number(item.salary) || 0),
    0
  );

  return (
    <div style={page}>
      <div style={pageHeader}>
        <div>
          <div style={eyebrow}>
            ERP / XODIMLAR
          </div>

          <h1 style={pageTitle}>
            Xodimlar
          </h1>

          <p style={pageSubtitle}>
            Xodimlar va ularning ish haqi hisobini
            boshqaring
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              name: "",
              phone: "",
              position: "",
              daily: "",
              salary: "",
              active: true,
            });
            setShowForm(true);
          }}
          style={primaryButton}
        >
          + Yangi xodim
        </button>
      </div>

      <div style={statsGrid}>
        <Stat
          label="Jami xodimlar"
          value={employees.length}
        />

        <Stat
          label="Faol xodimlar"
          value={activeCount}
          green
        />

        <Stat
          label="Kunlik stavkalar"
          value={`${money(totalDaily)} so'm`}
        />

        <Stat
          label="Oylik maoshlar"
          value={`${money(totalSalary)} so'm`}
        />
      </div>

      {showForm && (
        <div style={formCard}>
          <div style={formHeader}>
            <div>
              <div style={eyebrow}>
                {editingId
                  ? "XODIMNI TAHRIRLASH"
                  : "YANGI XODIM"}
              </div>

              <h2 style={formTitle}>
                {editingId
                  ? "Xodim ma'lumotlarini o'zgartirish"
                  : "Yangi xodim qo'shish"}
              </h2>
            </div>

            <button
              type="button"
              onClick={resetForm}
              style={closeButton}
            >
              ✕
            </button>
          </div>

          <form onSubmit={saveEmployee}>
            <div style={formGrid}>
              <Input
                label="Ism-familiya *"
                value={form.name}
                placeholder="Masalan: Aliyev Anvar"
                onChange={(value) =>
                  setForm({
                    ...form,
                    name: value,
                  })
                }
              />

              <Input
                label="Telefon"
                value={form.phone}
                placeholder="+998 90 123 45 67"
                onChange={(value) =>
                  setForm({
                    ...form,
                    phone: value,
                  })
                }
              />

              <Input
                label="Lavozim"
                value={form.position}
                placeholder="Montajchi"
                onChange={(value) =>
                  setForm({
                    ...form,
                    position: value,
                  })
                }
              />

              <Input
                label="Kunlik ish haqi"
                type="number"
                value={form.daily}
                placeholder="0"
                onChange={(value) =>
                  setForm({
                    ...form,
                    daily: value,
                  })
                }
              />

              <Input
                label="Oylik maosh"
                type="number"
                value={form.salary}
                placeholder="0"
                onChange={(value) =>
                  setForm({
                    ...form,
                    salary: value,
                  })
                }
              />

              <label style={checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      active: e.target.checked,
                    })
                  }
                />

                <span>
                  Xodim faol
                </span>
              </label>
            </div>

            <div style={formActions}>
              <button
                type="submit"
                style={saveButton}
              >
                {editingId
                  ? "Saqlash"
                  : "Xodimni qo'shish"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                style={cancelButton}
              >
                Bekor qilish
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={tableCard}>
        <div style={tableHeader}>
          <div>
            <div style={tableTitle}>
              Xodimlar ro'yxati
            </div>

            <div style={tableSubtitle}>
              Barcha xodimlar
            </div>
          </div>

          <div style={countBadge}>
            {employees.length} ta
          </div>
        </div>

        {employees.length === 0 ? (
          <div style={empty}>
            <div style={emptyIcon}>
              👷
            </div>

            <strong>
              Hali xodimlar yo'q
            </strong>

            <span>
              Yangi xodim qo'shish uchun yuqoridagi
              tugmani bosing.
            </span>
          </div>
        ) : (
          <div style={tableWrap}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>#</th>
                  <th style={th}>
                    Xodim
                  </th>
                  <th style={th}>
                    Telefon
                  </th>
                  <th style={th}>
                    Lavozim
                  </th>
                  <th style={th}>
                    Kunlik
                  </th>
                  <th style={th}>
                    Oylik
                  </th>
                  <th style={th}>
                    Holati
                  </th>
                  <th style={th}>
                    Amallar
                  </th>
                </tr>
              </thead>

              <tbody>
                {employees.map(
                  (employee, index) => (
                    <tr key={employee.id}>
                      <td style={td}>
                        {index + 1}
                      </td>

                      <td style={td}>
                        <strong>
                          {employee.name}
                        </strong>
                      </td>

                      <td style={td}>
                        {employee.phone || "—"}
                      </td>

                      <td style={td}>
                        {employee.position ||
                          "—"}
                      </td>

                      <td style={td}>
                        {money(employee.daily)} so'm
                      </td>

                      <td style={td}>
                        {money(employee.salary)} so'm
                      </td>

                      <td style={td}>
                        <span
                          style={
                            employee.active
                              ? activeBadge
                              : inactiveBadge
                          }
                        >
                          {employee.active
                            ? "Faol"
                            : "Nofaol"}
                        </span>
                      </td>

                      <td style={td}>
                        <div style={actions}>
                          <button
                            onClick={() =>
                              editEmployee(
                                employee
                              )
                            }
                            style={editButton}
                          >
                            Tahrirlash
                          </button>

                          <button
                            onClick={() =>
                              deleteEmployee(
                                employee.id
                              )
                            }
                            style={deleteButton}
                          >
                            O'chirish
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Input({
  label,
  value,
  placeholder,
  type = "text",
  onChange,
}) {
  return (
    <label style={labelStyle}>
      <span style={labelTitle}>
        {label}
      </span>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={input}
      />
    </label>
  );
}

function Stat({
  label,
  value,
  green = false,
}) {
  return (
    <div style={statCard}>
      <div style={statLabel}>
        {label}
      </div>

      <div
        style={{
          ...statValue,
          color: green
            ? "#15803d"
            : "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const page = {
  maxWidth: 1450,
  margin: "0 auto",
  padding: "10px 0 50px",
};

const pageHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: 20,
  marginBottom: 18,
  flexWrap: "wrap",
};

const eyebrow = {
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 1.5,
  color: "#64748b",
};

const pageTitle = {
  margin: "5px 0 0",
  fontSize: 32,
  fontWeight: 900,
  color: "#0f172a",
};

const pageSubtitle = {
  margin: "7px 0 0",
  color: "#64748b",
  fontSize: 14,
};

const primaryButton = {
  border: "none",
  borderRadius: 12,
  padding: "13px 20px",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 14,
};

const statCard = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 17,
};

const statLabel = {
  color: "#64748b",
  fontSize: 12,
  fontWeight: 700,
};

const statValue = {
  marginTop: 7,
  fontSize: 19,
  fontWeight: 900,
};

const formCard = {
  marginTop: 18,
  background: "#fff",
  border: "1px solid #dbeafe",
  borderRadius: 18,
  padding: 22,
};

const formHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 20,
};

const formTitle = {
  margin: "5px 0 0",
  fontSize: 21,
  color: "#0f172a",
};

const closeButton = {
  border: "none",
  background: "#f1f5f9",
  width: 36,
  height: 36,
  borderRadius: 9,
  cursor: "pointer",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 7,
};

const labelTitle = {
  fontSize: 12,
  fontWeight: 800,
  color: "#334155",
};

const input = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  fontSize: 14,
  background: "#fff",
  outline: "none",
};

const checkboxLabel = {
  display: "flex",
  alignItems: "center",
  gap: 9,
  paddingTop: 29,
  color: "#334155",
  fontSize: 13,
  fontWeight: 700,
};

const formActions = {
  display: "flex",
  gap: 10,
  marginTop: 20,
};

const saveButton = {
  border: "none",
  borderRadius: 10,
  padding: "11px 20px",
  background: "#16a34a",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const cancelButton = {
  border: "1px solid #cbd5e1",
  borderRadius: 10,
  padding: "11px 20px",
  background: "#fff",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
};

const tableCard = {
  marginTop: 18,
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  overflow: "hidden",
};

const tableHeader = {
  padding: 18,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  borderBottom: "1px solid #e2e8f0",
};

const tableTitle = {
  fontSize: 16,
  fontWeight: 900,
  color: "#0f172a",
};

const tableSubtitle = {
  marginTop: 3,
  fontSize: 12,
  color: "#64748b",
};

const countBadge = {
  padding: "6px 10px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#2563eb",
  fontSize: 12,
  fontWeight: 800,
};

const tableWrap = {
  width: "100%",
  overflowX: "auto",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const th = {
  padding: "12px 14px",
  textAlign: "left",
  background: "#f8fafc",
  color: "#475569",
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const td = {
  padding: "14px",
  borderTop: "1px solid #f1f5f9",
  color: "#334155",
  whiteSpace: "nowrap",
};

const activeBadge = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: 999,
  background: "#dcfce7",
  color: "#15803d",
  fontSize: 11,
  fontWeight: 800,
};

const inactiveBadge = {
  display: "inline-block",
  padding: "5px 9px",
  borderRadius: 999,
  background: "#f1f5f9",
  color: "#64748b",
  fontSize: 11,
  fontWeight: 800,
};

const actions = {
  display: "flex",
  gap: 7,
};

const editButton = {
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#2563eb",
  borderRadius: 8,
  padding: "7px 10px",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
};

const deleteButton = {
  border: "1px solid #fecaca",
  background: "#fef2f2",
  color: "#dc2626",
  borderRadius: 8,
  padding: "7px 10px",
  fontSize: 11,
  fontWeight: 800,
  cursor: "pointer",
};

const empty = {
  padding: 55,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: 8,
  color: "#64748b",
};

const emptyIcon = {
  fontSize: 40,
};

