import { useState, useEffect } from "react";

function Products() {
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem("products");
    return saved ? JSON.parse(saved) : [];
  });

  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    quantity: "",
    buyPrice: "",
    sellPrice: "",
  });

  useEffect(() => {
    localStorage.setItem("products", JSON.stringify(products));
  }, [products]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveProduct = () => {
    if (!form.name.trim()) {
      alert("Mahsulot nomini kiriting");
      return;
    }

    setProducts([
      ...products,
      {
        ...form,
        id: Date.now(),
      },
    ]);

    setForm({
      name: "",
      quantity: "",
      buyPrice: "",
      sellPrice: "",
    });

    setOpen(false);
  };

  const filteredProducts = products.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "30px" }}>
      <h1>📦 Mahsulotlar</h1>
      <p>SAFE HOME SERVICES ERP</p>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          margin: "20px 0",
        }}
      >
        <input
          placeholder="🔍 Mahsulot qidirish..."
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
            background: "#2563EB",
            color: "#fff",
            border: "none",
            padding: "10px 20px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          + Mahsulot
        </button>
      </div>

      {open && (
        <div
          style={{
            display: "grid",
            gap: "10px",
            marginBottom: "20px",
            background: "#fff",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <input
            name="name"
            placeholder="Mahsulot nomi"
            value={form.name}
            onChange={handleChange}
          />

          <input
            name="quantity"
            placeholder="Soni"
            value={form.quantity}
            onChange={handleChange}
          />

          <input
            name="buyPrice"
            placeholder="Kirim narxi"
            value={form.buyPrice}
            onChange={handleChange}
          />

          <input
            name="sellPrice"
            placeholder="Sotuv narxi"
            value={form.sellPrice}
            onChange={handleChange}
          />

          <button
            onClick={saveProduct}
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
        }}
      >
        <thead style={{ background: "#2563EB", color: "#fff" }}>
          <tr>
            <th style={{ padding: "12px" }}>Mahsulot</th>
            <th style={{ padding: "12px" }}>Soni</th>
            <th style={{ padding: "12px" }}>Kirim</th>
            <th style={{ padding: "12px" }}>Sotuv</th>
            <th style={{ padding: "12px" }}>Foyda</th>
          </tr>
        </thead>

        <tbody>
          {filteredProducts.length === 0 ? (
            <tr>
              <td
                colSpan="5"
                style={{ textAlign: "center", padding: "20px" }}
              >
                Hozircha mahsulot yo'q
              </td>
            </tr>
          ) : (
            filteredProducts.map((item) => (
              <tr key={item.id}>
                <td style={{ padding: "12px" }}>{item.name}</td>
                <td style={{ padding: "12px" }}>{item.quantity}</td>
                <td style={{ padding: "12px" }}>
                  {Number(item.buyPrice).toLocaleString()} so'm
                </td>
                <td style={{ padding: "12px" }}>
                  {Number(item.sellPrice).toLocaleString()} so'm
                </td>
                <td
                  style={{
                    padding: "12px",
                    color: "#16A34A",
                    fontWeight: "bold",
                  }}
                >
                  {(
                    Number(item.sellPrice) - Number(item.buyPrice)
                  ).toLocaleString()} so'm
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Products;