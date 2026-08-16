import React, { useEffect, useMemo, useState } from "react";
import API from "../api";
import * as XLSX from "xlsx";

function Finance() {
  const [debts, setDebts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("mydebts");

  const [showAdd, setShowAdd] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [selectedDebt, setSelectedDebt] = useState(null);
  const [payments, setPayments] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [currencyFilter, setCurrencyFilter] = useState("ALL");

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    note: "",
  });

  const [form, setForm] = useState({
    creditor: "",
    title: "",
    amount: "",
    currency: "UZS",
    note: "",
  });

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadDebts = async () => {
    try {
      const response = await API.get("/debts/");

      setDebts(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Qarzlarni yuklashda xato:", error);
      setDebts([]);
    }
  };

  const loadCustomers = async () => {
    try {
      let response;

      try {
        response = await API.get("/customers/");
      } catch {
        response = await API.get("/customers");
      }

      setCustomers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Mijozlarni yuklashda xato:", error);
      setCustomers([]);
    }
  };

  const loadAll = async () => {
    setLoading(true);

    await Promise.all([
      loadDebts(),
      loadCustomers(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  // =====================================================
  // MONEY
  // =====================================================

  const formatMoney = (
    amount,
    currency = "UZS"
  ) => {
    const number = Number(amount || 0);

    if (currency === "USD") {
      return (
        new Intl.NumberFormat("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(number) + " $"
      );
    }

    return (
      new Intl.NumberFormat("uz-UZ", {
        maximumFractionDigits: 0,
      }).format(number) + " so'm"
    );
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleDateString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) {
      return "-";
    }

    return d.toLocaleString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // FORM
  // =====================================================

  const handleChange = (e) => {
    setForm((old) => ({
      ...old,
      [e.target.name]: e.target.value,
    }));
  };

  // =====================================================
  // ADD DEBT
  // =====================================================

  const addDebt = async (e) => {
    e.preventDefault();

    if (!form.creditor.trim()) {
      alert("Kimga qarz ekanini kiriting");
      return;
    }

    if (
      !form.amount ||
      Number(form.amount) <= 0
    ) {
      alert("Qarz summasini kiriting");
      return;
    }

    try {
      await API.post("/debts/", {
        creditor: form.creditor.trim(),
        title: form.title || null,
        amount: Number(form.amount),
        paid: 0,
        currency: form.currency,
        status: "qarzdor",
        note: form.note || null,
      });

      setForm({
        creditor: "",
        title: "",
        amount: "",
        currency: "UZS",
        note: "",
      });

      setShowAdd(false);

      await loadDebts();

      alert("Qarz muvaffaqiyatli qo'shildi");
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Qarz qo'shishda xato"
      );
    }
  };

  // =====================================================
  // PAYMENT
  // =====================================================

  const openPayment = (debt) => {
    setSelectedDebt(debt);

    setPaymentForm({
      amount: "",
      note: "",
    });

    setShowPayment(true);
  };

  const addPayment = async (e) => {
    e.preventDefault();

    if (!selectedDebt) return;

    const amount = Number(
      paymentForm.amount
    );

    if (!amount || amount <= 0) {
      alert("To'lov summasini kiriting");
      return;
    }

    const remaining =
      Number(selectedDebt.amount || 0) -
      Number(selectedDebt.paid || 0);

    if (amount > remaining) {
      alert(
        `To'lov qoldiqdan katta bo'lishi mumkin emas.\nQoldiq: ${formatMoney(
          remaining,
          selectedDebt.currency
        )}`
      );
      return;
    }

    try {
      await API.post(
        `/debts/${selectedDebt.id}/payment`,
        {
          amount,
          note:
            paymentForm.note || null,
        }
      );

      setShowPayment(false);
      setSelectedDebt(null);

      setPaymentForm({
        amount: "",
        note: "",
      });

      await loadDebts();

      alert(
        "To'lov muvaffaqiyatli qabul qilindi"
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "To'lov qilishda xato"
      );
    }
  };

  // =====================================================
  // HISTORY
  // =====================================================

  const openHistory = async (debt) => {
    setSelectedDebt(debt);
    setShowHistory(true);
    setHistoryLoading(true);
    setPayments([]);

    try {
      const response = await API.get(
        `/debts/${debt.id}/payments`
      );

      setPayments(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "To'lovlar tarixini yuklashda xato"
      );
    } finally {
      setHistoryLoading(false);
    }
  };

  // =====================================================
  // RECEIVABLES
  // =====================================================

  const receivables = useMemo(() => {
    return customers
      .filter(
        (customer) =>
          Number(customer.debt || 0) > 0
      )
      .map((customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
        object: customer.object,
        debt: Number(customer.debt || 0),
      }));
  }, [customers]);

  // =====================================================
  // CUSTOMER PAYMENT
  // =====================================================

  const payCustomerDebt = async (
    customer
  ) => {
    const amountText = window.prompt(
      `${customer.name} uchun to'lov summasini kiriting:`
    );

    if (
      amountText === null ||
      amountText === ""
    ) {
      return;
    }

    const amount = Number(amountText);

    if (!amount || amount <= 0) {
      alert("To'g'ri summa kiriting");
      return;
    }

    if (amount > Number(customer.debt)) {
      alert(
        "To'lov mijoz qarzidan katta bo'lishi mumkin emas."
      );
      return;
    }

    const newDebt =
      Number(customer.debt) - amount;

    try {
      await API.put(
        `/customers/${customer.id}`,
        {
          debt: newDebt,
        }
      );

      await loadCustomers();

      alert(
        `${customer.name} dan ${formatMoney(
          amount
        )} to'lov qabul qilindi.`
      );
    } catch (error) {
      console.error(error);

      alert(
        error.response?.data?.detail ||
          "Mijoz qarzini yangilashda xato"
      );
    }
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredDebts = useMemo(() => {
    return debts.filter((debt) => {
      const text =
        `${debt.creditor || ""} ${
          debt.title || ""
        } ${debt.note || ""}`.toLowerCase();

      const searchMatch =
        text.includes(
          search.toLowerCase()
        );

      const currencyMatch =
        currencyFilter === "ALL" ||
        debt.currency ===
          currencyFilter;

      return (
        searchMatch &&
        currencyMatch
      );
    });
  }, [
    debts,
    search,
    currencyFilter,
  ]);

  const filteredReceivables =
    useMemo(() => {
      return receivables.filter(
        (customer) => {
          const text =
            `${customer.name || ""} ${
              customer.phone || ""
            } ${
              customer.address || ""
            }`.toLowerCase();

          return text.includes(
            search.toLowerCase()
          );
        }
      );
    }, [receivables, search]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const stats = useMemo(() => {
    const uzs = {
      total: 0,
      paid: 0,
      remaining: 0,
    };

    const usd = {
      total: 0,
      paid: 0,
      remaining: 0,
    };

    debts.forEach((debt) => {
      const amount = Number(
        debt.amount || 0
      );

      const paid = Number(
        debt.paid || 0
      );

      const remaining = Math.max(
        amount - paid,
        0
      );

      const target =
        debt.currency === "USD"
          ? usd
          : uzs;

      target.total += amount;
      target.paid += paid;
      target.remaining +=
        remaining;
    });

    const customerDebt =
      receivables.reduce(
        (sum, customer) =>
          sum +
          Number(customer.debt || 0),
        0
      );

    return {
      count: debts.length,
      uzs,
      usd,
      customerDebt,
    };
  }, [debts, receivables]);

  // =====================================================
  // EXCEL EXPORT
  // =====================================================

  const exportExcel = () => {
    const rows = [];

    // MEN QARZDORMAN
    debts.forEach((debt) => {
      const amount = Number(
        debt.amount || 0
      );

      const paid = Number(
        debt.paid || 0
      );

      const remaining = Math.max(
        amount - paid,
        0
      );

      rows.push({
        Turi: "Men qarzdorman",
        Ism: debt.creditor || "",
        Telefon: "",
        Manzil: "",
        Obekt: "",
        Sabab: debt.title || "",
        Jami: amount,
        Tolangan: paid,
        Qoldiq: remaining,
        Valyuta:
          debt.currency || "UZS",
        Holat:
          remaining > 0
            ? "Qarzdor"
            : "Tugagan",
        Sana: formatDate(
          debt.created_at
        ),
        Izoh: debt.note || "",
      });
    });

    // MENDAN QARZDOR
    receivables.forEach(
      (customer) => {
        rows.push({
          Turi: "Mendan qarzdor",
          Ism: customer.name || "",
          Telefon:
            customer.phone || "",
          Manzil:
            customer.address || "",
          Obekt:
            customer.object || "",
          Sabab:
            "Mijoz qarzi",
          Jami: customer.debt,
          Tolangan: 0,
          Qoldiq: customer.debt,
          Valyuta: "UZS",
          Holat: "Qarzdor",
          Sana: formatDate(
            new Date()
          ),
          Izoh: "",
        });
      }
    );

    if (rows.length === 0) {
      alert(
        "Excelga chiqarish uchun ma'lumot yo'q."
      );
      return;
    }

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Moliya"
    );

    XLSX.writeFile(
      workbook,
      "SAFE_HOME_MOLIYA.xlsx"
    );
  };

  // =====================================================
  // EXCEL IMPORT
  // =====================================================

  const importExcel = async (
    event
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) return;

    try {
      const buffer =
        await file.arrayBuffer();

      const workbook =
        XLSX.read(buffer, {
          type: "array",
        });

      const sheetName =
        workbook.SheetNames[0];

      const sheet =
        workbook.Sheets[
          sheetName
        ];

      const rows =
        XLSX.utils.sheet_to_json(
          sheet,
          {
            defval: "",
          }
        );

      if (!rows.length) {
        alert(
          "Excel faylda ma'lumot yo'q."
        );
        return;
      }

      let added = 0;
      let updated = 0;
      let errors = 0;

      for (const row of rows) {
        const type =
          String(
            row.Turi ||
              row.turi ||
              "Men qarzdorman"
          ).trim();

        const name = String(
          row.Ism ||
            row.ism ||
            row.Kimga ||
            row.kimga ||
            ""
        ).trim();

        const amount = Number(
          row.Qoldiq ||
            row.Qoldiq ||
            row.Jami ||
            row.jami ||
            0
        );

        if (!name || amount <= 0) {
          errors++;
          continue;
        }

        // =========================================
        // MENDAN QARZDOR
        // =========================================

        if (
          type
            .toLowerCase()
            .includes("mendan")
        ) {
          try {
            const phone =
              String(
                row.Telefon ||
                  row.telefon ||
                  ""
              ).trim();

            const address =
              String(
                row.Manzil ||
                  row.manzil ||
                  ""
              ).trim();

            const object =
              String(
                row.Obekt ||
                  row.obekt ||
                  ""
              ).trim();

            let existing =
              customers.find(
                (c) =>
                  String(
                    c.name || ""
                  ).toLowerCase() ===
                  name.toLowerCase()
              );

            if (existing) {
              await API.put(
                `/customers/${existing.id}`,
                {
                  name:
                    existing.name,
                  phone:
                    phone ||
                    existing.phone ||
                    null,
                  address:
                    address ||
                    existing.address ||
                    null,
                  object:
                    object ||
                    existing.object ||
                    null,
                  debt: amount,
                }
              );

              updated++;
            } else {
              await API.post(
                "/customers/",
                {
                  name,
                  phone:
                    phone || null,
                  address:
                    address || null,
                  object:
                    object || null,
                  debt: amount,
                }
              );

              added++;
            }
          } catch (error) {
            console.error(
              "Mijoz import xatosi:",
              error
            );
            errors++;
          }

          continue;
        }

        // =========================================
        // MEN QARZDORMAN
        // =========================================

        try {
          const currency =
            String(
              row.Valyuta ||
                row.valyuta ||
                "UZS"
            )
              .trim()
              .toUpperCase();

          const title =
            String(
              row.Sabab ||
                row.sabab ||
                row.Izoh ||
                ""
            ).trim();

          const note =
            String(
              row.Izoh ||
                row.izoh ||
                ""
            ).trim();

          const total =
            Number(
              row.Jami ||
                row.jami ||
                amount
            );

          const paid =
            Number(
              row.Tolangan ||
                row.tolangan ||
                0
            );

          if (
            !total ||
            total <= 0
          ) {
            errors++;
            continue;
          }

          await API.post(
            "/debts/",
            {
              creditor: name,
              title:
                title || null,
              amount: total,
              paid,
              currency:
                currency === "USD"
                  ? "USD"
                  : "UZS",
              status:
                total - paid > 0
                  ? "qarzdor"
                  : "tugagan",
              note:
                note || null,
            }
          );

          added++;
        } catch (error) {
          console.error(
            "Qarz import xatosi:",
            error
          );

          errors++;
        }
      }

      await loadAll();

      event.target.value = "";

      alert(
        `Excel import tugadi.\n\nQo'shildi: ${added}\nYangilandi: ${updated}\nXato: ${errors}`
      );
    } catch (error) {
      console.error(
        "Excel import xatosi:",
        error
      );

      alert(
        "Excel faylni o'qishda xato yuz berdi."
      );

      event.target.value = "";
    }
  };

  // =====================================================
  // TEMPLATE
  // =====================================================

  const downloadTemplate = () => {
    const rows = [
      {
        Turi: "Mendan qarzdor",
        Ism: "Ali",
        Telefon: "901234567",
        Manzil: "Buxoro",
        Obekt: "Uy",
        Sabab: "Kamera",
        Jami: 5000000,
        Tolangan: 1000000,
        Qoldiq: 4000000,
        Valyuta: "UZS",
        Holat: "Qarzdor",
        Sana: "",
        Izoh: "Namuna",
      },
      {
        Turi: "Men qarzdorman",
        Ism: "Farrux",
        Telefon: "",
        Manzil: "",
        Obekt: "",
        Sabab: "Kredit",
        Jami: 20000000,
        Tolangan: 1200000,
        Qoldiq: 18800000,
        Valyuta: "UZS",
        Holat: "Qarzdor",
        Sana: "",
        Izoh: "2025 kredit",
      },
    ];

    const worksheet =
      XLSX.utils.json_to_sheet(rows);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Moliya"
    );

    XLSX.writeFile(
      workbook,
      "SAFE_HOME_MOLIYA_NAMUNA.xlsx"
    );
  };

  // =====================================================
  // EMPTY
  // =====================================================

  const EmptyState = ({
    text,
  }) => (
    <div style={styles.empty}>
      <div
        style={styles.emptyIcon}
      >
        💰
      </div>

      <h3
        style={{
          margin: "0 0 8px",
        }}
      >
        Ma'lumot topilmadi
      </h3>

      <p
        style={{
          margin: 0,
          color: "#64748b",
        }}
      >
        {text}
      </p>
    </div>
  );

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div style={styles.page}>
      {/* HEADER */}

      <div style={styles.header}>
        <div>
          <div
            style={styles.breadcrumb}
          >
            SAFE HOME / Moliya
          </div>

          <h1
            style={styles.title}
          >
            Moliya
          </h1>

          <p
            style={styles.subtitle}
          >
            Qarzlar, to'lovlar va
            moliyaviy nazorat
          </p>
        </div>

        <div
          style={styles.headerButtons}
        >
          <button
            onClick={
              downloadTemplate
            }
            style={
              styles.secondaryButton
            }
          >
            📄 Shablon
          </button>

          <label
            style={
              styles.importButton
            }
          >
            📥 Excel yuklash
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={
                importExcel
              }
              style={{
                display: "none",
              }}
            />
          </label>

          <button
            onClick={
              exportExcel
            }
            style={
              styles.exportButton
            }
          >
            📤 Excelga chiqarish
          </button>

          <button
            onClick={() =>
              setShowAdd(true)
            }
            style={
              styles.primaryButton
            }
          >
            ＋ Qarz qo'shish
          </button>
        </div>
      </div>

      {/* STATS */}

      <div style={styles.cards}>
        <div
          style={styles.statCard}
        >
          <div
            style={
              styles.statIconBlue
            }
          >
            ₿
          </div>

          <div>
            <div
              style={styles.statLabel}
            >
              Jami qarzlar
            </div>

            <div
              style={styles.statValue}
            >
              {stats.count}
              <span
                style={styles.statUnit}
              >
                {" "}
                ta
              </span>
            </div>
          </div>
        </div>

        <div
          style={styles.statCard}
        >
          <div
            style={
              styles.statIconRed
            }
          >
            UZ
          </div>

          <div>
            <div
              style={styles.statLabel}
            >
              So'm qoldig'i
            </div>

            <div
              style={
                styles.statValueSmall
              }
            >
              {formatMoney(
                stats.uzs.remaining,
                "UZS"
              )}
            </div>
          </div>
        </div>

        <div
          style={styles.statCard}
        >
          <div
            style={
              styles.statIconGreen
            }
          >
            $
          </div>

          <div>
            <div
              style={styles.statLabel}
            >
              Dollar qoldig'i
            </div>

            <div
              style={
                styles.statValueSmall
              }
            >
              {formatMoney(
                stats.usd.remaining,
                "USD"
              )}
            </div>
          </div>
        </div>

        <div
          style={styles.statCard}
        >
          <div
            style={
              styles.statIconPurple
            }
          >
            💰
          </div>

          <div>
            <div
              style={styles.statLabel}
            >
              Mendan qarzdor
            </div>

            <div
              style={
                styles.statValueSmall
              }
            >
              {formatMoney(
                stats.customerDebt,
                "UZS"
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABS */}

      <div style={styles.tabs}>
        <button
          onClick={() =>
            setActiveTab(
              "mydebts"
            )
          }
          style={{
            ...styles.tab,
            ...(activeTab ===
            "mydebts"
              ? styles.activeTabBlue
              : {}),
          }}
        >
          💳 Men qarzdorman
        </button>

        <button
          onClick={() =>
            setActiveTab(
              "receivables"
            )
          }
          style={{
            ...styles.tab,
            ...(activeTab ===
            "receivables"
              ? styles.activeTabGreen
              : {}),
          }}
        >
          💰 Mendan qarzdor
          {receivables.length >
            0 && (
            <span
              style={
                styles.tabCount
              }
            >
              {
                receivables.length
              }
            </span>
          )}
        </button>
      </div>

      {/* =====================================================
          MY DEBTS
      ===================================================== */}

      {activeTab ===
        "mydebts" && (
        <div
          style={styles.panel}
        >
          <div
            style={
              styles.panelHeader
            }
          >
            <div>
              <h2
                style={
                  styles.panelTitle
                }
              >
                Mening qarzlarim
              </h2>

              <p
                style={
                  styles.panelSubtitle
                }
              >
                Siz to'lashingiz
                kerak bo'lgan
                qarzlar
              </p>
            </div>

            <button
              onClick={
                loadAll
              }
              style={
                styles.refreshButton
              }
            >
              ↻ Yangilash
            </button>
          </div>

          <div
            style={styles.filters}
          >
            <div
              style={
                styles.searchBox
              }
            >
              <span>⌕</span>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Qarz yoki shaxsni qidirish..."
                style={
                  styles.searchInput
                }
              />
            </div>

            <select
              value={
                currencyFilter
              }
              onChange={(e) =>
                setCurrencyFilter(
                  e.target.value
                )
              }
              style={
                styles.select
              }
            >
              <option value="ALL">
                Barcha valyutalar
              </option>

              <option value="UZS">
                So'm (UZS)
              </option>

              <option value="USD">
                Dollar (USD)
              </option>
            </select>
          </div>

          {loading ? (
            <div
              style={
                styles.loading
              }
            >
              Ma'lumotlar
              yuklanmoqda...
            </div>
          ) : filteredDebts.length ===
            0 ? (
            <EmptyState text="Hozircha qarzlar mavjud emas." />
          ) : (
            <div
              style={
                styles.tableWrap
              }
            >
              <table
                style={
                  styles.table
                }
              >
                <thead>
                  <tr>
                    <th
                      style={
                        styles.th
                      }
                    >
                      Kimga
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Sabab
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Jami
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      To'langan
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Qoldiq
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Holat
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Sana
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Amallar
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredDebts.map(
                    (debt) => {
                      const amount =
                        Number(
                          debt.amount ||
                            0
                        );

                      const paid =
                        Number(
                          debt.paid ||
                            0
                        );

                      const remaining =
                        Math.max(
                          amount -
                            paid,
                          0
                        );

                      const finished =
                        remaining <=
                        0;

                      return (
                        <tr
                          key={
                            debt.id
                          }
                          style={
                            styles.tr
                          }
                        >
                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong>
                              {
                                debt.creditor
                              }
                            </strong>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {
                              debt.title ||
                              "—"
                            }
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {formatMoney(
                              amount,
                              debt.currency
                            )}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <span
                              style={{
                                color:
                                  "#16a34a",
                                fontWeight:
                                  700,
                              }}
                            >
                              {formatMoney(
                                paid,
                                debt.currency
                              )}
                            </span>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <strong
                              style={{
                                color:
                                  finished
                                    ? "#16a34a"
                                    : "#dc2626",
                              }}
                            >
                              {formatMoney(
                                remaining,
                                debt.currency
                              )}
                            </strong>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <span
                              style={{
                                ...styles.status,
                                ...(finished
                                  ? styles.statusGreen
                                  : styles.statusRed),
                              }}
                            >
                              {finished
                                ? "✓ Tugagan"
                                : "● Qarzdor"}
                            </span>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {formatDate(
                              debt.created_at
                            )}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <div
                              style={
                                styles.actionButtons
                              }
                            >
                              {!finished && (
                                <button
                                  onClick={() =>
                                    openPayment(
                                      debt
                                    )
                                  }
                                  style={
                                    styles.payButton
                                  }
                                >
                                  💵 To'lov
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  openHistory(
                                    debt
                                  )
                                }
                                style={
                                  styles.historyButton
                                }
                              >
                                📋 Tarix
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          RECEIVABLES
      ===================================================== */}

      {activeTab ===
        "receivables" && (
        <div
          style={styles.panel}
        >
          <div
            style={
              styles.panelHeader
            }
          >
            <div>
              <h2
                style={
                  styles.panelTitle
                }
              >
                Mendan qarzdorlar
              </h2>

              <p
                style={
                  styles.panelSubtitle
                }
              >
                Mijozlar ro'yxatidagi
                qarzdor mijozlar
              </p>
            </div>

            <button
              onClick={
                loadAll
              }
              style={
                styles.greenButton
              }
            >
              ↻ Yangilash
            </button>
          </div>

          <div
            style={styles.filters}
          >
            <div
              style={
                styles.searchBox
              }
            >
              <span>⌕</span>

              <input
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                placeholder="Mijozni qidirish..."
                style={
                  styles.searchInput
                }
              />
            </div>
          </div>

          {filteredReceivables.length ===
          0 ? (
            <EmptyState text="Hozircha qarzdor mijozlar yo'q." />
          ) : (
            <div
              style={
                styles.tableWrap
              }
            >
              <table
                style={
                  styles.table
                }
              >
                <thead>
                  <tr>
                    <th
                      style={
                        styles.th
                      }
                    >
                      Mijoz
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Telefon
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Manzil
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Obekt
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Qarz
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Amal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredReceivables.map(
                    (customer) => (
                      <tr
                        key={
                          customer.id
                        }
                        style={
                          styles.tr
                        }
                      >
                        <td
                          style={
                            styles.td
                          }
                        >
                          <strong>
                            {
                              customer.name
                            }
                          </strong>
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {
                            customer.phone ||
                            "—"
                          }
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {
                            customer.address ||
                            "—"
                          }
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {
                            customer.object ||
                            "—"
                          }
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <strong
                            style={{
                              color:
                                "#dc2626",
                              fontSize:
                                16,
                            }}
                          >
                            {formatMoney(
                              customer.debt,
                              "UZS"
                            )}
                          </strong>
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <button
                            onClick={() =>
                              payCustomerDebt(
                                customer
                              )
                            }
                            style={
                              styles.payButton
                            }
                          >
                            💵 To'lov
                          </button>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =====================================================
          ADD DEBT MODAL
      ===================================================== */}

      {showAdd && (
        <div
          style={styles.overlay}
        >
          <form
            onSubmit={addDebt}
            style={styles.modal}
          >
            <div
              style={
                styles.modalHeader
              }
            >
              <div>
                <h2
                  style={
                    styles.modalTitle
                  }
                >
                  Yangi qarz
                </h2>

                <p
                  style={
                    styles.modalSubtitle
                  }
                >
                  Moliyaviy majburiyat
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAdd(false)
                }
                style={
                  styles.closeButton
                }
              >
                ×
              </button>
            </div>

            <label
              style={styles.label}
            >
              Kimga qarz?
            </label>

            <input
              name="creditor"
              value={
                form.creditor
              }
              onChange={
                handleChange
              }
              placeholder="Masalan: Farrux"
              style={styles.input}
            />

            <label
              style={styles.label}
            >
              Sabab
            </label>

            <input
              name="title"
              value={
                form.title
              }
              onChange={
                handleChange
              }
              placeholder="Masalan: Kredit, Noutbuk"
              style={styles.input}
            />

            <label
              style={styles.label}
            >
              Summa
            </label>

            <input
              name="amount"
              type="number"
              min="0"
              value={
                form.amount
              }
              onChange={
                handleChange
              }
              placeholder="0"
              style={styles.input}
            />

            <label
              style={styles.label}
            >
              Valyuta
            </label>

            <select
              name="currency"
              value={
                form.currency
              }
              onChange={
                handleChange
              }
              style={styles.input}
            >
              <option value="UZS">
                UZS — so'm
              </option>

              <option value="USD">
                USD — dollar
              </option>
            </select>

            <label
              style={styles.label}
            >
              Izoh
            </label>

            <textarea
              name="note"
              value={
                form.note
              }
              onChange={
                handleChange
              }
              style={{
                ...styles.input,
                minHeight: 80,
              }}
            />

            <div
              style={
                styles.modalActions
              }
            >
              <button
                type="button"
                onClick={() =>
                  setShowAdd(false)
                }
                style={
                  styles.cancelButton
                }
              >
                Bekor qilish
              </button>

              <button
                type="submit"
                style={
                  styles.saveButton
                }
              >
                ✓ Saqlash
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =====================================================
          PAYMENT MODAL
      ===================================================== */}

      {showPayment &&
        selectedDebt && (
          <div
            style={
              styles.overlay
            }
          >
            <form
              onSubmit={
                addPayment
              }
              style={
                styles.modal
              }
            >
              <div
                style={
                  styles.modalHeader
                }
              >
                <div>
                  <h2
                    style={
                      styles.modalTitle
                    }
                  >
                    To'lov qilish
                  </h2>

                  <p
                    style={
                      styles.modalSubtitle
                    }
                  >
                    {
                      selectedDebt.creditor
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowPayment(
                      false
                    )
                  }
                  style={
                    styles.closeButton
                  }
                >
                  ×
                </button>
              </div>

              <div
                style={
                  styles.paymentInfo
                }
              >
                <div>
                  <span>
                    Jami
                  </span>

                  <strong>
                    {formatMoney(
                      selectedDebt.amount,
                      selectedDebt.currency
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    To'langan
                  </span>

                  <strong
                    style={{
                      color:
                        "#16a34a",
                    }}
                  >
                    {formatMoney(
                      selectedDebt.paid,
                      selectedDebt.currency
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Qoldiq
                  </span>

                  <strong
                    style={{
                      color:
                        "#dc2626",
                    }}
                  >
                    {formatMoney(
                      Number(
                        selectedDebt.amount
                      ) -
                        Number(
                          selectedDebt.paid
                        ),
                      selectedDebt.currency
                    )}
                  </strong>
                </div>
              </div>

              <label
                style={
                  styles.label
                }
              >
                To'lov summasi
              </label>

              <input
                type="number"
                min="0"
                value={
                  paymentForm.amount
                }
                onChange={(e) =>
                  setPaymentForm(
                    (old) => ({
                      ...old,
                      amount:
                        e.target.value,
                    })
                  )
                }
                style={
                  styles.input
                }
              />

              <label
                style={
                  styles.label
                }
              >
                Izoh
              </label>

              <textarea
                value={
                  paymentForm.note
                }
                onChange={(e) =>
                  setPaymentForm(
                    (old) => ({
                      ...old,
                      note:
                        e.target.value,
                    })
                  )
                }
                style={{
                  ...styles.input,
                  minHeight: 70,
                }}
              />

              <div
                style={
                  styles.modalActions
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    setShowPayment(
                      false
                    )
                  }
                  style={
                    styles.cancelButton
                  }
                >
                  Bekor qilish
                </button>

                <button
                  type="submit"
                  style={
                    styles.saveButton
                  }
                >
                  ✓ To'lovni saqlash
                </button>
              </div>
            </form>
          </div>
        )}

      {/* =====================================================
          HISTORY
      ===================================================== */}

      {showHistory &&
        selectedDebt && (
          <div
            style={
              styles.overlay
            }
          >
            <div
              style={{
                ...styles.modal,
                maxWidth: 700,
              }}
            >
              <div
                style={
                  styles.modalHeader
                }
              >
                <div>
                  <h2
                    style={
                      styles.modalTitle
                    }
                  >
                    To'lovlar tarixi
                  </h2>

                  <p
                    style={
                      styles.modalSubtitle
                    }
                  >
                    {
                      selectedDebt.creditor
                    }
                  </p>
                </div>

                <button
                  onClick={() =>
                    setShowHistory(
                      false
                    )
                  }
                  style={
                    styles.closeButton
                  }
                >
                  ×
                </button>
              </div>

              {historyLoading ? (
                <div
                  style={
                    styles.loading
                  }
                >
                  Tarix
                  yuklanmoqda...
                </div>
              ) : payments.length ===
                0 ? (
                <EmptyState text="Hali hech qanday to'lov amalga oshirilmagan." />
              ) : (
                <div
                  style={
                    styles.historyList
                  }
                >
                  {payments.map(
                    (
                      payment,
                      index
                    ) => (
                      <div
                        key={
                          payment.id ||
                          index
                        }
                        style={
                          styles.historyItem
                        }
                      >
                        <strong
                          style={{
                            color:
                              "#16a34a",
                          }}
                        >
                          +
                          {formatMoney(
                            payment.amount,
                            payment.currency ||
                              selectedDebt.currency
                          )}
                        </strong>

                        <span
                          style={
                            styles.historyDate
                          }
                        >
                          {formatDateTime(
                            payment.payment_date
                          )}
                        </span>

                        {payment.note && (
                          <span>
                            {
                              payment.note
                            }
                          </span>
                        )}
                      </div>
                    )
                  )}
                </div>
              )}

              <div
                style={
                  styles.historyFooter
                }
              >
                <strong>
                  To'langan:{" "}
                  {formatMoney(
                    selectedDebt.paid,
                    selectedDebt.currency
                  )}
                </strong>

                <strong
                  style={{
                    color:
                      "#dc2626",
                  }}
                >
                  Qoldiq:{" "}
                  {formatMoney(
                    Number(
                      selectedDebt.amount
                    ) -
                      Number(
                        selectedDebt.paid
                      ),
                    selectedDebt.currency
                  )}
                </strong>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles = {
  page: {
    minHeight: "100%",
    background: "#f8fafc",
    padding: 28,
    boxSizing: "border-box",
    color: "#0f172a",
  },

  header: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 20,
    marginBottom: 25,
    flexWrap: "wrap",
  },

  headerButtons: {
    display: "flex",
    gap: 8,
    flexWrap: "wrap",
  },

  breadcrumb: {
    color: "#94a3b8",
    fontSize: 12,
    marginBottom: 7,
    fontWeight: 600,
  },

  title: {
    margin: 0,
    fontSize: 32,
    fontWeight: 800,
  },

  subtitle: {
    margin: "6px 0 0",
    color: "#64748b",
  },

  primaryButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "11px 15px",
    borderRadius: 9,
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#334155",
    padding: "11px 15px",
    borderRadius: 9,
    fontWeight: 700,
    cursor: "pointer",
  },

  importButton: {
    display: "inline-flex",
    alignItems: "center",
    border: "none",
    background: "#16a34a",
    color: "#fff",
    padding: "11px 15px",
    borderRadius: 9,
    fontWeight: 700,
    cursor: "pointer",
  },

  exportButton: {
    border: "none",
    background: "#0f766e",
    color: "#fff",
    padding: "11px 15px",
    borderRadius: 9,
    fontWeight: 700,
    cursor: "pointer",
  },

  cards: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(210px,1fr))",
    gap: 15,
    marginBottom: 18,
  },

  statCard: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: 18,
    display: "flex",
    gap: 14,
    alignItems: "center",
  },

  statIconBlue: {
    width: 45,
    height: 45,
    borderRadius: 10,
    background: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  statIconRed: {
    width: 45,
    height: 45,
    borderRadius: 10,
    background: "#fef2f2",
    color: "#dc2626",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
  },

  statIconGreen: {
    width: 45,
    height: 45,
    borderRadius: 10,
    background: "#f0fdf4",
    color: "#16a34a",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 19,
  },

  statIconPurple: {
    width: 45,
    height: 45,
    borderRadius: 10,
    background: "#faf5ff",
    color: "#9333ea",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  statLabel: {
    color: "#64748b",
    fontSize: 12,
    marginBottom: 5,
  },

  statValue: {
    fontSize: 25,
    fontWeight: 800,
  },

  statValueSmall: {
    fontSize: 17,
    fontWeight: 800,
  },

  statUnit: {
    fontSize: 12,
    color: "#64748b",
  },

  tabs: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 11,
    padding: 5,
    display: "flex",
    gap: 5,
    marginBottom: 18,
  },

  tab: {
    flex: 1,
    border: "none",
    background: "transparent",
    padding: 12,
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
    color: "#64748b",
  },

  activeTabBlue: {
    background: "#2563eb",
    color: "#fff",
  },

  activeTabGreen: {
    background: "#16a34a",
    color: "#fff",
  },

  tabCount: {
    marginLeft: 8,
    background: "#fff",
    color: "#16a34a",
    padding: "2px 7px",
    borderRadius: 20,
  },

  panel: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    overflow: "hidden",
  },

  panelHeader: {
    padding: 19,
    borderBottom:
      "1px solid #e2e8f0",
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: 15,
    flexWrap: "wrap",
  },

  panelTitle: {
    margin: 0,
    fontSize: 18,
    fontWeight: 800,
  },

  panelSubtitle: {
    margin: "5px 0 0",
    color: "#94a3b8",
    fontSize: 12,
  },

  refreshButton: {
    border: "1px solid #dbeafe",
    background: "#eff6ff",
    color: "#2563eb",
    padding: "9px 13px",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
  },

  greenButton: {
    border: "none",
    background: "#16a34a",
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
  },

  filters: {
    padding: 15,
    display: "flex",
    gap: 10,
    borderBottom:
      "1px solid #f1f5f9",
    flexWrap: "wrap",
  },

  searchBox: {
    flex: 1,
    minWidth: 230,
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "0 12px",
  },

  searchInput: {
    width: "100%",
    border: "none",
    outline: "none",
    padding: "11px 0",
  },

  select: {
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    padding: "10px 12px",
    background: "#fff",
  },

  tableWrap: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 900,
  },

  th: {
    textAlign: "left",
    padding: "13px 15px",
    background: "#f8fafc",
    borderBottom:
      "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: 11,
    whiteSpace: "nowrap",
  },

  tr: {
    borderBottom:
      "1px solid #f1f5f9",
  },

  td: {
    padding: "13px 15px",
    fontSize: 13,
    whiteSpace: "nowrap",
  },

  status: {
    display: "inline-block",
    padding: "5px 8px",
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 800,
  },

  statusGreen: {
    background: "#f0fdf4",
    color: "#16a34a",
  },

  statusRed: {
    background: "#fef2f2",
    color: "#dc2626",
  },

  actionButtons: {
    display: "flex",
    gap: 6,
  },

  payButton: {
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: "7px 10px",
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  },

  historyButton: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#475569",
    padding: "7px 10px",
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
  },

  empty: {
    padding: 55,
    textAlign: "center",
  },

  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },

  loading: {
    padding: 55,
    textAlign: "center",
    color: "#64748b",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(15,23,42,.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
    overflowY: "auto",
  },

  modal: {
    width: "100%",
    maxWidth: 540,
    background: "#fff",
    borderRadius: 15,
    padding: 24,
    boxSizing: "border-box",
  },

  modalHeader: {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },

  modalTitle: {
    margin: 0,
    fontSize: 21,
    fontWeight: 800,
  },

  modalSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: 12,
  },

  closeButton: {
    border: "none",
    background: "#f1f5f9",
    width: 34,
    height: 34,
    borderRadius: 8,
    fontSize: 22,
    cursor: "pointer",
  },

  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 6,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: 11,
    marginBottom: 14,
    border: "1px solid #cbd5e1",
    borderRadius: 8,
    outline: "none",
    fontSize: 14,
  },

  modalActions: {
    display: "flex",
    gap: 10,
    marginTop: 5,
  },

  cancelButton: {
    flex: 1,
    border: "none",
    background: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
  },

  saveButton: {
    flex: 1,
    border: "none",
    background: "#2563eb",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    fontWeight: 700,
    cursor: "pointer",
  },

  paymentInfo: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3,1fr)",
    gap: 10,
    background: "#f8fafc",
    padding: 14,
    borderRadius: 9,
    marginBottom: 18,
  },

  historyList: {
    maxHeight: 350,
    overflowY: "auto",
    border: "1px solid #e2e8f0",
    borderRadius: 9,
  },

  historyItem: {
    display: "flex",
    gap: 15,
    alignItems: "center",
    padding: 13,
    borderBottom:
      "1px solid #f1f5f9",
  },

  historyDate: {
    color: "#64748b",
    fontSize: 11,
  },

  historyFooter: {
    marginTop: 15,
    padding: 14,
    background: "#f8fafc",
    borderRadius: 9,
    display: "flex",
    justifyContent:
      "space-between",
    gap: 15,
  },
};

export default Finance;