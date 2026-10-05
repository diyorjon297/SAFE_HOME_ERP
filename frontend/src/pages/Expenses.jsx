import React, { useMemo, useState } from "react";

const INITIAL_EXPENSES = [
  {
    id: 1,
    date: "2026-09-09",
    category: "material",
    title: "Kabel",
    amount: 950000,
    currency: "UZS",
    object: "10 ta maktab",
    source: "Kassa",
    note: "Obyekt uchun kabel",
  },
  {
    id: 2,
    date: "2026-09-08",
    category: "employee",
    title: "Javoxr ish haqi",
    amount: 800000,
    currency: "UZS",
    object: "10 ta maktab",
    source: "Kassa",
    note: "4 kunlik ish",
  },
];

const CATEGORIES = [
  { value: "material", label: "📦 Material" },
  { value: "employee", label: "👷 Xodim" },
  { value: "transport", label: "🚚 Transport" },
  { value: "office", label: "🏢 Ofis" },
  { value: "communication", label: "📱 Aloqa" },
  { value: "tax", label: "🧾 Soliq" },
  { value: "additional_work", label: "🔧 Qo‘shimcha ish" },
  { value: "other", label: "📌 Boshqa" },
];

const SOURCES = [
  "Kassa",
  "Anorbank",
  "Agrobank",
  "Boshqa bank",
  "Click / Payme",
  "Boshqa",
];

const OBJECTS = [
  "Obyekt tanlanmagan",
  "10 ta maktab",
  "12-Bog‘cha",
];

function money(value, currency) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("uz-UZ").format(number) +
    (currency === "USD" ? " $" : " so‘m");
}

function categoryLabel(value) {
  return (
    CATEGORIES.find((item) => item.value === value)?.label || value
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function Expenses() {
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    date: today(),
    category: "material",
    title: "",
    amount: "",
    currency: "UZS",
    object: "Obyekt tanlanmagan",
    source: "Kassa",
    note: "",
  });

  const filteredExpenses = useMemo(() => {
    const q = search.trim().toLowerCase();

    return expenses.filter((item) => {
      const matchesSearch =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.object.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q);

      const matchesCategory =
        categoryFilter === "all" ||
        item.category === categoryFilter;

      const matchesCurrency =
        currencyFilter === "all" ||
        item.currency === currencyFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesCurrency
      );
    });
  }, [expenses, search, categoryFilter, currencyFilter]);

  const totals = useMemo(() => {
    let uzs = 0;
    let usd = 0;

    expenses.forEach((item) => {
      if (item.currency === "UZS") {
        uzs += Number(item.amount || 0);
      }

      if (item.currency === "USD") {
        usd += Number(item.amount || 0);
      }
    });

    return {
      count: expenses.length,
      uzs,
      usd,
    };
  }, [expenses]);

  function openCreate() {
    setEditingId(null);

    setForm({
      date: today(),
      category: "material",
      title: "",
      amount: "",
      currency: "UZS",
      object: "Obyekt tanlanmagan",
      source: "Kassa",
      note: "",
    });

    setModalOpen(true);
  }

  function openEdit(item) {
    setEditingId(item.id);

    setForm({
      date: item.date,
      category: item.category,
      title: item.title,
      amount: item.amount,
      currency: item.currency,
      object: item.object,
      source: item.source,
      note: item.note,
    });

    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingId(null);
  }

  function updateForm(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function saveExpense(e) {
    e.preventDefault();

    const amount = Number(form.amount);

    if (!form.title.trim()) {
      alert("Xarajat nomini kiriting.");
      return;
    }

    if (!amount || amount <= 0) {
      alert("Xarajat summasini kiriting.");
      return;
    }

    const newExpense = {
      id: editingId || Date.now(),
      date: form.date,
      category: form.category,
      title: form.title.trim(),
      amount,
      currency: form.currency,
      object: form.object,
      source: form.source,
      note: form.note.trim(),
    };

    if (editingId) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === editingId ? newExpense : item
        )
      );
    } else {
      setExpenses((prev) => [newExpense, ...prev]);
    }

    closeModal();
  }

  function deleteExpense(id) {
    const item = expenses.find((x) => x.id === id);

    if (!item) return;

    const ok = window.confirm(
      `"${item.title}" xarajatini o‘chirmoqchimisiz?`
    );

    if (!ok) return;

    setExpenses((prev) =>
      prev.filter((x) => x.id !== id)
    );
  }

  return (
    <div className="expenses-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        .expenses-page {
          min-height: 100vh;
          padding: 28px;
          background: #f5f7fb;
          color: #172033;
          font-family: Arial, sans-serif;
        }

        .expenses-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .expenses-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-bottom: 24px;
        }

        .expenses-title {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .expenses-icon {
          width: 52px;
          height: 52px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
          font-size: 25px;
          box-shadow: 0 8px 22px rgba(220,38,38,.20);
        }

        .expenses-title h1 {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
        }

        .expenses-title p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 13px;
        }

        .add-expense-btn {
          border: 0;
          border-radius: 12px;
          padding: 13px 18px;
          background: #dc2626;
          color: white;
          font-size: 14px;
          font-weight: 750;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(220,38,38,.18);
        }

        .add-expense-btn:hover {
          background: #b91c1c;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .summary-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 17px;
          padding: 20px;
          box-shadow: 0 4px 16px rgba(15,23,42,.04);
        }

        .summary-label {
          color: #64748b;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .4px;
        }

        .summary-value {
          margin-top: 9px;
          font-size: 25px;
          font-weight: 850;
        }

        .summary-red {
          color: #dc2626;
        }

        .summary-blue {
          color: #2563eb;
        }

        .summary-green {
          color: #059669;
        }

        .toolbar {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 17px;
          padding: 16px;
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          box-shadow: 0 4px 16px rgba(15,23,42,.04);
        }

        .search-input,
        .filter-select {
          height: 43px;
          border: 1px solid #dbe2ea;
          border-radius: 10px;
          background: white;
          padding: 0 13px;
          outline: none;
          font-size: 13px;
        }

        .search-input {
          flex: 1;
          min-width: 220px;
        }

        .search-input:focus,
        .filter-select:focus,
        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(59,130,246,.10);
        }

        .filter-select {
          min-width: 170px;
        }

        .table-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 17px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(15,23,42,.04);
        }

        .table-head {
          padding: 17px 20px;
          border-bottom: 1px solid #edf0f4;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .table-head-title {
          font-size: 15px;
          font-weight: 800;
        }

        .table-count {
          color: #64748b;
          font-size: 12px;
        }

        .table-wrapper {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          background: #f8fafc;
          color: #64748b;
          text-align: left;
          padding: 13px 16px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .4px;
          white-space: nowrap;
        }

        td {
          padding: 15px 16px;
          border-top: 1px solid #f0f2f5;
          font-size: 13px;
          white-space: nowrap;
        }

        tr:hover td {
          background: #fafcff;
        }

        .expense-name {
          font-weight: 750;
        }

        .expense-note {
          color: #94a3b8;
          font-size: 11px;
          margin-top: 3px;
        }

        .category-badge {
          display: inline-flex;
          padding: 6px 9px;
          border-radius: 8px;
          background: #f1f5f9;
          font-size: 11px;
          font-weight: 700;
        }

        .currency-badge {
          display: inline-flex;
          padding: 5px 8px;
          border-radius: 7px;
          font-size: 10px;
          font-weight: 800;
        }

        .currency-uzs {
          color: #047857;
          background: #ecfdf5;
        }

        .currency-usd {
          color: #1d4ed8;
          background: #eff6ff;
        }

        .amount {
          font-weight: 850;
        }

        .actions {
          display: flex;
          gap: 7px;
        }

        .action-btn {
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 8px;
          padding: 7px 9px;
          cursor: pointer;
          font-size: 12px;
        }

        .action-btn:hover {
          background: #f8fafc;
        }

        .delete-btn {
          color: #dc2626;
        }

        .empty {
          padding: 65px 20px;
          text-align: center;
          color: #94a3b8;
        }

        .empty-icon {
          font-size: 38px;
          margin-bottom: 10px;
        }

        .empty-title {
          color: #475569;
          font-weight: 800;
          margin-bottom: 5px;
        }

        .modal-bg {
          position: fixed;
          inset: 0;
          background: rgba(15,23,42,.55);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          z-index: 9999;
        }

        .modal {
          width: 100%;
          max-width: 720px;
          max-height: 92vh;
          overflow-y: auto;
          background: white;
          border-radius: 20px;
          box-shadow: 0 30px 80px rgba(15,23,42,.30);
        }

        .modal-header {
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f4;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 19px;
        }

        .close-btn {
          width: 34px;
          height: 34px;
          border: 0;
          border-radius: 9px;
          background: #f1f5f9;
          cursor: pointer;
          font-size: 18px;
        }

        .form {
          padding: 22px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 7px;
        }

        .form-group.full {
          grid-column: 1 / -1;
        }

        .form-label {
          color: #475569;
          font-size: 12px;
          font-weight: 750;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          border: 1px solid #dbe2ea;
          border-radius: 10px;
          padding: 11px 12px;
          outline: none;
          font-size: 13px;
          background: white;
        }

        .form-textarea {
          min-height: 90px;
          resize: vertical;
        }

        .currency-buttons {
          display: flex;
          gap: 8px;
        }

        .currency-button {
          flex: 1;
          padding: 11px;
          border: 1px solid #dbe2ea;
          border-radius: 10px;
          background: white;
          cursor: pointer;
          font-weight: 750;
        }

        .currency-button.active-uzs {
          background: #ecfdf5;
          border-color: #10b981;
          color: #047857;
        }

        .currency-button.active-usd {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #1d4ed8;
        }

        .modal-footer {
          margin-top: 22px;
          display: flex;
          justify-content: flex-end;
          gap: 9px;
        }

        .cancel-btn,
        .save-btn {
          border: 0;
          border-radius: 10px;
          padding: 11px 17px;
          cursor: pointer;
          font-weight: 750;
        }

        .cancel-btn {
          background: #f1f5f9;
          color: #475569;
        }

        .save-btn {
          background: #dc2626;
          color: white;
        }

        @media (max-width: 850px) {
          .expenses-page {
            padding: 15px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .expenses-header {
            align-items: flex-start;
            flex-direction: column;
          }

          .toolbar {
            flex-direction: column;
          }

          .search-input,
          .filter-select {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .form-grid {
            grid-template-columns: 1fr;
          }

          .form-group.full {
            grid-column: auto;
          }

          .expenses-title h1 {
            font-size: 22px;
          }
        }
      `}</style>

      <div className="expenses-container">

        {/* HEADER */}
        <div className="expenses-header">
          <div className="expenses-title">
            <div className="expenses-icon">💸</div>

            <div>
              <h1>Xarajatlar</h1>
              <p>
                Korxona va obyektlar bo‘yicha barcha xarajatlarni boshqaring
              </p>
            </div>
          </div>

          <button
            className="add-expense-btn"
            onClick={openCreate}
          >
            + Xarajat qo‘shish
          </button>
        </div>

        {/* SUMMARY */}
        <div className="summary-grid">

          <div className="summary-card">
            <div className="summary-label">
              Jami xarajatlar
            </div>

            <div className="summary-value summary-red">
              {totals.count} ta
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              UZS xarajat
            </div>

            <div className="summary-value summary-green">
              {new Intl.NumberFormat("uz-UZ").format(totals.uzs)} so‘m
            </div>
          </div>

          <div className="summary-card">
            <div className="summary-label">
              USD xarajat
            </div>

            <div className="summary-value summary-blue">
              {new Intl.NumberFormat("en-US").format(totals.usd)} $
            </div>
          </div>

        </div>

        {/* FILTERS */}
        <div className="toolbar">

          <input
            className="search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="🔎 Xarajat, obyekt yoki izoh bo‘yicha qidirish..."
          />

          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value)
            }
          >
            <option value="all">
              Barcha kategoriyalar
            </option>

            {CATEGORIES.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={currencyFilter}
            onChange={(e) =>
              setCurrencyFilter(e.target.value)
            }
          >
            <option value="all">
              Barcha valyuta
            </option>

            <option value="UZS">
              🇺🇿 UZS
            </option>

            <option value="USD">
              💵 USD
            </option>
          </select>

        </div>

        {/* TABLE */}
        <div className="table-card">

          <div className="table-head">
            <div className="table-head-title">
              Xarajatlar ro‘yxati
            </div>

            <div className="table-count">
              {filteredExpenses.length} ta yozuv
            </div>
          </div>

          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>Sana</th>
                  <th>Xarajat</th>
                  <th>Kategoriya</th>
                  <th>Obyekt</th>
                  <th>Manba</th>
                  <th>Valyuta</th>
                  <th>Summa</th>
                  <th>Amal</th>
                </tr>
              </thead>

              <tbody>

                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan="8">
                      <div className="empty">
                        <div className="empty-icon">
                          💸
                        </div>

                        <div className="empty-title">
                          Xarajat topilmadi
                        </div>

                        <div>
                          Yangi xarajat qo‘shish uchun
                          yuqoridagi tugmani bosing.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((item) => (
                    <tr key={item.id}>

                      <td>
                        {item.date}
                      </td>

                      <td>
                        <div className="expense-name">
                          {item.title}
                        </div>

                        {item.note && (
                          <div className="expense-note">
                            {item.note}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className="category-badge">
                          {categoryLabel(item.category)}
                        </span>
                      </td>

                      <td>
                        {item.object}
                      </td>

                      <td>
                        {item.source}
                      </td>

                      <td>
                        <span
                          className={
                            item.currency === "UZS"
                              ? "currency-badge currency-uzs"
                              : "currency-badge currency-usd"
                          }
                        >
                          {item.currency}
                        </span>
                      </td>

                      <td>
                        <span className="amount">
                          {money(
                            item.amount,
                            item.currency
                          )}
                        </span>
                      </td>

                      <td>
                        <div className="actions">

                          <button
                            className="action-btn"
                            onClick={() =>
                              openEdit(item)
                            }
                          >
                            ✏️
                          </button>

                          <button
                            className="action-btn delete-btn"
                            onClick={() =>
                              deleteExpense(item.id)
                            }
                          >
                            🗑
                          </button>

                        </div>
                      </td>

                    </tr>
                  ))
                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

      {/* MODAL */}
      {modalOpen && (
        <div
          className="modal-bg"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="modal">

            <div className="modal-header">

              <h2>
                {editingId
                  ? "Xarajatni tahrirlash"
                  : "Yangi xarajat"}
              </h2>

              <button
                className="close-btn"
                onClick={closeModal}
              >
                ×
              </button>

            </div>

            <form
              className="form"
              onSubmit={saveExpense}
            >

              <div className="form-grid">

                {/* DATE */}
                <div className="form-group">
                  <label className="form-label">
                    Sana
                  </label>

                  <input
                    className="form-input"
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      updateForm(
                        "date",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* CATEGORY */}
                <div className="form-group">
                  <label className="form-label">
                    Kategoriya
                  </label>

                  <select
                    className="form-select"
                    value={form.category}
                    onChange={(e) =>
                      updateForm(
                        "category",
                        e.target.value
                      )
                    }
                  >
                    {CATEGORIES.map((item) => (
                      <option
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TITLE */}
                <div className="form-group full">
                  <label className="form-label">
                    Xarajat nomi *
                  </label>

                  <input
                    className="form-input"
                    value={form.title}
                    onChange={(e) =>
                      updateForm(
                        "title",
                        e.target.value
                      )
                    }
                    placeholder="Masalan: 305m kabel, ishchi maoshi..."
                  />
                </div>

                {/* AMOUNT */}
                <div className="form-group">
                  <label className="form-label">
                    Summa *
                  </label>

                  <input
                    className="form-input"
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      updateForm(
                        "amount",
                        e.target.value
                      )
                    }
                    placeholder="0"
                  />
                </div>

                {/* CURRENCY */}
                <div className="form-group">
                  <label className="form-label">
                    Valyuta
                  </label>

                  <div className="currency-buttons">

                    <button
                      type="button"
                      className={
                        form.currency === "UZS"
                          ? "currency-button active-uzs"
                          : "currency-button"
                      }
                      onClick={() =>
                        updateForm(
                          "currency",
                          "UZS"
                        )
                      }
                    >
                      🇺🇿 UZS
                    </button>

                    <button
                      type="button"
                      className={
                        form.currency === "USD"
                          ? "currency-button active-usd"
                          : "currency-button"
                      }
                      onClick={() =>
                        updateForm(
                          "currency",
                          "USD"
                        )
                      }
                    >
                      💵 USD
                    </button>

                  </div>
                </div>

                {/* OBJECT */}
                <div className="form-group">
                  <label className="form-label">
                    Obyekt
                  </label>

                  <select
                    className="form-select"
                    value={form.object}
                    onChange={(e) =>
                      updateForm(
                        "object",
                        e.target.value
                      )
                    }
                  >
                    {OBJECTS.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SOURCE */}
                <div className="form-group">
                  <label className="form-label">
                    Pul manbasi
                  </label>

                  <select
                    className="form-select"
                    value={form.source}
                    onChange={(e) =>
                      updateForm(
                        "source",
                        e.target.value
                      )
                    }
                  >
                    {SOURCES.map((item) => (
                      <option
                        key={item}
                        value={item}
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                {/* NOTE */}
                <div className="form-group full">
                  <label className="form-label">
                    Izoh
                  </label>

                  <textarea
                    className="form-textarea"
                    value={form.note}
                    onChange={(e) =>
                      updateForm(
                        "note",
                        e.target.value
                      )
                    }
                    placeholder="Qo‘shimcha ma'lumot..."
                  />
                </div>

              </div>

              <div className="modal-footer">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModal}
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  className="save-btn"
                >
                  {editingId
                    ? "Saqlash"
                    : "Xarajatni saqlash"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}