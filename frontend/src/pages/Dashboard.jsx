function Dashboard() {
  const cards = [
    {
      title: "Mijozlar",
      value: "0 ta",
      icon: "👥",
      color: "#2563EB",
    },
    {
      title: "Mahsulotlar",
      value: "0 ta",
      icon: "📦",
      color: "#16A34A",
    },
    {
      title: "Bugungi savdo",
      value: "0 so'm",
      icon: "💰",
      color: "#F59E0B",
    },
    {
      title: "Qarzdorlik",
      value: "0 so'm",
      icon: "💳",
      color: "#DC2626",
    },
  ];

  const orders = [
    {
      client: "Ma'lumot yo'q",
      service: "—",
      status: "Kutilmoqda",
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: "5px" }}>
        SAFE HOME SERVICES ERP
      </h1>

      <p
        style={{
          color: "#64748B",
          marginBottom: "30px",
        }}
      >
        Dashboard
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        {cards.map((card) => (
          <div
            key={card.title}
            style={{
              background: "#fff",
              borderRadius: "15px",
              padding: "25px",
              boxShadow: "0 5px 15px rgba(0,0,0,.08)",
              borderLeft: `6px solid ${card.color}`,
            }}
          >
            <div style={{ fontSize: "42px" }}>
              {card.icon}
            </div>

            <h3
              style={{
                marginTop: "15px",
                marginBottom: "10px",
              }}
            >
              {card.title}
            </h3>

            <h2
              style={{
                color: card.color,
                margin: 0,
              }}
            >
              {card.value}
            </h2>
          </div>
        ))}
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: "15px",
          padding: "25px",
          boxShadow: "0 5px 15px rgba(0,0,0,.08)",
        }}
      >
        <h2>So'nggi buyurtmalar</h2>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "20px",
          }}
        >
          <thead>
            <tr style={{ background: "#F1F5F9" }}>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Mijoz
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Xizmat
              </th>
              <th style={{ padding: "12px", textAlign: "left" }}>
                Holati
              </th>
            </tr>
          </thead>

          <tbody>
            {orders.map((item, index) => (
              <tr key={index}>
                <td style={{ padding: "12px" }}>
                  {item.client}
                </td>

                <td style={{ padding: "12px" }}>
                  {item.service}
                </td>

                <td
                  style={{
                    padding: "12px",
                    color: "#16A34A",
                    fontWeight: "bold",
                  }}
                >
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;