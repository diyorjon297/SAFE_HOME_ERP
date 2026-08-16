function CustomerStats({ customers }) {
  const totalCustomers = customers.length;

  const debtCustomers = customers.filter(
    (c) => Number(c.debt) > 0
  ).length;

  const totalDebt = customers.reduce(
    (sum, c) => sum + Number(c.debt),
    0
  );

  const paidCustomers = customers.filter(
    (c) => Number(c.debt) === 0
  ).length;

  const cards = [
    {
      title: "Jami mijozlar",
      value: totalCustomers,
      color: "text-blue-600",
    },
    {
      title: "Qarzdorlar",
      value: debtCustomers,
      color: "text-red-600",
    },
    {
      title: "Jami qarz",
      value: `${totalDebt.toLocaleString()} so'm`,
      color: "text-orange-600",
    },
    {
      title: "Qarzsiz",
      value: paidCustomers,
      color: "text-green-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-2xl shadow p-6 border border-gray-100"
        >
          <p className="text-gray-500">{card.title}</p>

          <h2 className={`text-3xl font-bold mt-3 ${card.color}`}>
            {card.value}
          </h2>
        </div>
      ))}
    </div>
  );
}

export default CustomerStats;