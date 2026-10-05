import { useEffect, useMemo, useState } from "react";
import API from "../api";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  Stack,
  Grid,
  Button,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

import {
  People,
  Inventory,
  Paid,
  TrendingUp,
  CreditCard,
  Money,
  Warning,
  ShoppingCart,
  Warehouse,
  ArrowUpward,
  ArrowDownward,
  Refresh,
  AccountBalanceWallet,
  Assessment,
  CheckCircle,
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

export default function Dashboard() {
  const [dashboard, setDashboard] = useState({
    customers: 0,
    products: 0,
    warehouse: 0,
    sales: [],
    last_sales: [],
    low_products: [],
    finance: {},
  });

  const [loading, setLoading] = useState(true);

  const money = (value) => {
    const number = Number(value ?? 0);

    if (!Number.isFinite(number)) {
      return "0";
    }

    return number.toLocaleString("uz-UZ");
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const [dashboardRes, financeRes] = await Promise.all([
        API.get("/dashboard/"),
        API.get("/finance/summary"),
      ]);

      const data = dashboardRes?.data || {};
      const financeData = financeRes?.data || {};

      setDashboard({
        customers: Number(data.customers ?? 0),
        products: Number(data.products ?? 0),
        warehouse: Number(data.warehouse ?? 0),
        sales: Array.isArray(data.sales) ? data.sales : [],
        last_sales: Array.isArray(data.last_sales)
          ? data.last_sales
          : [],
        low_products: Array.isArray(data.low_products)
          ? data.low_products
          : [],
        finance: financeData,
      });
    } catch (error) {
      console.error("Dashboard yuklashda xato:", error);

      setDashboard((prev) => ({
        ...prev,
        sales: [],
        last_sales: [],
        low_products: [],
        finance: {},
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const sales = dashboard.sales || [];
  const finance = dashboard.finance || {};

  const todaySales = useMemo(() => {
    const now = new Date();

    return sales.filter((item) => {
      if (!item?.date) return false;

      const date = new Date(item.date);

      if (Number.isNaN(date.getTime())) {
        return false;
      }

      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
  }, [sales]);

  const todayTotal = useMemo(() => {
    return todaySales.reduce(
      (sum, item) => sum + Number(item?.total ?? 0),
      0
    );
  }, [todaySales]);

  const todayProfit = useMemo(() => {
    return todaySales.reduce(
      (sum, item) => sum + Number(item?.profit ?? 0),
      0
    );
  }, [todaySales]);

  const totalProfit = useMemo(() => {
    return sales.reduce(
      (sum, item) => sum + Number(item?.profit ?? 0),
      0
    );
  }, [sales]);

  const cashSales = useMemo(() => {
    return sales
      .filter(
        (item) =>
          String(item?.payment_status || "").toLowerCase() ===
          "naqd"
      )
      .reduce(
        (sum, item) => sum + Number(item?.total ?? 0),
        0
      );
  }, [sales]);

  const cardSales = useMemo(() => {
    return sales
      .filter(
        (item) =>
          String(item?.payment_status || "").toLowerCase() ===
          "karta"
      )
      .reduce(
        (sum, item) => sum + Number(item?.total ?? 0),
        0
      );
  }, [sales]);

  const debtSales = useMemo(() => {
    return sales
      .filter(
        (item) =>
          String(item?.payment_status || "").toLowerCase() ===
          "qarz"
      )
      .reduce(
        (sum, item) => sum + Number(item?.total ?? 0),
        0
      );
  }, [sales]);

  const chartData = useMemo(() => {
    const grouped = {};

    sales.forEach((item) => {
      if (!item?.date) return;

      const date = new Date(item.date);

      if (Number.isNaN(date.getTime())) return;

      const key = date.toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
      });

      grouped[key] =
        (grouped[key] || 0) + Number(item?.total ?? 0);
    });

    return Object.entries(grouped)
      .slice(-7)
      .map(([day, value]) => ({
        day,
        sales: value,
      }));
  }, [sales]);

  const stats = [
    {
      title: "Mijozlar",
      value: money(dashboard.customers),
      description: "Jami mijozlar",
      icon: <People />,
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      title: "Mahsulotlar",
      value: money(dashboard.products),
      description: "Jami mahsulotlar",
      icon: <Inventory />,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      title: "Bugungi savdo",
      value: `${money(todayTotal)} so'm`,
      description: `${todaySales.length} ta savdo`,
      icon: <ShoppingCart />,
      color: "#0891b2",
      bg: "#ecfeff",
    },
    {
      title: "Bugungi foyda",
      value: `${money(todayProfit)} so'm`,
      description: "Bugungi sof foyda",
      icon: <TrendingUp />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      title: "Naqd pul",
      value: `${money(cashSales)} so'm`,
      description: "Naqd savdolar",
      icon: <Money />,
      color: "#059669",
      bg: "#ecfdf5",
    },
    {
      title: "Karta",
      value: `${money(cardSales)} so'm`,
      description: "Karta orqali",
      icon: <CreditCard />,
      color: "#4f46e5",
      bg: "#eef2ff",
    },
    {
      title: "Qarz",
      value: `${money(debtSales)} so'm`,
      description: "Qarzga berilgan",
      icon: <Warning />,
      color: "#dc2626",
      bg: "#fef2f2",
    },
    {
      title: "Jami foyda",
      value: `${money(totalProfit)} so'm`,
      description: "Umumiy foyda",
      icon: <Paid />,
      color: "#ca8a04",
      bg: "#fefce8",
    },
  ];

  const financeCards = [
    {
      title: "Jami daromad",
      value: finance.total_income_uzs,
      description: "Kirimlar",
      icon: <ArrowUpward />,
      color: "#16a34a",
      bg: "#ecfdf5",
    },
    {
      title: "Jami xarajat",
      value: finance.total_expense_uzs,
      description: "Chiqimlar",
      icon: <ArrowDownward />,
      color: "#dc2626",
      bg: "#fef2f2",
    },
    {
      title: "Sof balans",
      value: finance.net_balance_uzs,
      description: "Daromad - xarajat",
      icon: <AccountBalanceWallet />,
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      title: "Mendan qarzdor",
      value: finance.receivables_remaining,
      description: `${finance.receivables_count || 0} ta qarzdor`,
      icon: <CreditCard />,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
  ];

  const paymentData = [
    { name: "Naqd", value: cashSales },
    { name: "Karta", value: cardSales },
    { name: "Qarz", value: debtSales },
  ];

  const paymentColors = ["#2563eb", "#10b981", "#ef4444"];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1750,
        mx: "auto",
        pb: 6,
      }}
    >
      <Card
        sx={{
          position: "relative",
          overflow: "hidden",
          borderRadius: "26px",
          mb: 3,
          color: "#fff",
          background:
            "linear-gradient(135deg,#020617 0%,#0f172a 45%,#1d4ed8 100%)",
          boxShadow: "0 18px 45px rgba(15,23,42,.18)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(59,130,246,.18)",
            right: -120,
            top: -180,
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "rgba(14,165,233,.12)",
            right: 240,
            bottom: -160,
          }}
        />

        <CardContent
          sx={{
            position: "relative",
            zIndex: 2,
            p: { xs: 3, md: 4 },
            "&:last-child": {
              pb: { xs: 3, md: 4 },
            },
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", md: "center" }}
            spacing={3}
          >
            <Box>
              <Chip
                icon={<Assessment />}
                label="BOSHQARUV PANELI"
                size="small"
                sx={{
                  mb: 1.5,
                  color: "#dbeafe",
                  background: "rgba(255,255,255,.10)",
                  border: "1px solid rgba(255,255,255,.15)",
                  fontWeight: 800,
                  letterSpacing: ".5px",
                }}
              />

              <Typography
                sx={{
                  fontSize: { xs: 28, md: 40 },
                  fontWeight: 950,
                  letterSpacing: "-1.5px",
                }}
              >
                SAFE HOME SERVICES
              </Typography>

              <Typography
                sx={{
                  mt: 1,
                  color: "#bfdbfe",
                  fontSize: { xs: 13, md: 15 },
                  fontWeight: 500,
                }}
              >
                Biznesingizni bitta professional tizimdan boshqaring
              </Typography>
            </Box>

            <Button
              onClick={loadDashboard}
              disabled={loading}
              startIcon={<Refresh />}
              sx={{
                px: 2.5,
                py: 1.2,
                borderRadius: "13px",
                color: "#fff",
                textTransform: "none",
                fontWeight: 800,
                background: "rgba(255,255,255,.12)",
                border: "1px solid rgba(255,255,255,.18)",
                "&:hover": {
                  background: "rgba(255,255,255,.20)",
                },
              }}
            >
              Yangilash
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {loading && (
        <LinearProgress
          sx={{
            mb: 3,
            height: 4,
            borderRadius: 10,
          }}
        />
      )}

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {financeCards.map((item) => (
          <Grid key={item.title} size={{ xs: 12, sm: 6, lg: 3 }}>
            <Card
              sx={{
                height: "100%",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 7px 25px rgba(15,23,42,.055)",
                transition: ".25s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 14px 32px rgba(15,23,42,.10)",
                },
              }}
            >
              <CardContent sx={{ p: "21px !important" }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.8,
                        fontSize: { xs: 19, md: 22 },
                        fontWeight: 950,
                        color: "#0f172a",
                      }}
                    >
                      {money(item.value)} so'm
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.4,
                        color: "#94a3b8",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </Box>

                  <Avatar
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: "15px",
                      bgcolor: item.bg,
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        {stats.map((item) => (
          <Grid
            key={item.title}
            size={{ xs: 12, sm: 6, lg: 3 }}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: "20px",
                border: "1px solid #e2e8f0",
                boxShadow: "0 7px 25px rgba(15,23,42,.055)",
                transition: ".25s",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: "0 14px 32px rgba(15,23,42,.10)",
                },
              }}
            >
              <CardContent sx={{ p: "21px !important" }}>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.8,
                        color: "#0f172a",
                        fontSize: { xs: 20, md: 23 },
                        fontWeight: 950,
                        lineHeight: 1.25,
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>

                  <Avatar
                    sx={{
                      width: 47,
                      height: 47,
                      borderRadius: "14px",
                      bgcolor: item.bg,
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                </Stack>

                <Typography
                  sx={{
                    mt: 2,
                    color: item.color,
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  {item.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card
            sx={{
              borderRadius: "22px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 28px rgba(15,23,42,.06)",
            }}
          >
            <CardContent sx={{ p: "24px !important" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 19,
                      fontWeight: 950,
                      color: "#0f172a",
                    }}
                  >
                    Savdo dinamikasi
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: 12,
                      mt: 0.4,
                    }}
                  >
                    Oxirgi 7 kunlik savdo ko'rsatkichi
                  </Typography>
                </Box>

                <Chip
                  icon={<TrendingUp />}
                  label="Savdo"
                  sx={{
                    bgcolor: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: 800,
                  }}
                />
              </Stack>

              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient
                      id="salesGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#2563eb"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#2563eb"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    stroke="#e2e8f0"
                    strokeDasharray="3 3"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                  />

                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: 11,
                      fill: "#64748b",
                    }}
                  />

                  <Tooltip
                    formatter={(value) =>
                      `${money(value)} so'm`
                    }
                  />

                  <Area
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563eb"
                    strokeWidth={3}
                    fill="url(#salesGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: "22px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 28px rgba(15,23,42,.06)",
            }}
          >
            <CardContent sx={{ p: "24px !important" }}>
              <Typography
                sx={{
                  fontSize: 19,
                  fontWeight: 950,
                  color: "#0f172a",
                }}
              >
                To'lov turlari
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: 12,
                  mt: 0.4,
                }}
              >
                Savdolarning to'lov bo'yicha taqsimoti
              </Typography>

              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie
                    data={paymentData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={4}
                  >
                    {paymentData.map((item, index) => (
                      <Cell
                        key={item.name}
                        fill={paymentColors[index]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      `${money(value)} so'm`
                    }
                  />
                </PieChart>
              </ResponsiveContainer>

              <Stack spacing={1.3}>
                {paymentData.map((item, index) => (
                  <Stack
                    key={item.name}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 9,
                          height: 9,
                          borderRadius: "50%",
                          bgcolor: paymentColors[index],
                        }}
                      />

                      <Typography
                        sx={{
                          fontSize: 12,
                          color: "#475569",
                          fontWeight: 700,
                        }}
                      >
                        {item.name}
                      </Typography>
                    </Stack>

                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 900,
                      }}
                    >
                      {money(item.value)} so'm
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: "22px",
              color: "#fff",
              background:
                "linear-gradient(135deg,#020617,#1e3a8a)",
              boxShadow:
                "0 16px 38px rgba(30,58,138,.18)",
            }}
          >
            <CardContent sx={{ p: "27px !important" }}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    bgcolor: "rgba(255,255,255,.10)",
                    color: "#bfdbfe",
                  }}
                >
                  <Warehouse />
                </Avatar>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 950,
                    }}
                  >
                    Ombor holati
                  </Typography>

                  <Typography
                    sx={{
                      color: "#93c5fd",
                      fontSize: 11,
                    }}
                  >
                    Mavjud mahsulotlar
                  </Typography>
                </Box>
              </Stack>

              <Typography
                sx={{
                  mt: 3,
                  fontSize: 46,
                  fontWeight: 950,
                }}
              >
                {money(dashboard.warehouse)}
              </Typography>

              <Typography
                sx={{
                  color: "#bfdbfe",
                  fontSize: 12,
                }}
              >
                dona mahsulot mavjud
              </Typography>

              <Divider
                sx={{
                  my: 2.5,
                  borderColor: "rgba(255,255,255,.12)",
                }}
              />

              <Stack
                direction="row"
                justifyContent="space-between"
              >
                <Box>
                  <Typography
                    sx={{
                      color: "#93c5fd",
                      fontSize: 11,
                    }}
                  >
                    Mahsulot turi
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    {money(dashboard.products)}
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      color: "#93c5fd",
                      fontSize: 11,
                    }}
                  >
                    Kam qolgan
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 18,
                      fontWeight: 900,
                    }}
                  >
                    {dashboard.low_products.length}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            sx={{
              height: "100%",
              borderRadius: "22px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 8px 28px rgba(15,23,42,.06)",
            }}
          >
            <CardContent sx={{ p: "25px !important" }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <Avatar
                    sx={{
                      width: 46,
                      height: 46,
                      bgcolor: "#fef2f2",
                      color: "#dc2626",
                    }}
                  >
                    <Warning />
                  </Avatar>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: 18,
                        fontWeight: 950,
                      }}
                    >
                      Kam qolgan mahsulotlar
                    </Typography>

                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: 11,
                      }}
                    >
                      Omborni nazorat qiling
                    </Typography>
                  </Box>
                </Stack>

                <Chip
                  label={`${dashboard.low_products.length} ta`}
                  color="error"
                  variant="outlined"
                  sx={{ fontWeight: 800 }}
                />
              </Stack>

              {dashboard.low_products.length === 0 ? (
                <Box
                  sx={{
                    minHeight: 180,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Stack alignItems="center" spacing={1}>
                    <CheckCircle
                      sx={{
                        fontSize: 48,
                        color: "#16a34a",
                      }}
                    />

                    <Typography
                      sx={{
                        color: "#16a34a",
                        fontWeight: 900,
                      }}
                    >
                      Barcha mahsulotlar yetarli
                    </Typography>
                  </Stack>
                </Box>
              ) : (
                <List>
                  {dashboard.low_products
                    .slice(0, 5)
                    .map((item, index) => (
                      <Box key={item?.id ?? index}>
                        <ListItem sx={{ px: 0, py: 1.1 }}>
                          <Avatar
                            sx={{
                              mr: 1.5,
                              width: 38,
                              height: 38,
                              bgcolor: "#fef2f2",
                              color: "#dc2626",
                            }}
                          >
                            <Inventory sx={{ fontSize: 18 }} />
                          </Avatar>

                          <ListItemText
                            primary={
                              <Typography
                                sx={{
                                  fontWeight: 800,
                                  fontSize: 13,
                                }}
                              >
                                {item?.name || "Noma'lum mahsulot"}
                              </Typography>
                            }
                            secondary={`Qoldiq: ${
                              item?.quantity ?? 0
                            }`}
                          />

                          <Chip
                            label="Kam"
                            color="error"
                            size="small"
                            sx={{ fontWeight: 800 }}
                          />
                        </ListItem>

                        {index <
                          Math.min(
                            dashboard.low_products.length,
                            5
                          ) -
                            1 && <Divider />}
                      </Box>
                    ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card
        sx={{
          borderRadius: "22px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 28px rgba(15,23,42,.06)",
        }}
      >
        <CardContent sx={{ p: "25px !important" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
            mb={2}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Avatar
                sx={{
                  width: 46,
                  height: 46,
                  bgcolor: "#eff6ff",
                  color: "#2563eb",
                }}
              >
                <ShoppingCart />
              </Avatar>

              <Box>
                <Typography
                  sx={{
                    fontSize: 19,
                    fontWeight: 950,
                  }}
                >
                  So'nggi savdolar
                </Typography>

                <Typography
                  sx={{
                    color: "#64748b",
                    fontSize: 11,
                  }}
                >
                  Oxirgi amalga oshirilgan savdolar
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={`${dashboard.last_sales.length} ta savdo`}
              sx={{
                bgcolor: "#eff6ff",
                color: "#2563eb",
                fontWeight: 800,
              }}
            />
          </Stack>

          {dashboard.last_sales.length === 0 ? (
            <Box
              sx={{
                py: 5,
                textAlign: "center",
              }}
            >
              <ShoppingCart
                sx={{
                  fontSize: 48,
                  color: "#cbd5e1",
                  mb: 1,
                }}
              />

              <Typography
                sx={{
                  color: "#64748b",
                  fontWeight: 700,
                }}
              >
                Hozircha savdolar mavjud emas
              </Typography>
            </Box>
          ) : (
            <List>
              {dashboard.last_sales.map((item, index) => (
                <Box key={item?.id ?? index}>
                  <ListItem sx={{ px: 0, py: 1.4 }}>
                    <Avatar
                      sx={{
                        mr: 2,
                        width: 42,
                        height: 42,
                        bgcolor: "#eff6ff",
                        color: "#2563eb",
                      }}
                    >
                      <ShoppingCart />
                    </Avatar>

                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontWeight: 850,
                            fontSize: 13,
                          }}
                        >
                          {item?.customer || "Mijoz"}
                        </Typography>
                      }
                      secondary={
                        item?.date
                          ? new Date(
                              item.date
                            ).toLocaleString("uz-UZ")
                          : "-"
                      }
                    />

                    <Stack alignItems="flex-end">
                      <Typography
                        sx={{
                          fontWeight: 950,
                          color: "#0f172a",
                          fontSize: 13,
                        }}
                      >
                        {money(item?.total)} so'm
                      </Typography>

                      <Chip
                        size="small"
                        label={
                          item?.payment_status || "To'lov"
                        }
                        sx={{
                          mt: 0.4,
                          fontSize: 9,
                          fontWeight: 800,
                        }}
                      />
                    </Stack>
                  </ListItem>

                  {index !==
                    dashboard.last_sales.length - 1 && (
                    <Divider />
                  )}
                </Box>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}