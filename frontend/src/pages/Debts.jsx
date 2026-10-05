import React, { useEffect, useMemo, useState } from "react";
import API from "../api";

function Debts() {
  const [debts, setDebts] = useState([]);
  const [payments, setPayments] = useState([]);
  const [schedule, setSchedule] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const [tab, setTab] = useState("all");

  const [selectedDebt, setSelectedDebt] = useState(null);

  const [showDebtModal, setShowDebtModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  const [form, setForm] = useState({
    creditor: "",
    title: "",
    amount: "",
    paid: "",
    currency: "UZS",
    due_date: "",
    note: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    payment_date: "",
    note: "",
  });

  const [scheduleForm, setScheduleForm] = useState({
    monthly_amount: "",
    next_payment_date: "",
    duration_months: "",
    note: "",
  });

  useEffect(() => {
    loadDebts();
  }, []);

  const loadDebts = async () => {
    try {
      setLoading(true);

      const response = await API.get("/debts/");

      setDebts(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Debts error:", error);
      setDebts([]);

      alert(
        error.response?.data?.detail ||
          "Qarzlarni yuklab bo'lmadi"
      );
    } finally {
      setLoading(false);
    }
  };

  const money = (value, currency = "UZS") => {
    const number = Number(value) || 0;

    return (
      new Intl.NumberFormat("uz-UZ").format(number) +
      (currency === "USD" ? " $" : " so'm")
    );
  };

  const shortMoney = (value, currency) => {
    return money(value, currency);
  };

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "-";

    return date.toLocaleDateString("uz-UZ");
  };

  const dateInput = (value) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().slice(0, 10);
  };

  const getTotal = (debt) =>
    Number(debt?.amount ?? 0) || 0;

  const getPaid = (debt) =>
    Number(debt?.paid ?? debt?.paid_amount ?? 0) || 0;

  const getRemaining = (debt) => {
    const backendRemaining = Number(debt?.remaining);

    if (Number.isFinite(backendRemaining)) {
      return Math.max(backendRemaining, 0);
    }

    return Math.max(
      getTotal(debt) - getPaid(debt),
      0
    );
  };

  const getCurrency = (debt) =>
    debt?.currency === "USD" ? "USD" : "UZS";

  const getName = (debt) => {
    return (
      debt?.creditor ||
      debt?.customer_name ||
      debt?.customer?.name ||
      (debt?.customer_id
        ? `Mijoz #${debt.customer_id}`
        : "Noma'lum qarz egasi")
    );
  };

  const statistics = useMemo(() => {
    const result = {
      UZS: {
        total: 0,
        paid: 0,
        remaining: 0,
        active: 0,
        completed: 0,
      },
      USD: {
        total: 0,
        paid: 0,
        remaining: 0,
        active: 0,
        completed: 0,
      },
    };

    debts.forEach((debt) => {
      const currency = getCurrency(debt);
      const total = getTotal(debt);
      const paid = getPaid(debt);
      const remaining = getRemaining(debt);

      result[currency].total += total;
      result[currency].paid += paid;
      result[currency].remaining += remaining;

      if (remaining > 0) {
        result[currency].active += 1;
      } else {
        result[currency].completed += 1;
      }
    });

    return result;
  }, [debts]);

  const filteredDebts = useMemo(() => {
    const q = search.toLowerCase().trim();

    return debts.filter((debt) => {
      const currency = getCurrency(debt);
      const remaining = getRemaining(debt);

      if (
        currencyFilter !== "ALL" &&
        currency !== currencyFilter
      ) {
        return false;
      }

      if (
        statusFilter === "ACTIVE" &&
        remaining <= 0
      ) {
        return false;
      }

      if (
        statusFilter === "COMPLETED" &&
        remaining > 0
      ) {
        return false;
      }

      if (!q) return true;

      const text = [
        debt.id,
        debt.creditor,
        debt.title,
        debt.note,
        debt.customer_name,
        debt.customer?.name,
        debt.customer_id,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [
    debts,
    search,
    currencyFilter,
    statusFilter,
  ]);

  const openAdd = () => {
    setSelectedDebt(null);

    setForm({
      creditor: "",
      title: "",
      amount: "",
      paid: "",
      currency: "UZS",
      due_date: "",
      note: "",
    });

    setShowDebtModal(true);
  };

  const openEdit = (debt) => {
    setSelectedDebt(debt);

    setForm({
      creditor: debt.creditor || "",
      title: debt.title || "",
      amount: debt.amount ?? "",
      paid: debt.paid ?? "",
      currency: getCurrency(debt),
      due_date: dateInput(debt.due_date),
      note: debt.note || "",
    });

    setShowDebtModal(true);
  };

  const saveDebt = async (event) => {
    event.preventDefault();

    if (!form.creditor.trim()) {
      alert("Kimga qarz ekanini kiriting");
      return;
    }

    const amount = Number(form.amount) || 0;
    const paid = Number(form.paid) || 0;

    if (amount <= 0) {
      alert("Qarz summasini kiriting");
      return;
    }

    if (paid < 0 || paid > amount) {
      alert(
        "To'langan summa noto'g'ri"
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        creditor: form.creditor.trim(),
        title: form.title || null,
        amount,
        paid,
        currency: form.currency,
        due_date: form.due_date
          ? new Date(
              `${form.due_date}T00:00:00`
            ).toISOString()
          : null,
        note: form.note || null,
      };

      if (selectedDebt) {
        await API.put(
          `/debts/${selectedDebt.id}`,
          payload
        );
      } else {
        await API.post("/debts/", payload);
      }

      setShowDebtModal(false);
      setSelectedDebt(null);

      await loadDebts();

      alert(
        selectedDebt
          ? "Qarz yangilandi"
          : "Qarz qo'shildi"
      );
    } catch (error) {
      console.error(
        "Save debt error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Qarzni saqlab bo'lmadi"
      );
    } finally {
      setSaving(false);
    }
  };

  const openPayment = (debt) => {
    setSelectedDebt(debt);

    setPaymentForm({
      amount: "",
      payment_date: new Date()
        .toISOString()
        .slice(0, 10),
      note: "",
    });

    setShowPaymentModal(true);
  };

  const addPayment = async (event) => {
    event.preventDefault();

    if (!selectedDebt) return;

    const amount =
      Number(paymentForm.amount) || 0;

    const remaining =
      getRemaining(selectedDebt);

    if (amount <= 0) {
      alert("To'lov summasini kiriting");
      return;
    }

    if (amount > remaining) {
      alert(
        `Qoldiq: ${money(
          remaining,
          getCurrency(selectedDebt)
        )}`
      );
      return;
    }

    try {
      setSaving(true);

      await API.post(
        `/debts/${selectedDebt.id}/payment`,
        {
          amount,
          payment_date: paymentForm.payment_date
            ? new Date(
                `${paymentForm.payment_date}T00:00:00`
              ).toISOString()
            : null,
          note:
            paymentForm.note || null,
        }
      );

      setShowPaymentModal(false);
      setSelectedDebt(null);

      await loadDebts();

      alert("To'lov saqlandi");
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "To'lovni saqlab bo'lmadi"
      );
    } finally {
      setSaving(false);
    }
  };

  const openHistory = async (debt) => {
    try {
      setSelectedDebt(debt);

      const response = await API.get(
        `/debts/${debt.id}/payments`
      );

      setPayments(
        Array.isArray(response.data)
          ? response.data
          : []
      );

      setShowHistoryModal(true);
    } catch (error) {
      console.error(
        "History error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "To'lov tarixini yuklab bo'lmadi"
      );
    }
  };

  const openSchedule = async (debt) => {
    try {
      setSelectedDebt(debt);

      const response = await API.get(
        `/debts/${debt.id}/schedule`
      );

      const data = response.data || null;

      setSchedule(data);

      setScheduleForm({
        monthly_amount:
          data?.monthly_amount ?? "",
        next_payment_date: dateInput(
          data?.next_payment_date
        ),
        duration_months:
          data?.duration_months ?? "",
        note: data?.note || "",
      });

      setShowScheduleModal(true);
    } catch (error) {
      console.error(
        "Schedule error:",
        error
      );

      setSchedule(null);

      setScheduleForm({
        monthly_amount: "",
        next_payment_date: dateInput(
          selectedDebt?.due_date
        ),
        duration_months: "",
        note: "",
      });

      setShowScheduleModal(true);
    }
  };

  const saveSchedule = async (event) => {
    event.preventDefault();

    if (!selectedDebt) return;

    const monthly =
      Number(
        scheduleForm.monthly_amount
      ) || 0;

    if (monthly <= 0) {
      alert(
        "Oylik to'lov summasini kiriting"
      );
      return;
    }

    try {
      setSaving(true);

      const payload = {
        monthly_amount: monthly,
        next_payment_date:
          scheduleForm.next_payment_date
            ? new Date(
                `${scheduleForm.next_payment_date}T00:00:00`
              ).toISOString()
            : null,
        duration_months:
          scheduleForm.duration_months
            ? Number(
                scheduleForm.duration_months
              )
            : null,
        note:
          scheduleForm.note || null,
      };

      if (schedule?.id) {
        await API.put(
          `/debts/${selectedDebt.id}/schedule/${schedule.id}`,
          payload
        );
      } else {
        await API.post(
          `/debts/${selectedDebt.id}/schedule`,
          payload
        );
      }

      setShowScheduleModal(false);

      await loadDebts();

      alert("To'lov rejasi saqlandi");
    } catch (error) {
      console.error(
        "Schedule save error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "To'lov rejasini saqlab bo'lmadi"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteDebt = async (debt) => {
    const ok = window.confirm(
      `"${getName(
        debt
      )}" qarzini o'chirishni xohlaysizmi?`
    );

    if (!ok) return;

    try {
      setSaving(true);

      await API.delete(
        `/debts/${debt.id}`
      );

      await loadDebts();

      alert("Qarz o'chirildi");
    } catch (error) {
      console.error(
        "Delete debt error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "Qarz o'chirilmadi"
      );
    } finally {
      setSaving(false);
    }
  };

  const activeDebts = debts.filter(
    (debt) => getRemaining(debt) > 0
  );

  const completedDebts = debts.filter(
    (debt) => getRemaining(debt) <= 0
  );

  const visibleDebts =
    tab === "active"
      ? activeDebts
      : tab === "completed"
      ? completedDebts
      : filteredDebts;

  const paymentTotal = payments.reduce(
    (sum, item) =>
      sum + (Number(item.amount) || 0),
    0
  );

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <div style={eyebrowStyle}>
            MOLIYA
          </div>

          <h1 style={titleStyle}>
            Qarzlar
          </h1>

          <p style={subtitleStyle}>
            Barcha qarzlar, to'lovlar va
            majburiy to'lov rejalarini boshqaring
          </p>
        </div>

        <div style={headerActions}>
          <button
            onClick={loadDebts}
            style={secondaryButton}
          >
            ↻ Yangilash
          </button>

          <button
            onClick={openAdd}
            style={primaryButton}
          >
            + Qarz qo'shish
          </button>
        </div>
      </div>

      <div style={statsGrid}>
        <StatCard
          title="UZS qarz"
          total={statistics.UZS.remaining}
          subtitle={`${statistics.UZS.active} ta faol qarz`}
          currency="UZS"
        />

        <StatCard
          title="USD qarz"
          total={statistics.USD.remaining}
          subtitle={`${statistics.USD.active} ta faol qarz`}
          currency="USD"
        />

        <StatCard
          title="UZS to'langan"
          total={statistics.UZS.paid}
          subtitle={`Jami ${statistics.UZS.total.toLocaleString(
            "uz-UZ"
          )} so'm`}
          currency="UZS"
          positive
        />

        <StatCard
          title="USD to'langan"
          total={statistics.USD.paid}
          subtitle={`Jami ${statistics.USD.total.toLocaleString(
            "uz-UZ"
          )} $`}
          currency="USD"
          positive
        />
      </div>

      <div style={tabsStyle}>
        <button
          onClick={() => setTab("all")}
          style={
            tab === "all"
              ? activeTabStyle
              : tabStyle
          }
        >
          Barcha qarzlar
          <span style={tabBadge}>
            {debts.length}
          </span>
        </button>

        <button
          onClick={() => setTab("active")}
          style={
            tab === "active"
              ? activeTabStyle
              : tabStyle
          }
        >
          Mening qarzlarim
          <span style={tabBadge}>
            {activeDebts.length}
          </span>
        </button>

        <button
          onClick={() => setTab("completed")}
          style={
            tab === "completed"
              ? activeTabStyle
              : tabStyle
          }
        >
          Tugagan
          <span style={tabBadge}>
            {completedDebts.length}
          </span>
        </button>
      </div>

      <div style={filterCard}>
        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Qarz egasi, nomi yoki izoh bo'yicha qidirish..."
          style={inputStyle}
        />

        <select
          value={currencyFilter}
          onChange={(e) =>
            setCurrencyFilter(e.target.value)
          }
          style={selectStyle}
        >
          <option value="ALL">
            Barcha valyuta
          </option>
          <option value="UZS">UZS</option>
          <option value="USD">USD</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value)
          }
          style={selectStyle}
        >
          <option value="ALL">
            Barcha holat
          </option>
          <option value="ACTIVE">
            Faol qarzlar
          </option>
          <option value="COMPLETED">
            Tugaganlar
          </option>
        </select>
      </div>

      <div style={sectionCard}>
        <div style={sectionHeader}>
          <div>
            <h2 style={sectionTitle}>
              Qarzlar ro'yxati
            </h2>

            <div style={sectionDescription}>
              {visibleDebts.length} ta yozuv
            </div>
          </div>

          <div style={separateCurrency}>
            <span>
              UZS:{" "}
              <b>
                {money(
                  statistics.UZS.remaining,
                  "UZS"
                )}
              </b>
            </span>

            <span>
              USD:{" "}
              <b>
                {money(
                  statistics.USD.remaining,
                  "USD"
                )}
              </b>
            </span>
          </div>
        </div>

        {loading ? (
          <div style={emptyStyle}>
            <div style={spinner}>⟳</div>
            Qarzlar yuklanmoqda...
          </div>
        ) : visibleDebts.length === 0 ? (
          <div style={emptyStyle}>
            <div style={emptyIcon}>✓</div>

            <div style={emptyTitle}>
              Qarz topilmadi
            </div>

            <div style={emptyText}>
              Tanlangan filtr bo'yicha qarzlar mavjud
              emas.
            </div>
          </div>
        ) : (
          <div style={tableWrapper}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Qarz egasi</th>
                  <th style={thStyle}>Izoh</th>
                  <th style={thStyle}>Jami</th>
                  <th style={thStyle}>To'langan</th>
                  <th style={thStyle}>Qoldiq</th>
                  <th style={thStyle}>Valyuta</th>
                  <th style={thStyle}>Muddat</th>
                  <th style={thStyle}>Holat</th>
                  <th style={thStyle}>Amallar</th>
                </tr>
              </thead>

              <tbody>
                {visibleDebts.map((debt) => {
                  const currency =
                    getCurrency(debt);

                  const total =
                    getTotal(debt);

                  const paid =
                    getPaid(debt);

                  const remaining =
                    getRemaining(debt);

                  return (
                    <tr
                      key={debt.id}
                      style={rowStyle}
                    >
                      <td style={tdStyle}>
                        <div style={personName}>
                          {getName(debt)}
                        </div>

                        <div style={smallText}>
                          #{debt.id}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div>
                          {debt.title || "—"}
                        </div>

                        {debt.note && (
                          <div
                            style={smallText}
                          >
                            {debt.note}
                          </div>
                        )}
                      </td>

                      <td style={tdStyle}>
                        <b>
                          {money(
                            total,
                            currency
                          )}
                        </b>
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          color: "#15803d",
                        }}
                      >
                        {money(
                          paid,
                          currency
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          color:
                            remaining > 0
                              ? "#dc2626"
                              : "#15803d",
                          fontWeight: 800,
                        }}
                      >
                        {money(
                          remaining,
                          currency
                        )}
                      </td>

                      <td style={tdStyle}>
                        <span
                          style={
                            currency === "USD"
                              ? usdBadge
                              : uzsBadge
                          }
                        >
                          {currency}
                        </span>
                      </td>

                      <td style={tdStyle}>
                        {debt.due_date
                          ? formatDate(
                              debt.due_date
                            )
                          : "Belgilanmagan"}
                      </td>

                      <td style={tdStyle}>
                        {remaining <= 0 ? (
                          <span
                            style={completedBadge}
                          >
                            ✓ Tugagan
                          </span>
                        ) : (
                          <span
                            style={activeBadge}
                          >
                            ● Faol
                          </span>
                        )}
                      </td>

                      <td style={actionsTd}>
                        <button
                          onClick={() =>
                            openPayment(debt)
                          }
                          style={actionGreen}
                          title="To'lov"
                        >
                          To'lov
                        </button>

                        <button
                          onClick={() =>
                            openHistory(debt)
                          }
                          style={actionBlue}
                          title="Tarix"
                        >
                          Tarix
                        </button>

                        <button
                          onClick={() =>
                            openSchedule(debt)
                          }
                          style={actionPurple}
                          title="To'lov rejasi"
                        >
                          Reja
                        </button>

                        <button
                          onClick={() =>
                            openEdit(debt)
                          }
                          style={actionGray}
                        >
                          Tahrir
                        </button>

                        <button
                          onClick={() =>
                            deleteDebt(debt)
                          }
                          style={actionRed}
                        >
                          O'chir
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ADD / EDIT DEBT */}

      {showDebtModal && (
        <Modal
          title={
            selectedDebt
              ? "Qarzni tahrirlash"
              : "Yangi qarz"
          }
          onClose={() =>
            setShowDebtModal(false)
          }
        >
          <form onSubmit={saveDebt}>
            <div style={formGrid}>
              <label style={labelStyle}>
                Qarz egasi *
                <input
                  name="creditor"
                  value={form.creditor}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      creditor: e.target.value,
                    })
                  }
                  placeholder="Masalan: Agrobank"
                  style={inputStyle}
                  required
                />
              </label>

              <label style={labelStyle}>
                Qarz nomi
                <input
                  name="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                    })
                  }
                  placeholder="Masalan: Kredit"
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Jami summa *
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.amount}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      amount: e.target.value,
                    })
                  }
                  style={inputStyle}
                  required
                />
              </label>

              <label style={labelStyle}>
                Valyuta *
                <select
                  value={form.currency}
                  onChange={(e) =>
                    setForm({
                      ...form,
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
              </label>

              <label style={labelStyle}>
                To'langan
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={form.paid}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      paid: e.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </label>

              <label style={labelStyle}>
                Muddat
                <input
                  type="date"
                  value={form.due_date}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      due_date: e.target.value,
                    })
                  }
                  style={inputStyle}
                />
              </label>
            </div>

            <label style={labelStyle}>
              Izoh
              <textarea
                value={form.note}
                onChange={(e) =>
                  setForm({
                    ...form,
                    note: e.target.value,
                  })
                }
                placeholder="Qo'shimcha ma'lumot..."
                style={textareaStyle}
              />
            </label>

            <div style={modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowDebtModal(false)
                }
                style={secondaryButton}
              >
                Bekor qilish
              </button>

              <button
                type="submit"
                disabled={saving}
                style={primaryButton}
              >
                {saving
                  ? "Saqlanmoqda..."
                  : selectedDebt
                  ? "Saqlash"
                  : "Qarz qo'shish"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* PAYMENT */}

      {showPaymentModal && selectedDebt && (
        <Modal
          title="Qarzga to'lov"
          onClose={() =>
            setShowPaymentModal(false)
          }
        >
          <div style={paymentInfo}>
            <div>
              <span>Qarz egasi</span>
              <b>
                {getName(selectedDebt)}
              </b>
            </div>

            <div>
              <span>Qoldiq</span>
              <strong>
                {money(
                  getRemaining(
                    selectedDebt
                  ),
                  getCurrency(
                    selectedDebt
                  )
                )}
              </strong>
            </div>
          </div>

          <form onSubmit={addPayment}>
            <label style={labelStyle}>
              To'lov summasi *
              <input
                type="number"
                min="0"
                step="any"
                value={paymentForm.amount}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    amount: e.target.value,
                  })
                }
                style={inputStyle}
                required
              />
            </label>

            <label style={labelStyle}>
              To'lov sanasi
              <input
                type="date"
                value={
                  paymentForm.payment_date
                }
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    payment_date:
                      e.target.value,
                  })
                }
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Izoh
              <textarea
                value={paymentForm.note}
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    note: e.target.value,
                  })
                }
                style={textareaStyle}
              />
            </label>

            <div style={modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowPaymentModal(false)
                }
                style={secondaryButton}
              >
                Bekor qilish
              </button>

              <button
                type="submit"
                disabled={saving}
                style={primaryButton}
              >
                {saving
                  ? "Saqlanmoqda..."
                  : "To'lovni saqlash"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* PAYMENT HISTORY */}

      {showHistoryModal && selectedDebt && (
        <Modal
          title={`To'lov tarixi — ${getName(
            selectedDebt
          )}`}
          wide
          onClose={() =>
            setShowHistoryModal(false)
          }
        >
          <div style={historySummary}>
            <div>
              <span>Jami qarz</span>
              <b>
                {money(
                  getTotal(selectedDebt),
                  getCurrency(
                    selectedDebt
                  )
                )}
              </b>
            </div>

            <div>
              <span>To'langan</span>
              <b style={{ color: "#15803d" }}>
                {money(
                  getPaid(selectedDebt),
                  getCurrency(
                    selectedDebt
                  )
                )}
              </b>
            </div>

            <div>
              <span>Qoldiq</span>
              <b style={{ color: "#dc2626" }}>
                {money(
                  getRemaining(
                    selectedDebt
                  ),
                  getCurrency(
                    selectedDebt
                  )
                )}
              </b>
            </div>
          </div>

          {payments.length === 0 ? (
            <div style={emptyStyle}>
              Hozircha to'lovlar tarixi mavjud emas.
            </div>
          ) : (
            <div style={tableWrapper}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>
                      Sana
                    </th>

                    <th style={thStyle}>
                      Summa
                    </th>

                    <th style={thStyle}>
                      Izoh
                    </th>

                    <th style={thStyle}>
                      Chek
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id}>
                      <td style={tdStyle}>
                        {formatDate(
                          payment.payment_date ||
                            payment.created_at
                        )}
                      </td>

                      <td
                        style={{
                          ...tdStyle,
                          fontWeight: 800,
                        }}
                      >
                        {money(
                          payment.amount,
                          getCurrency(
                            selectedDebt
                          )
                        )}
                      </td>

                      <td style={tdStyle}>
                        {payment.note || "—"}
                      </td>

                      <td style={tdStyle}>
                        {payment.receipt_path ||
                        payment.receipt_name ? (
                          <span
                            style={completedBadge}
                          >
                            📎 Biriktirilgan
                          </span>
                        ) : (
                          <span
                            style={smallText}
                          >
                            Yo'q
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={historyTotal}>
            Tarixdagi jami:
            <b>
              {" "}
              {money(
                paymentTotal,
                getCurrency(selectedDebt)
              )}
            </b>
          </div>
        </Modal>
      )}

      {/* SCHEDULE */}

      {showScheduleModal && selectedDebt && (
        <Modal
          title={`To'lov rejasi — ${getName(
            selectedDebt
          )}`}
          onClose={() =>
            setShowScheduleModal(false)
          }
        >
          <div style={scheduleBox}>
            <div>
              <span>Qoldiq qarz</span>
              <b>
                {money(
                  getRemaining(
                    selectedDebt
                  ),
                  getCurrency(
                    selectedDebt
                  )
                )}
              </b>
            </div>
          </div>

          <form onSubmit={saveSchedule}>
            <label style={labelStyle}>
              Oylik to'lov *
              <input
                type="number"
                min="0"
                step="any"
                value={
                  scheduleForm.monthly_amount
                }
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    monthly_amount:
                      e.target.value,
                  })
                }
                style={inputStyle}
                required
              />
            </label>

            <label style={labelStyle}>
              Keyingi to'lov sanasi
              <input
                type="date"
                value={
                  scheduleForm.next_payment_date
                }
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    next_payment_date:
                      e.target.value,
                  })
                }
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Muddat — oy
              <input
                type="number"
                min="1"
                value={
                  scheduleForm.duration_months
                }
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    duration_months:
                      e.target.value,
                  })
                }
                style={inputStyle}
              />
            </label>

            <label style={labelStyle}>
              Izoh
              <textarea
                value={scheduleForm.note}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    note: e.target.value,
                  })
                }
                style={textareaStyle}
              />
            </label>

            <div style={modalActions}>
              <button
                type="button"
                onClick={() =>
                  setShowScheduleModal(false)
                }
                style={secondaryButton}
              >
                Bekor qilish
              </button>

              <button
                type="submit"
                disabled={saving}
                style={primaryButton}
              >
                {saving
                  ? "Saqlanmoqda..."
                  : "Rejani saqlash"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function StatCard({
  title,
  total,
  subtitle,
  currency,
  positive,
}) {
  return (
    <div style={statCardStyle}>
      <div style={statTop}>
        <span style={statTitle}>
          {title}
        </span>

        <span
          style={
            currency === "USD"
              ? usdBadge
              : uzsBadge
          }
        >
          {currency}
        </span>
      </div>

      <div
        style={{
          ...statNumber,
          color: positive
            ? "#15803d"
            : "#0f172a",
        }}
      >
        {new Intl.NumberFormat(
          "uz-UZ"
        ).format(total)}
        {currency === "USD"
          ? " $"
          : " so'm"}
      </div>

      <div style={statSubtitle}>
        {subtitle}
      </div>
    </div>
  );
}

function Modal({
  title,
  children,
  onClose,
  wide,
}) {
  return (
    <div style={overlayStyle}>
      <div
        style={{
          ...modalStyle,
          maxWidth: wide ? "1000px" : "650px",
        }}
      >
        <div style={modalHeader}>
          <h2 style={modalTitle}>
            {title}
          </h2>

          <button
            onClick={onClose}
            style={closeButton}
          >
            ×
          </button>
        </div>

        <div style={modalContent}>
          {children}
        </div>
      </div>
    </div>
  );
}

const pageStyle = {
  padding: "28px",
  width: "100%",
  boxSizing: "border-box",
  background: "#f8fafc",
  minHeight: "100vh",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "24px",
};

const eyebrowStyle = {
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 800,
  letterSpacing: "1.5px",
  marginBottom: "5px",
};

const titleStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: "30px",
};

const subtitleStyle = {
  margin: "7px 0 0",
  color: "#64748b",
  fontSize: "14px",
};

const headerActions = {
  display: "flex",
  gap: "10px",
};

const primaryButton = {
  border: "none",
  borderRadius: "9px",
  padding: "11px 17px",
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: "14px",
};

const secondaryButton = {
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  padding: "10px 15px",
  background: "#fff",
  color: "#334155",
  cursor: "pointer",
  fontWeight: 650,
  fontSize: "14px",
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(4, minmax(0, 1fr))",
  gap: "15px",
  marginBottom: "18px",
};

const statCardStyle = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "18px",
  boxShadow:
    "0 2px 8px rgba(15,23,42,0.04)",
};

const statTop = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const statTitle = {
  color: "#64748b",
  fontSize: "13px",
  fontWeight: 700,
};

const statNumber = {
  marginTop: "12px",
  fontSize: "23px",
  fontWeight: 850,
};

const statSubtitle = {
  marginTop: "7px",
  color: "#94a3b8",
  fontSize: "12px",
};

const tabsStyle = {
  display: "flex",
  gap: "5px",
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
  padding: "5px",
  marginBottom: "14px",
};

const tabStyle = {
  border: "none",
  background: "transparent",
  color: "#64748b",
  padding: "10px 14px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 700,
};

const activeTabStyle = {
  ...tabStyle,
  background: "#eff6ff",
  color: "#2563eb",
};

const tabBadge = {
  marginLeft: "7px",
  background: "#e2e8f0",
  padding: "2px 7px",
  borderRadius: "20px",
  fontSize: "11px",
};

const filterCard = {
  display: "grid",
  gridTemplateColumns:
    "minmax(250px, 1fr) 180px 180px",
  gap: "10px",
  background: "#fff",
  border: "1px solid #e2e8f0",
  padding: "13px",
  borderRadius: "12px",
  marginBottom: "16px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  fontSize: "14px",
  background: "#fff",
  outline: "none",
};

const selectStyle = {
  ...inputStyle,
  cursor: "pointer",
};

const sectionCard = {
  background: "#fff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  overflow: "hidden",
};

const sectionHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 20px",
  borderBottom: "1px solid #e2e8f0",
};

const sectionTitle = {
  margin: 0,
  fontSize: "18px",
  color: "#0f172a",
};

const sectionDescription = {
  marginTop: "4px",
  color: "#94a3b8",
  fontSize: "12px",
};

const separateCurrency = {
  display: "flex",
  gap: "15px",
  color: "#475569",
  fontSize: "13px",
};

const tableWrapper = {
  width: "100%",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "1100px",
};

const thStyle = {
  padding: "13px 14px",
  textAlign: "left",
  background: "#f8fafc",
  color: "#64748b",
  fontSize: "12px",
  fontWeight: 800,
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "13px 14px",
  borderBottom: "1px solid #f1f5f9",
  color: "#334155",
  fontSize: "13px",
  whiteSpace: "nowrap",
};

const rowStyle = {
  transition: "background .15s",
};

const actionsTd = {
  ...tdStyle,
  display: "flex",
  gap: "5px",
  flexWrap: "wrap",
};

const personName = {
  fontWeight: 800,
  color: "#0f172a",
};

const smallText = {
  color: "#94a3b8",
  fontSize: "11px",
  marginTop: "3px",
  whiteSpace: "normal",
  maxWidth: "200px",
};

const uzsBadge = {
  display: "inline-block",
  background: "#ecfdf5",
  color: "#047857",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: 800,
};

const usdBadge = {
  display: "inline-block",
  background: "#eff6ff",
  color: "#1d4ed8",
  padding: "4px 8px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: 800,
};

const activeBadge = {
  display: "inline-block",
  background: "#fff7ed",
  color: "#c2410c",
  padding: "5px 8px",
  borderRadius: "7px",
  fontSize: "11px",
  fontWeight: 800,
};

const completedBadge = {
  display: "inline-block",
  background: "#ecfdf5",
  color: "#15803d",
  padding: "5px 8px",
  borderRadius: "7px",
  fontSize: "11px",
  fontWeight: 800,
};

const actionGreen = {
  border: "none",
  background: "#ecfdf5",
  color: "#15803d",
  padding: "6px 8px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
};

const actionBlue = {
  border: "none",
  background: "#eff6ff",
  color: "#2563eb",
  padding: "6px 8px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
};

const actionPurple = {
  border: "none",
  background: "#f5f3ff",
  color: "#7c3aed",
  padding: "6px 8px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
};

const actionGray = {
  border: "none",
  background: "#f1f5f9",
  color: "#475569",
  padding: "6px 8px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
};

const actionRed = {
  border: "none",
  background: "#fef2f2",
  color: "#dc2626",
  padding: "6px 8px",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "11px",
  fontWeight: 700,
};

const emptyStyle = {
  padding: "60px 20px",
  textAlign: "center",
  color: "#94a3b8",
};

const emptyIcon = {
  margin: "0 auto 10px",
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  background: "#ecfdf5",
  color: "#16a34a",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  fontWeight: 800,
};

const emptyTitle = {
  color: "#475569",
  fontWeight: 800,
};

const emptyText = {
  marginTop: "5px",
  fontSize: "13px",
};

const spinner = {
  fontSize: "25px",
  marginBottom: "10px",
};

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15,23,42,0.55)",
  zIndex: 9999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  overflowY: "auto",
};

const modalStyle = {
  width: "100%",
  background: "#fff",
  borderRadius: "16px",
  boxShadow:
    "0 20px 60px rgba(0,0,0,.2)",
  maxHeight: "92vh",
  overflow: "auto",
};

const modalHeader = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "17px 20px",
  borderBottom: "1px solid #e2e8f0",
};

const modalTitle = {
  margin: 0,
  fontSize: "19px",
  color: "#0f172a",
};

const closeButton = {
  border: "none",
  background: "#f1f5f9",
  width: "34px",
  height: "34px",
  borderRadius: "8px",
  fontSize: "23px",
  color: "#475569",
  cursor: "pointer",
};

const modalContent = {
  padding: "20px",
};

const formGrid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(2, minmax(0, 1fr))",
  gap: "14px",
};

const labelStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "7px",
  color: "#475569",
  fontSize: "13px",
  fontWeight: 700,
  marginBottom: "14px",
};

const textareaStyle = {
  width: "100%",
  minHeight: "90px",
  boxSizing: "border-box",
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "9px",
  fontSize: "14px",
  resize: "vertical",
  fontFamily: "inherit",
  outline: "none",
};

const modalActions = {
  display: "flex",
  justifyContent: "flex-end",
  gap: "9px",
  marginTop: "20px",
};

const paymentInfo = {
  display: "grid",
  gridTemplateColumns:
    "1fr 1fr",
  gap: "10px",
  padding: "14px",
  background: "#f8fafc",
  borderRadius: "10px",
  marginBottom: "18px",
};

const paymentInfoItem = {
  display: "flex",
  flexDirection: "column",
};

const historySummary = {
  display: "grid",
  gridTemplateColumns:
    "repeat(3, 1fr)",
  gap: "10px",
  marginBottom: "18px",
};

const scheduleBox = {
  padding: "15px",
  background: "#f5f3ff",
  borderRadius: "10px",
  marginBottom: "18px",
};

const historyTotal = {
  textAlign: "right",
  marginTop: "15px",
  padding: "12px",
  background: "#f8fafc",
  borderRadius: "8px",
  color: "#475569",
};

export default Debts;