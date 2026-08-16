import React, { useEffect, useState } from "react";
import API from "../api";

function Moliya() {
  const [receivables, setReceivables] = useState([]);
  const [income, setIncome] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    receivables_count: 0,
    receivables_remaining: 0,
    total_income_uzs: 0,
    total_expense_uzs: 0,
    net_balance_uzs: 0,
  });

  const [loading, setLoading] = useState(true);

  const [showReceivableForm, setShowReceivableForm] =
    useState(false);

  const [showIncomeForm, setShowIncomeForm] =
    useState(false);

  const [showExpenseForm, setShowExpenseForm] =
    useState(false);

  const [paymentId, setPaymentId] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentNote, setPaymentNote] = useState("");

  const [historyId, setHistoryId] = useState(null);
  const [history, setHistory] = useState([]);

  const [receivableForm, setReceivableForm] = useState({
    customer_name: "",
    title: "",
    amount: "",
    currency: "UZS",
    due_date: "",
    note: "",
  });

  const [incomeForm, setIncomeForm] = useState({
    title: "",
    amount: "",
    currency: "UZS",
    category: "",
    note: "",
  });

  const [expenseForm, setExpenseForm] = useState({
    title: "",
    amount: "",
    currency: "UZS",
    category: "",
    note: "",
  });

  // =====================================================
  // FORMAT
  // =====================================================

  const formatMoney = (value, currency = "UZS") => {
    const number = Number(value || 0);

    return (
      new Intl.NumberFormat("uz-UZ").format(number) +
      (currency === "USD" ? " $" : " so'm")
    );
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleString("uz-UZ");
  };

  // =====================================================
  // LOAD
  // =====================================================

  const loadFinance = async () => {
    try {
      setLoading(true);

      const [
        receivablesResponse,
        incomeResponse,
        expenseResponse,
        summaryResponse,
      ] = await Promise.all([
        API.get("/finance/receivables"),
        API.get("/finance/income"),
        API.get("/finance/expense"),
        API.get("/finance/summary"),
      ]);

      setReceivables(
        Array.isArray(receivablesResponse.data)
          ? receivablesResponse.data
          : []
      );

      setIncome(
        Array.isArray(incomeResponse.data)
          ? incomeResponse.data
          : []
      );

      setExpenses(
        Array.isArray(expenseResponse.data)
          ? expenseResponse.data
          : []
      );

      setSummary(
        summaryResponse.data || {
          receivables_count: 0,
          receivables_remaining: 0,
          total_income_uzs: 0,
          total_expense_uzs: 0,
          net_balance_uzs: 0,
        }
      );
    } catch (error) {
      console.error(
        "Moliya ma'lumotlarini yuklashda xato:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Moliya ma'lumotlarini yuklashda xato"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFinance();
  }, []);

  // =====================================================
  // ADD RECEIVABLE
  // =====================================================

  const addReceivable = async (e) => {
    e.preventDefault();

    try {
      await API.post("/finance/receivables", {
        customer_name:
          receivableForm.customer_name,
        title: receivableForm.title || null,
        amount: Number(receivableForm.amount),
        paid: 0,
        currency: receivableForm.currency,
        due_date:
          receivableForm.due_date
            ? new Date(
                receivableForm.due_date
              ).toISOString()
            : null,
        note: receivableForm.note || null,
      });

      setReceivableForm({
        customer_name: "",
        title: "",
        amount: "",
        currency: "UZS",
        due_date: "",
        note: "",
      });

      setShowReceivableForm(false);

      await loadFinance();

      alert("Qarzdor muvaffaqiyatli qo'shildi");
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "Qarzdorni qo'shishda xato"
      );
    }
  };

  // =====================================================
  // ADD INCOME
  // =====================================================

  const addIncome = async (e) => {
    e.preventDefault();

    try {
      await API.post("/finance/income", {
        title: incomeForm.title,
        amount: Number(incomeForm.amount),
        currency: incomeForm.currency,
        category: incomeForm.category || null,
        note: incomeForm.note || null,
      });

      setIncomeForm({
        title: "",
        amount: "",
        currency: "UZS",
        category: "",
        note: "",
      });

      setShowIncomeForm(false);

      await loadFinance();

      alert("Kirim muvaffaqiyatli qo'shildi");
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "Kirim qo'shishda xato"
      );
    }
  };

  // =====================================================
  // ADD EXPENSE
  // =====================================================

  const addExpense = async (e) => {
    e.preventDefault();

    try {
      await API.post("/finance/expense", {
        title: expenseForm.title,
        amount: Number(expenseForm.amount),
        currency: expenseForm.currency,
        category: expenseForm.category || null,
        note: expenseForm.note || null,
      });

      setExpenseForm({
        title: "",
        amount: "",
        currency: "UZS",
        category: "",
        note: "",
      });

      setShowExpenseForm(false);

      await loadFinance();

      alert("Chiqim muvaffaqiyatli qo'shildi");
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "Chiqim qo'shishda xato"
      );
    }
  };

  // =====================================================
  // PAYMENT
  // =====================================================

  const addPayment = async (e) => {
    e.preventDefault();

    try {
      await API.post(
        `/finance/receivables/${paymentId}/payment`,
        {
          amount: Number(paymentAmount),
          note: paymentNote || null,
        }
      );

      setPaymentId(null);
      setPaymentAmount("");
      setPaymentNote("");

      await loadFinance();

      alert("To'lov qabul qilindi");
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "To'lovda xato"
      );
    }
  };

  // =====================================================
  // HISTORY
  // =====================================================

  const showHistory = async (id) => {
    try {
      const response = await API.get(
        `/finance/receivables/${id}/payments`
      );

      setHistory(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      setHistoryId(id);
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "To'lov tarixini olishda xato"
      );
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const deleteReceivable = async (id) => {
    const confirmDelete = window.confirm(
      "Bu qarzdorni o'chirmoqchimisiz?"
    );

    if (!confirmDelete) return;

    try {
      await API.delete(
        `/finance/receivables/${id}`
      );

      await loadFinance();

      alert("Qarzdor o'chirildi");
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          "O'chirishda xato"
      );
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div style={pageStyle}>
        <h1>Moliya</h1>

        <div style={loadingStyle}>
          Moliya ma'lumotlari yuklanmoqda...
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div style={pageStyle}>
      {/* HEADER */}

      <div style={headerStyle}>
        <div>
          <h1 style={{ margin: 0 }}>
            💰 Moliya
          </h1>

          <p style={{ color: "#64748b" }}>
            SAFE HOME SERVICES moliyaviy boshqaruvi
          </p>
        </div>

        <button
          onClick={loadFinance}
          style={refreshButton}
        >
          🔄 Yangilash
        </button>
      </div>

      {/* SUMMARY */}

      <div style={summaryGrid}>
        <div style={summaryCard}>
          <div style={summaryIcon}>💰</div>

          <div>
            <div style={summaryTitle}>
              Balans
            </div>

            <div style={summaryValue}>
              {formatMoney(
                summary.net_balance_uzs
              )}
            </div>
          </div>
        </div>

        <div style={summaryCard}>
          <div style={summaryIcon}>📥</div>

          <div>
            <div style={summaryTitle}>
              Jami kirim
            </div>

            <div style={summaryValue}>
              {formatMoney(
                summary.total_income_uzs
              )}
            </div>
          </div>
        </div>

        <div style={summaryCard}>
          <div style={summaryIcon}>📤</div>

          <div>
            <div style={summaryTitle}>
              Jami chiqim
            </div>

            <div style={summaryValue}>
              {formatMoney(
                summary.total_expense_uzs
              )}
            </div>
          </div>
        </div>

        <div style={summaryCard}>
          <div style={summaryIcon}>👤</div>

          <div>
            <div style={summaryTitle}>
              Mendan qarzdorlar
            </div>

            <div style={summaryValue}>
              {summary.receivables_count} ta
            </div>
          </div>
        </div>
      </div>

      {/* ACTIONS */}

      <div style={actionsStyle}>
        <button
          onClick={() =>
            setShowReceivableForm(
              !showReceivableForm
            )
          }
          style={blueButton}
        >
          ➕ Mendan qarzdor qo'shish
        </button>

        <button
          onClick={() =>
            setShowIncomeForm(!showIncomeForm)
          }
          style={greenButton}
        >
          📥 Kirim qo'shish
        </button>

        <button
          onClick={() =>
            setShowExpenseForm(!showExpenseForm)
          }
          style={redButton}
        >
          📤 Chiqim qo'shish
        </button>
      </div>

      {/* RECEIVABLE FORM */}

      {showReceivableForm && (
        <form
          onSubmit={addReceivable}
          style={formCard}
        >
          <h2>Mendan qarzdor qo'shish</h2>

          <div style={formGrid}>
            <input
              required
              placeholder="Mijoz nomi"
              value={
                receivableForm.customer_name
              }
              onChange={(e) =>
                setReceivableForm({
                  ...receivableForm,
                  customer_name:
                    e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Izoh / sabab"
              value={receivableForm.title}
              onChange={(e) =>
                setReceivableForm({
                  ...receivableForm,
                  title: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              required
              type="number"
              min="0"
              placeholder="Summa"
              value={receivableForm.amount}
              onChange={(e) =>
                setReceivableForm({
                  ...receivableForm,
                  amount: e.target.value,
                })
              }
              style={inputStyle}
            />

            <select
              value={
                receivableForm.currency
              }
              onChange={(e) =>
                setReceivableForm({
                  ...receivableForm,
                  currency: e.target.value,
                })
              }
              style={inputStyle}
            >
              <option value="UZS">
                UZS — so'm
              </option>

              <option value="USD">
                USD — dollar
              </option>
            </select>

            <input
              type="date"
              value={
                receivableForm.due_date
              }
              onChange={(e) =>
                setReceivableForm({
                  ...receivableForm,
                  due_date: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Qo'shimcha izoh"
              value={receivableForm.note}
              onChange={(e) =>
                setReceivableForm({
                  ...receivableForm,
                  note: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={saveButton}
          >
            Saqlash
          </button>
        </form>
      )}

      {/* INCOME FORM */}

      {showIncomeForm && (
        <form
          onSubmit={addIncome}
          style={formCard}
        >
          <h2>📥 Kirim qo'shish</h2>

          <div style={formGrid}>
            <input
              required
              placeholder="Kirim nomi"
              value={incomeForm.title}
              onChange={(e) =>
                setIncomeForm({
                  ...incomeForm,
                  title: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              required
              type="number"
              min="0"
              placeholder="Summa"
              value={incomeForm.amount}
              onChange={(e) =>
                setIncomeForm({
                  ...incomeForm,
                  amount: e.target.value,
                })
              }
              style={inputStyle}
            />

            <select
              value={incomeForm.currency}
              onChange={(e) =>
                setIncomeForm({
                  ...incomeForm,
                  currency: e.target.value,
                })
              }
              style={inputStyle}
            >
              <option value="UZS">
                UZS — so'm
              </option>

              <option value="USD">
                USD — dollar
              </option>
            </select>

            <input
              placeholder="Kategoriya"
              value={incomeForm.category}
              onChange={(e) =>
                setIncomeForm({
                  ...incomeForm,
                  category: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Izoh"
              value={incomeForm.note}
              onChange={(e) =>
                setIncomeForm({
                  ...incomeForm,
                  note: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={saveButton}
          >
            Kirimni saqlash
          </button>
        </form>
      )}

      {/* EXPENSE FORM */}

      {showExpenseForm && (
        <form
          onSubmit={addExpense}
          style={formCard}
        >
          <h2>📤 Chiqim qo'shish</h2>

          <div style={formGrid}>
            <input
              required
              placeholder="Chiqim nomi"
              value={expenseForm.title}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
                  title: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              required
              type="number"
              min="0"
              placeholder="Summa"
              value={expenseForm.amount}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
                  amount: e.target.value,
                })
              }
              style={inputStyle}
            />

            <select
              value={expenseForm.currency}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
                  currency: e.target.value,
                })
              }
              style={inputStyle}
            >
              <option value="UZS">
                UZS — so'm
              </option>

              <option value="USD">
                USD — dollar
              </option>
            </select>

            <input
              placeholder="Kategoriya"
              value={expenseForm.category}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
                  category: e.target.value,
                })
              }
              style={inputStyle}
            />

            <input
              placeholder="Izoh"
              value={expenseForm.note}
              onChange={(e) =>
                setExpenseForm({
                  ...expenseForm,
                  note: e.target.value,
                })
              }
              style={inputStyle}
            />
          </div>

          <button
            type="submit"
            style={saveButton}
          >
            Chiqimni saqlash
          </button>
        </form>
      )}

      {/* MENDAN QARZDORLAR */}

      <div style={sectionCard}>
        <div style={sectionHeader}>
          <h2>👤 Mendan qarzdorlar</h2>

          <span style={badge}>
            {receivables.length} ta
          </span>
        </div>

        {receivables.length === 0 ? (
          <div style={emptyStyle}>
            Hozircha sizdan qarzdorlar yo'q
          </div>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>ID</th>
                  <th style={thStyle}>Mijoz</th>
                  <th style={thStyle}>Izoh</th>
                  <th style={thStyle}>Jami</th>
                  <th style={thStyle}>To'langan</th>
                  <th style={thStyle}>Qoldiq</th>
                  <th style={thStyle}>Holat</th>
                  <th style={thStyle}>Muddat</th>
                  <th style={thStyle}>Amallar</th>
                </tr>
              </thead>

              <tbody>
                {receivables.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>
                      {item.id}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        fontWeight: "700",
                      }}
                    >
                      {item.customer_name}
                    </td>

                    <td style={tdStyle}>
                      {item.title || "-"}
                    </td>

                    <td style={tdStyle}>
                      {formatMoney(
                        item.amount,
                        item.currency
                      )}
                    </td>

                    <td style={tdStyle}>
                      {formatMoney(
                        item.paid,
                        item.currency
                      )}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        color:
                          item.remaining > 0
                            ? "#dc2626"
                            : "#16a34a",
                        fontWeight: "700",
                      }}
                    >
                      {formatMoney(
                        item.remaining,
                        item.currency
                      )}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={
                          item.remaining > 0
                            ? debtBadge
                            : paidBadge
                        }
                      >
                        {item.remaining > 0
                          ? "Qarzdor"
                          : "To'langan"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      {item.due_date
                        ? formatDate(
                            item.due_date
                          )
                        : "-"}
                    </td>

                    <td style={tdStyle}>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        {item.remaining > 0 && (
                          <button
                            onClick={() =>
                              setPaymentId(
                                item.id
                              )
                            }
                            style={smallGreen}
                          >
                            💵 To'lov
                          </button>
                        )}

                        <button
                          onClick={() =>
                            showHistory(item.id)
                          }
                          style={smallBlue}
                        >
                          📜 Tarix
                        </button>

                        <button
                          onClick={() =>
                            deleteReceivable(
                              item.id
                            )
                          }
                          style={smallRed}
                        >
                          🗑
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

      {/* KIRIM */}

      <div style={sectionCard}>
        <div style={sectionHeader}>
          <h2>📥 Kirimlar</h2>

          <span style={incomeBadge}>
            {income.length} ta
          </span>
        </div>

        {income.length === 0 ? (
          <div style={emptyStyle}>
            Hozircha kirimlar yo'q
          </div>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Sana</th>
                  <th style={thStyle}>Nomi</th>
                  <th style={thStyle}>Kategoriya</th>
                  <th style={thStyle}>Summa</th>
                  <th style={thStyle}>Izoh</th>
                </tr>
              </thead>

              <tbody>
                {income.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>
                      {formatDate(
                        item.income_date
                      )}
                    </td>

                    <td style={tdStyle}>
                      {item.title}
                    </td>

                    <td style={tdStyle}>
                      {item.category || "-"}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        color: "#16a34a",
                        fontWeight: "700",
                      }}
                    >
                      +
                      {formatMoney(
                        item.amount,
                        item.currency
                      )}
                    </td>

                    <td style={tdStyle}>
                      {item.note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CHIQIM */}

      <div style={sectionCard}>
        <div style={sectionHeader}>
          <h2>📤 Chiqimlar</h2>

          <span style={expenseBadge}>
            {expenses.length} ta
          </span>
        </div>

        {expenses.length === 0 ? (
          <div style={emptyStyle}>
            Hozircha chiqimlar yo'q
          </div>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Sana</th>
                  <th style={thStyle}>Nomi</th>
                  <th style={thStyle}>Kategoriya</th>
                  <th style={thStyle}>Summa</th>
                  <th style={thStyle}>Izoh</th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((item) => (
                  <tr key={item.id}>
                    <td style={tdStyle}>
                      {formatDate(
                        item.expense_date
                      )}
                    </td>

                    <td style={tdStyle}>
                      {item.title}
                    </td>

                    <td style={tdStyle}>
                      {item.category || "-"}
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        color: "#dc2626",
                        fontWeight: "700",
                      }}
                    >
                      -
                      {formatMoney(
                        item.amount,
                        item.currency
                      )}
                    </td>

                    <td style={tdStyle}>
                      {item.note || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYMENT MODAL */}

      {paymentId !== null && (
        <div style={modalOverlay}>
          <form
            onSubmit={addPayment}
            style={modalStyle}
          >
            <h2>💵 To'lov qabul qilish</h2>

            <input
              required
              type="number"
              min="0"
              placeholder="To'lov summasi"
              value={paymentAmount}
              onChange={(e) =>
                setPaymentAmount(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <input
              placeholder="Izoh"
              value={paymentNote}
              onChange={(e) =>
                setPaymentNote(
                  e.target.value
                )
              }
              style={inputStyle}
            />

            <div style={modalButtons}>
              <button
                type="button"
                onClick={() => {
                  setPaymentId(null);
                  setPaymentAmount("");
                  setPaymentNote("");
                }}
                style={cancelButton}
              >
                Bekor qilish
              </button>

              <button
                type="submit"
                style={saveButton}
              >
                To'lovni saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* HISTORY MODAL */}

      {historyId !== null && (
        <div style={modalOverlay}>
          <div style={modalStyle}>
            <h2>📜 To'lovlar tarixi</h2>

            {history.length === 0 ? (
              <div style={emptyStyle}>
                Hali to'lovlar mavjud emas
              </div>
            ) : (
              <div
                style={{
                  maxHeight: "400px",
                  overflowY: "auto",
                }}
              >
                {history.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      padding: "12px",
                      borderBottom:
                        "1px solid #e5e7eb",
                    }}
                  >
                    <strong>
                      {formatMoney(
                        item.amount,
                        item.currency
                      )}
                    </strong>

                    <div
                      style={{
                        color: "#64748b",
                        fontSize: "13px",
                        marginTop: "4px",
                      }}
                    >
                      {formatDate(
                        item.payment_date
                      )}
                    </div>

                    {item.note && (
                      <div
                        style={{
                          marginTop: "5px",
                        }}
                      >
                        {item.note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={() =>
                setHistoryId(null)
              }
              style={cancelButton}
            >
              Yopish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// =======================================================
// STYLES
// =======================================================

const pageStyle = {
  padding: "24px",
  width: "100%",
  boxSizing: "border-box",
  background: "#f8fafc",
  minHeight: "100vh",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "24px",
  gap: "15px",
};

const loadingStyle = {
  background: "#fff",
  padding: "40px",
  borderRadius: "14px",
  textAlign: "center",
};

const refreshButton = {
  border: "none",
  borderRadius: "9px",
  padding: "11px 18px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
};

const summaryGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "16px",
  marginBottom: "24px",
};

const summaryCard = {
  background: "#fff",
  borderRadius: "14px",
  padding: "20px",
  display: "flex",
  alignItems: "center",
  gap: "15px",
  boxShadow: "0 2px 8px rgba(0,0,0,.06)",
};

const summaryIcon = {
  fontSize: "30px",
};

const summaryTitle = {
  color: "#64748b",
  fontSize: "14px",
};

const summaryValue = {
  fontSize: "22px",
  fontWeight: "800",
  marginTop: "4px",
};

const actionsStyle = {
  display: "flex",
  gap: "10px",
  flexWrap: "wrap",
  marginBottom: "20px",
};

const blueButton = {
  border: "none",
  borderRadius: "9px",
  padding: "12px 18px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
};

const greenButton = {
  ...blueButton,
  background: "#16a34a",
};

const redButton = {
  ...blueButton,
  background: "#dc2626",
};

const formCard = {
  background: "#fff",
  padding: "22px",
  borderRadius: "14px",
  marginBottom: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,.06)",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "12px",
  marginBottom: "16px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "12px",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  fontSize: "14px",
  background: "#fff",
};

const saveButton = {
  border: "none",
  borderRadius: "9px",
  padding: "11px 18px",
  background: "#16a34a",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "700",
};

const cancelButton = {
  border: "none",
  borderRadius: "9px",
  padding: "11px 18px",
  background: "#64748b",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "600",
};

const sectionCard = {
  background: "#fff",
  borderRadius: "14px",
  marginBottom: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,.06)",
  overflow: "hidden",
};

const sectionHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "18px 20px",
  borderBottom: "1px solid #e5e7eb",
};

const badge = {
  background: "#dbeafe",
  color: "#1d4ed8",
  padding: "5px 10px",
  borderRadius: "20px",
  fontSize: "13px",
  fontWeight: "700",
};

const incomeBadge = {
  ...badge,
  background: "#dcfce7",
  color: "#15803d",
};

const expenseBadge = {
  ...badge,
  background: "#fee2e2",
  color: "#b91c1c",
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const thStyle = {
  padding: "13px",
  textAlign: "left",
  background: "#f8fafc",
  borderBottom: "1px solid #e5e7eb",
  whiteSpace: "nowrap",
  fontSize: "13px",
};

const tdStyle = {
  padding: "13px",
  borderBottom: "1px solid #f1f5f9",
  whiteSpace: "nowrap",
  fontSize: "14px",
};

const debtBadge = {
  background: "#fee2e2",
  color: "#b91c1c",
  padding: "5px 9px",
  borderRadius: "6px",
  fontWeight: "700",
};

const paidBadge = {
  background: "#dcfce7",
  color: "#15803d",
  padding: "5px 9px",
  borderRadius: "6px",
  fontWeight: "700",
};

const smallGreen = {
  border: "none",
  background: "#16a34a",
  color: "#fff",
  padding: "7px 9px",
  borderRadius: "6px",
  cursor: "pointer",
};

const smallBlue = {
  border: "none",
  background: "#2563eb",
  color: "#fff",
  padding: "7px 9px",
  borderRadius: "6px",
  cursor: "pointer",
};

const smallRed = {
  border: "none",
  background: "#dc2626",
  color: "#fff",
  padding: "7px 9px",
  borderRadius: "6px",
  cursor: "pointer",
};

const emptyStyle = {
  padding: "30px",
  textAlign: "center",
  color: "#64748b",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 9999,
};

const modalStyle = {
  width: "100%",
  maxWidth: "500px",
  background: "#fff",
  borderRadius: "14px",
  padding: "24px",
  boxShadow: "0 20px 50px rgba(0,0,0,.25)",
};

const modalButtons = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  marginTop: "15px",
};

export default Moliya;