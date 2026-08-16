import React, { useEffect, useMemo, useState } from "react";
import API from "../api";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  Add,
  Search,
  Refresh,
  Payments,
  Delete,
  History,
  AccountBalanceWallet,
  TrendingDown,
  CheckCircle,
  Warning,
} from "@mui/icons-material";

function Debts() {
  const [debts, setDebts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [payments, setPayments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const [selectedDebt, setSelectedDebt] = useState(null);

  const [form, setForm] = useState({
    creditor: "",
    title: "",
    amount: "",
    paid: "",
    currency: "UZS",
    note: "",
    customer_id: "",
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    note: "",
  });

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    await Promise.all([
      loadDebts(),
      loadCustomers(),
    ]);
  };

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

  const loadCustomers = async () => {
    try {
      const response = await API.get(
        "/customers/"
      );

      setCustomers(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error("Customers error:", error);
      setCustomers([]);
    }
  };

  const money = (
    value,
    currency = "UZS"
  ) => {
    const number = Number(value) || 0;

    return (
      new Intl.NumberFormat("uz-UZ").format(
        number
      ) +
      (currency === "USD"
        ? " $"
        : " so'm")
    );
  };

  const dateFormat = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleString("uz-UZ", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statistics = useMemo(() => {
    let total = 0;
    let paid = 0;
    let remaining = 0;
    let active = 0;
    let completed = 0;

    debts.forEach((debt) => {
      const amount = Number(debt.amount) || 0;
      const paidAmount = Number(debt.paid) || 0;

      const balance = Math.max(
        Number(
          debt.remaining ??
            amount - paidAmount
        ) || 0,
        0
      );

      total += amount;
      paid += paidAmount;
      remaining += balance;

      if (balance > 0) {
        active++;
      } else {
        completed++;
      }
    });

    return {
      total,
      paid,
      remaining,
      active,
      completed,
    };
  }, [debts]);

  const filteredDebts = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) {
      return debts;
    }

    return debts.filter((debt) => {
      const customer = customers.find(
        (item) =>
          Number(item.id) ===
          Number(debt.customer_id)
      );

      const text = [
        debt.id,
        debt.creditor,
        debt.title,
        debt.note,
        customer?.name,
        customer?.full_name,
        customer?.phone,
      ]
        .join(" ")
        .toLowerCase();

      return text.includes(q);
    });
  }, [debts, customers, search]);

  const changeForm = (event) => {
    const { name, value } = event.target;

    setForm((old) => ({
      ...old,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm({
      creditor: "",
      title: "",
      amount: "",
      paid: "",
      currency: "UZS",
      note: "",
      customer_id: "",
    });
  };

  const addDebt = async (event) => {
    event.preventDefault();

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

    if (
      Number(form.paid || 0) >
      Number(form.amount)
    ) {
      alert(
        "To'langan summa qarzdan katta bo'lishi mumkin emas"
      );
      return;
    }

    try {
      setSaving(true);

      await API.post("/debts/", {
        creditor: form.creditor.trim(),
        title: form.title || null,
        amount: Number(form.amount),
        paid: Number(form.paid || 0),
        currency: form.currency,
        note: form.note || null,
        customer_id: form.customer_id
          ? Number(form.customer_id)
          : null,
      });

      setShowAdd(false);
      resetForm();

      await loadDebts();

      alert("Qarz muvaffaqiyatli qo'shildi");
    } catch (error) {
      console.error("Add debt error:", error);

      alert(
        error.response?.data?.detail ||
          "Qarz qo'shib bo'lmadi"
      );
    } finally {
      setSaving(false);
    }
  };

  const openPayment = (debt) => {
    setSelectedDebt(debt);

    setPaymentForm({
      amount: "",
      note: "",
    });

    setShowPayment(true);
  };

  const addPayment = async (event) => {
    event.preventDefault();

    if (!selectedDebt) {
      return;
    }

    const amount =
      Number(paymentForm.amount) || 0;

    const total =
      Number(selectedDebt.amount) || 0;

    const paid =
      Number(selectedDebt.paid) || 0;

    const remaining = Math.max(
      Number(
        selectedDebt.remaining ??
          total - paid
      ) || 0,
      0
    );

    if (amount <= 0) {
      alert("To'lov summasini kiriting");
      return;
    }

    if (amount > remaining) {
      alert(
        "Qoldiq: " +
          money(
            remaining,
            selectedDebt.currency
          )
      );
      return;
    }

    try {
      setSaving(true);

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

      await loadDebts();

      alert("To'lov muvaffaqiyatli saqlandi");
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

      setShowHistory(true);
    } catch (error) {
      console.error(
        "History error:",
        error
      );

      alert(
        error.response?.data?.detail ||
          "To'lovlar tarixini yuklab bo'lmadi"
      );
    }
  };

  const deleteDebt = async (debt) => {
    const ok = window.confirm(
      `"${debt.creditor}" qarzini o'chirishni xohlaysizmi?`
    );

    if (!ok) {
      return;
    }

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

  const customerName = (debt) => {
    if (debt.creditor) {
      return debt.creditor;
    }

    const customer = customers.find(
      (item) =>
        Number(item.id) ===
        Number(debt.customer_id)
    );

    return (
      customer?.name ||
      customer?.full_name ||
      customer?.phone ||
      "-"
    );
  };

  const StatCard = ({
    title,
    value,
    icon,
    color,
    subtitle,
  }) => {
    return (
      <Card
        sx={{
          borderRadius: 3,
          height: "100%",
          boxShadow:
            "0 8px 30px rgba(15,23,42,0.08)",
          border:
            "1px solid #eef2f7",
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                color="text.secondary"
                fontSize={14}
                fontWeight={600}
              >
                {title}
              </Typography>

              <Typography
                variant="h5"
                fontWeight={800}
                mt={1}
              >
                {value}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                mt={0.5}
              >
                {subtitle}
              </Typography>
            </Box>

            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: color,
                color: "white",
              }}
            >
              {icon}
            </Box>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "#f6f8fc",
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >
      <Stack
        direction={{
          xs: "column",
          md: "row",
        }}
        justifyContent="space-between"
        alignItems={{
          xs: "stretch",
          md: "center",
        }}
        spacing={2}
        mb={3}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={900}
            color="#111827"
          >
            Qarzlar
          </Typography>

          <Typography
            color="text.secondary"
            mt={0.5}
          >
            Qarzlar, to'lovlar va moliyaviy nazorat
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadAll}
            sx={{
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Yangilash
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() =>
              setShowAdd(true)
            }
            sx={{
              borderRadius: 2,
              fontWeight: 700,
            }}
          >
            Qarz qo'shish
          </Button>
        </Stack>
      </Stack>

      <Grid
        container
        spacing={2}
        mb={3}
      >
        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="Jami qarz"
            value={money(
              statistics.total
            )}
            icon={
              <AccountBalanceWallet />
            }
            color="#2563eb"
            subtitle={`${debts.length} ta qarz`}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="To'langan"
            value={money(
              statistics.paid
            )}
            icon={<CheckCircle />}
            color="#16a34a"
            subtitle="Qaytarilgan summa"
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="Qoldiq qarz"
            value={money(
              statistics.remaining
            )}
            icon={<Warning />}
            color="#dc2626"
            subtitle={`${statistics.active} ta faol qarz`}
          />
        </Grid>

        <Grid
          item
          xs={12}
          sm={6}
          lg={3}
        >
          <StatCard
            title="Tugagan qarzlar"
            value={
              statistics.completed
            }
            icon={<TrendingDown />}
            color="#7c3aed"
            subtitle="To'liq yopilgan"
          />
        </Grid>
      </Grid>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          boxShadow:
            "0 8px 30px rgba(15,23,42,0.07)",
        }}
      >
        <Box
          sx={{
            p: 2,
            background: "white",
          }}
        >
          <TextField
            fullWidth
            placeholder="Qarz, mijoz yoki izoh bo'yicha qidirish..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: 650,
            }}
          />
        </Box>

        <Divider />

        {loading ? (
          <Box
            sx={{
              p: 8,
              textAlign: "center",
            }}
          >
            <Typography>
              Qarzlar yuklanmoqda...
            </Typography>
          </Box>
        ) : filteredDebts.length === 0 ? (
          <Box
            sx={{
              p: 8,
              textAlign: "center",
            }}
          >
            <Typography fontSize={50}>
              💰
            </Typography>

            <Typography
              variant="h6"
              fontWeight={800}
              mt={1}
            >
              Qarzlar topilmadi
            </Typography>

            <Typography
              color="text.secondary"
              mt={1}
            >
              Yangi qarz qo'shish uchun yuqoridagi tugmani bosing.
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: "100%",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse:
                  "collapse",
                minWidth: "1100px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                  }}
                >
                  <th style={thStyle}>
                    ID
                  </th>
                  <th style={thStyle}>
                    Kimga
                  </th>
                  <th style={thStyle}>
                    Sabab
                  </th>
                  <th style={thStyle}>
                    Jami
                  </th>
                  <th style={thStyle}>
                    To'langan
                  </th>
                  <th style={thStyle}>
                    Qoldiq
                  </th>
                  <th style={thStyle}>
                    Holat
                  </th>
                  <th style={thStyle}>
                    Sana
                  </th>
                  <th style={thStyle}>
                    Amallar
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredDebts.map(
                  (debt) => {
                    const total =
                      Number(
                        debt.amount
                      ) || 0;

                    const paid =
                      Number(
                        debt.paid
                      ) || 0;

                    const remaining =
                      Math.max(
                        Number(
                          debt.remaining ??
                            total - paid
                        ) || 0,
                        0
                      );

                    return (
                      <tr
                        key={debt.id}
                        style={{
                          borderBottom:
                            "1px solid #eef2f7",
                        }}
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          #{debt.id}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            fontWeight: 800,
                          }}
                        >
                          {customerName(
                            debt
                          )}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {debt.title ||
                            "-"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <b>
                            {money(
                              total,
                              debt.currency
                            )}
                          </b>
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            color: "#16a34a",
                            fontWeight: 700,
                          }}
                        >
                          {money(
                            paid,
                            debt.currency
                          )}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            color:
                              remaining > 0
                                ? "#dc2626"
                                : "#16a34a",
                            fontWeight: 900,
                          }}
                        >
                          {money(
                            remaining,
                            debt.currency
                          )}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {remaining <= 0 ? (
                            <Chip
                              size="small"
                              label="Tugagan"
                              color="success"
                              icon={
                                <CheckCircle />
                              }
                            />
                          ) : (
                            <Chip
                              size="small"
                              label="Faol qarz"
                              color="error"
                            />
                          )}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {dateFormat(
                            debt.created_at
                          )}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          <Stack
                            direction="row"
                            spacing={0.5}
                          >
                            {remaining > 0 && (
                              <IconButton
                                size="small"
                                color="success"
                                title="To'lov"
                                onClick={() =>
                                  openPayment(
                                    debt
                                  )
                                }
                              >
                                <Payments />
                              </IconButton>
                            )}

                            <IconButton
                              size="small"
                              color="primary"
                              title="Tarix"
                              onClick={() =>
                                openHistory(
                                  debt
                                )
                              }
                            >
                              <History />
                            </IconButton>

                            <IconButton
                              size="small"
                              color="error"
                              title="O'chirish"
                              onClick={() =>
                                deleteDebt(
                                  debt
                                )
                              }
                            >
                              <Delete />
                            </IconButton>
                          </Stack>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </Box>
        )}
      </Paper>

      {/* QARZ QO'SHISH */}

      <Dialog
        open={showAdd}
        onClose={() =>
          !saving &&
          setShowAdd(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontWeight: 800 }}
        >
          Yangi qarz qo'shish
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            mt={1}
          >
            <TextField
              fullWidth
              label="Kimga qarz *"
              name="creditor"
              value={form.creditor}
              onChange={changeForm}
            />

            <TextField
              select
              fullWidth
              label="Mijoz"
              name="customer_id"
              value={form.customer_id}
              onChange={changeForm}
            >
              <MenuItem value="">
                Mijoz tanlanmagan
              </MenuItem>

              {customers.map(
                (customer) => (
                  <MenuItem
                    key={customer.id}
                    value={customer.id}
                  >
                    {customer.name ||
                      customer.full_name ||
                      customer.phone ||
                      `Mijoz #${customer.id}`}
                  </MenuItem>
                )
              )}
            </TextField>

            <TextField
              fullWidth
              label="Qarz sababi"
              name="title"
              value={form.title}
              onChange={changeForm}
              placeholder="Masalan: Kamera uchun"
            />

            <TextField
              fullWidth
              type="number"
              label="Jami qarz *"
              name="amount"
              value={form.amount}
              onChange={changeForm}
            />

            <TextField
              fullWidth
              type="number"
              label="Boshlang'ich to'lov"
              name="paid"
              value={form.paid}
              onChange={changeForm}
            />

            <TextField
              select
              fullWidth
              label="Valyuta"
              name="currency"
              value={form.currency}
              onChange={changeForm}
            >
              <MenuItem value="UZS">
                UZS — so'm
              </MenuItem>

              <MenuItem value="USD">
                USD — dollar
              </MenuItem>
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Izoh"
              name="note"
              value={form.note}
              onChange={changeForm}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() =>
              setShowAdd(false)
            }
            disabled={saving}
          >
            Bekor qilish
          </Button>

          <Button
            variant="contained"
            onClick={addDebt}
            disabled={saving}
          >
            {saving
              ? "Saqlanmoqda..."
              : "Qarz qo'shish"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TO'LOV */}

      <Dialog
        open={showPayment}
        onClose={() =>
          !saving &&
          setShowPayment(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle
          sx={{ fontWeight: 800 }}
        >
          To'lov qilish
        </DialogTitle>

        <DialogContent>
          {selectedDebt && (
            <Stack
              spacing={2}
              mt={1}
            >
              <Card
                sx={{
                  background: "#f8fafc",
                  borderRadius: 2,
                }}
              >
                <CardContent>
                  <Typography
                    fontWeight={800}
                  >
                    {customerName(
                      selectedDebt
                    )}
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Jami:{" "}
                    {money(
                      selectedDebt.amount,
                      selectedDebt.currency
                    )}
                  </Typography>

                  <Typography
                    color="success.main"
                    fontWeight={700}
                  >
                    To'langan:{" "}
                    {money(
                      selectedDebt.paid,
                      selectedDebt.currency
                    )}
                  </Typography>

                  <Typography
                    color="error.main"
                    fontWeight={900}
                  >
                    Qoldiq:{" "}
                    {money(
                      selectedDebt.remaining ??
                        Number(
                          selectedDebt.amount
                        ) -
                          Number(
                            selectedDebt.paid
                          ),
                      selectedDebt.currency
                    )}
                  </Typography>
                </CardContent>
              </Card>

              <TextField
                fullWidth
                type="number"
                label="To'lov summasi *"
                value={
                  paymentForm.amount
                }
                onChange={(event) =>
                  setPaymentForm(
                    (old) => ({
                      ...old,
                      amount:
                        event.target.value,
                    })
                  )
                }
              />

              <TextField
                fullWidth
                multiline
                rows={3}
                label="Izoh"
                value={
                  paymentForm.note
                }
                onChange={(event) =>
                  setPaymentForm(
                    (old) => ({
                      ...old,
                      note:
                        event.target.value,
                    })
                  )
                }
              />
            </Stack>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() =>
              setShowPayment(false)
            }
            disabled={saving}
          >
            Bekor qilish
          </Button>

          <Button
            variant="contained"
            color="success"
            onClick={addPayment}
            disabled={saving}
            startIcon={<Payments />}
          >
            {saving
              ? "Saqlanmoqda..."
              : "To'lovni saqlash"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* TARIX */}

      <Dialog
        open={showHistory}
        onClose={() =>
          setShowHistory(false)
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle
          sx={{ fontWeight: 800 }}
        >
          To'lovlar tarixi
        </DialogTitle>

        <DialogContent>
          {selectedDebt && (
            <Typography
              fontWeight={700}
              mb={2}
            >
              {customerName(
                selectedDebt
              )}
            </Typography>
          )}

          {payments.length === 0 ? (
            <Box
              sx={{
                p: 5,
                textAlign: "center",
                background: "#f8fafc",
                borderRadius: 2,
              }}
            >
              <Typography
                color="text.secondary"
              >
                Hali to'lovlar mavjud emas
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                width: "100%",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse:
                    "collapse",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "#f8fafc",
                    }}
                  >
                    <th style={thStyle}>
                      ID
                    </th>

                    <th style={thStyle}>
                      Summa
                    </th>

                    <th style={thStyle}>
                      Izoh
                    </th>

                    <th style={thStyle}>
                      Sana
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {payments.map(
                    (payment) => (
                      <tr
                        key={
                          payment.id
                        }
                      >
                        <td
                          style={
                            tdStyle
                          }
                        >
                          #{payment.id}
                        </td>

                        <td
                          style={{
                            ...tdStyle,
                            color:
                              "#16a34a",
                            fontWeight:
                              800,
                          }}
                        >
                          {money(
                            payment.amount,
                            payment.currency ||
                              selectedDebt?.currency
                          )}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {payment.note ||
                            "-"}
                        </td>

                        <td
                          style={
                            tdStyle
                          }
                        >
                          {dateFormat(
                            payment.payment_date ||
                              payment.created_at
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() =>
              setShowHistory(false)
            }
          >
            Yopish
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

const thStyle = {
  padding: "14px 16px",
  textAlign: "left",
  fontSize: "13px",
  color: "#64748b",
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: "14px",
  whiteSpace: "nowrap",
};

export default Debts;