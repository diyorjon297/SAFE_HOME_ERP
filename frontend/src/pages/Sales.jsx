import { useState, useEffect } from "react";

function Sales() {
  const [sales, setSales] = useState(() => {
    const saved = localStorage.getItem("sales");
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    customer: "",
    product: "",
    quantity: "",
    price: "",
    payment: "Naqd",
    date: "",
  });

  useEffect(() => {
    localStorage.setItem("sales", JSON.stringify(sales));
  }, [sales]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveSale = () => {
    if (
      form.customer === "" ||
      form.product === "" ||
      form.quantity === "" ||
      form.price === ""
    ) {
      alert("Barcha maydonlarni to'ldiring");
      return;
    }

    setSales([
      ...sales,
      {
        ...form,
        id: Date.now(),
        total: Number(form.quantity) * Number(form.price),
      },
    ]);

    setForm({
      customer: "",
      product: "",
      quantity: "",
      price: "",
      payment: "Naqd",
      date: "",
    });

    setOpen(false);
  };

  const deleteSale = (id) => {
    if (window.confirm("Sotuv o'chirilsinmi?")) {
      setSales(sales.filter((item) => item.id !== id));
    }
  };

  const filteredSales = sales.filter((item) =>
    item.customer.toLowerCase().includes(search.toLowerCase())
  );

  const totalSales = sales.reduce((sum, item) => sum + item.total, 0);

  return (
    <div style={{ padding: "30px" }}>
      <h1>💰 Sotuvlar</h1>
      <p>SAFE HOME SERVICES ERP</p>

      <div
        style={{
          background: "#16A34A",
          color: "#fff",
          padding: "20px",
          borderRadius: "12px",
          width: "250px",
          marginBottom: "25px",
        }}
      >
        <h3>Jami sotuv</h3>
        <h2>{totalSales.toLocaleString()} so'm</h2>
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
          }}
        />

        <button
          onClick={() => setOpen(!open)}
          style={{
            background: "#2563EB",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          + Yangi sotuv
        </button>
      </div>

      {open && (
        <div
          style={{
            display: "grid",
            gap: "10px",
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            marginBottom: "20px",
          }}
        >
          <input
            name="customer"
            placeholder="Mijoz"
            value={form.customer}
            onChange={handleChange}
          />

          <input
            name="product"
            placeholder="Mahsulot"
            value={form.product}
            onChange={handleChange}
          />

          <input
            type="number"
            name="quantity"
            placeholder="Soni"
            value={form.quantity}
            onChange={handleChange}
          />

          <input
            type="number"
            name="price"
            placeholder="Narxi"
            value={form.price}
            onChange={handleChange}
          />

          <select
            name="payment"
            value={form.payment}
            onChange={handleChange}
          >
            <option>Naqd</option>
            <option>Karta</option>
            <option>Qarz</option>
          </select>

          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
          />

          <button
            onClick={saveSale}
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
            <th style={{ padding: "12px" }}>Mijoz</th>
            <th style={{ padding: "12px" }}>Mahsulot</th>
            <th style={{ padding: "12px" }}>Soni</th>
            <th style={{ padding: "12px" }}>Narxi</th>
            <th style={{ padding: "12px" }}>Jami</th>
            <th style={{ padding: "12px" }}>To'lov</th>
            <th style={{ padding: "12px" }}>Sana</th>
            <th style={{ padding: "12px" }}>Amal</th>
          </tr>
        </thead>

        <tbody>
          {filteredSales.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                Hozircha sotuv mavjud emas
              </td>
            </tr>
          ) : (
            filteredSales.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: "12px" }}>{item.customer}</td>
                <td style={{ padding: "12px" }}>{item.product}</td>
                <td style={{ padding: "12px" }}>{item.quantity}</td>
                <td style={{ padding: "12px" }}>
                  {Number(item.price).toLocaleString()} so'm
                </td>
                <td
                  style={{
                    padding: "12px",
                    fontWeight: "bold",
                    color: "#16A34A",
                  }}
                >
                  {item.total.toLocaleString()} so'm
                </td>
                <td style={{ padding: "12px" }}>{item.payment}</td>
                <td style={{ padding: "12px" }}>{item.date}</td>
                <td style={{ padding: "12px" }}>
                  <button
                    onClick={() => deleteSale(item.id)}
                    style={{
                      background: "#DC2626",
                      color: "#fff",
                      border: "none",
                      padding: "8px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                    }}
                  >
                    🗑
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Sales;