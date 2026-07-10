import { useState, useEffect } from "react";

function Customers() {
  const [customers, setCustomers] = useState(() => {
    const saved = localStorage.getItem("customers");
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    object: "",
    debt: "",
  });

  useEffect(() => {
    localStorage.setItem("customers", JSON.stringify(customers));
  }, [customers]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveCustomer = () => {
    if (form.name.trim() === "") {
      alert("Mijoz ismini kiriting");
      return;
    }

    setCustomers([
      ...customers,
      {
        ...form,
        id: Date.now(),
      },
    ]);

    setForm({
      name: "",
      phone: "",
      address: "",
      object: "",
      debt: "",
    });

    setOpen(false);
  };

  const totalDebt = customers.reduce(
    (sum, item) => sum + (Number(item.debt) || 0),
    0
  );

  const filteredCustomers = customers.filter((item) => {
    return (
      item.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.phone?.includes(search)
    );
  });

  return (
    <div style={{ padding: "30px" }}>
      <h1>👥 Mijozlar</h1>
      <p>SAFE HOME SERVICES ERP</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
          gap: "20px",
          margin: "25px 0",
        }}
      >
        <div
          style={{
            background: "#2563EB",
            color: "#fff",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Jami mijozlar</h3>
          <h2>{customers.length}</h2>
        </div>

        <div
          style={{
            background: "#16A34A",
            color: "#fff",
            padding: "20px",
            borderRadius: "12px",
          }}
        >
          <h3>Qarzdorlik</h3>
          <h2>{totalDebt.toLocaleString()} so'm</h2>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px",
        }}
      >
        <input
          placeholder="🔍 Mijoz qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "300px",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={() => setOpen(!open)}
          style={{
            padding: "10px 20px",
            borderRadius: "8px",
            border: "none",
            background: "#1976d2",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          + Yangi mijoz
        </button>
      </div>

      {open && (
        <div
          style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
            boxShadow: "0 3px 10px rgba(0,0,0,.08)",
            display: "grid",
            gap: "10px",
          }}
        >
          <input
            name="name"
            placeholder="Mijoz ismi"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Telefon"
            value={form.phone}
            onChange={handleChange}
          />

          <input
            name="address"
            placeholder="Manzil"
            value={form.address}
            onChange={handleChange}
          />

          <input
            name="object"
            placeholder="Obyekt"
            value={form.object}
            onChange={handleChange}
          />

          <input
            name="debt"
            placeholder="Qarz"
            value={form.debt}
            onChange={handleChange}
          />

          <button
            onClick={saveCustomer}
            style={{
              background: "#16A34A",
              color: "#fff",
              border: "none",
              padding: "12px",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Saqlash
          </button>
        </div>
      )}

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          background: "#fff",
          boxShadow: "0 3px 10px rgba(0,0,0,.08)",
        }}
      >
        <thead
          style={{
            background: "#2563EB",
            color: "#fff",
          }}
        >
          <tr>
            <th style={{ padding: "12px" }}>F.I.Sh</th>
            <th style={{ padding: "12px" }}>Telefon</th>
            <th style={{ padding: "12px" }}>Manzil</th>
            <th style={{ padding: "12px" }}>Obyekt</th>
            <th style={{ padding: "12px" }}>Qarz</th>
          </tr>
        </thead>

        <tbody>
          {filteredCustomers.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{
                  textAlign: "center",
                  padding: "25px",
                }}
              >
                Hozircha mijoz yo‘q
              </td>
            </tr>
          ) : (
            filteredCustomers.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: "12px" }}>{item.name}</td>
                <td style={{ padding: "12px" }}>{item.phone}</td>
                <td style={{ padding: "12px" }}>{item.address}</td>
                <td style={{ padding: "12px" }}>{item.object}</td>
                <td
                  style={{
                    padding: "12px",
                    color:
                      Number(item.debt) > 0 ? "#DC2626" : "#16A34A",
                    fontWeight: "bold",
                  }}
                >
                  {Number(item.debt).toLocaleString()} so'm
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Customers;