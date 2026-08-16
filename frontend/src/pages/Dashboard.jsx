import { useEffect, useMemo, useState } from "react";
import API from "../api";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  Stack,
  Divider,
  LinearProgress,
  Grid,
  Button,
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
} from "@mui/icons-material";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function Dashboard() {
  const [dashboard, setDashboard] = useState({
    customers: 0,
    products: 0,
    warehouse: 0,
    sales: [],
    last_sales: [],
    low_products: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const res = await API.get("/dashboard/");

      setDashboard({
        customers: res.data.customers ?? 0,
        products: res.data.products ?? 0,
        warehouse: res.data.warehouse ?? 0,
        sales: res.data.sales ?? [],
        last_sales: res.data.last_sales ?? [],
        low_products: res.data.low_products ?? [],
      });
    } catch (error) {
      console.log("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const sales = dashboard.sales || [];

  const todaySales = useMemo(() => {
    return sales.filter((item) => {
      if (!item.date) return false;

      return (
        new Date(item.date).toDateString() ===
        new Date().toDateString()
      );
    });
  }, [sales]);

  const todayTotal = useMemo(() => {
    return todaySales.reduce(
      (sum, item) => sum + Number(item.total || 0),
      0
    );
  }, [todaySales]);

  const todayProfit = useMemo(() => {
    return todaySales.reduce(
      (sum, item) => sum + Number(item.profit || 0),
      0
    );
  }, [todaySales]);

  const totalProfit = useMemo(() => {
    return sales.reduce(
      (sum, item) => sum + Number(item.profit || 0),
      0
    );
  }, [sales]);

  const cashSales = useMemo(() => {
    return sales
      .filter((x) => x.payment_status === "Naqd")
      .reduce((sum, item) => sum + Number(item.total || 0), 0);
  }, [sales]);

  const cardSales = useMemo(() => {
    return sales
      .filter((x) => x.payment_status === "Karta")
      .reduce((sum, item) => sum + Number(item.total || 0), 0);
  }, [sales]);

  const debtSales = useMemo(() => {
    return sales
      .filter((x) => x.payment_status === "Qarz")
      .reduce((sum, item) => sum + Number(item.total || 0), 0);
  }, [sales]);

  const chartData = useMemo(() => {
    const data = {};

    sales.forEach((item) => {
      if (!item.date) return;

      const day = new Date(item.date).toLocaleDateString(
        "uz-UZ",
        {
          day: "2-digit",
          month: "2-digit",
        }
      );

      if (!data[day]) {
        data[day] = 0;
      }

      data[day] += Number(item.total || 0);
    });

    return Object.keys(data)
      .slice(-7)
      .map((day) => ({
        day,
        sales: data[day],
      }));
  }, [sales]);

  const paymentChart = [
    {
      name: "Naqd",
      value: cashSales,
    },
    {
      name: "Karta",
      value: cardSales,
    },
    {
      name: "Qarz",
      value: debtSales,
    },
  ];

  const COLORS = [
    "#2563eb",
    "#16a34a",
    "#dc2626",
  ];

  const cards = [
    {
      title: "Mijozlar",
      value: dashboard.customers.toLocaleString(),
      icon: <People />,
      color: "#2563eb",
      background: "#eff6ff",
    },
    {
      title: "Mahsulotlar",
      value: dashboard.products.toLocaleString(),
      icon: <Inventory />,
      color: "#7c3aed",
      background: "#f5f3ff",
    },
    {
      title: "Bugungi savdo",
      value:
        todayTotal.toLocaleString("uz-UZ") +
        " so'm",
      icon: <ShoppingCart />,
      color: "#0891b2",
      background: "#ecfeff",
    },
    {
      title: "Bugungi foyda",
      value:
        todayProfit.toLocaleString("uz-UZ") +
        " so'm",
      icon: <TrendingUp />,
      color: "#16a34a",
      background: "#f0fdf4",
    },
    {
      title: "Naqd",
      value:
        cashSales.toLocaleString("uz-UZ") +
        " so'm",
      icon: <Money />,
      color: "#059669",
      background: "#ecfdf5",
    },
    {
      title: "Karta",
      value:
        cardSales.toLocaleString("uz-UZ") +
        " so'm",
      icon: <CreditCard />,
      color: "#4f46e5",
      background: "#eef2ff",
    },
    {
      title: "Qarz",
      value:
        debtSales.toLocaleString("uz-UZ") +
        " so'm",
      icon: <Warning />,
      color: "#dc2626",
      background: "#fef2f2",
    },
    {
      title: "Jami foyda",
      value:
        totalProfit.toLocaleString("uz-UZ") +
        " so'm",
      icon: <Paid />,
      color: "#ca8a04",
      background: "#fefce8",
    },
  ];

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1600px",
        margin: "0 auto",
      }}
    >
      {/* PREMIUM HEADER */}

      <Box
        sx={{
          background:
            "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)",
          borderRadius: "24px",
          padding: {
            xs: "22px",
            md: "30px",
          },
          color: "white",
          marginBottom: "25px",
          boxShadow:
            "0 15px 35px rgba(15,23,42,0.18)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            width: "220px",
            height: "220px",
            borderRadius: "50%",
            background:
              "rgba(255,255,255,0.06)",
            right: "-70px",
            top: "-90px",
          }}
        />

        <Box
          sx={{
            position: "absolute",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background:
              "rgba(56,189,248,0.10)",
            right: "120px",
            bottom: "-90px",
          }}
        />

        <Stack
          direction={{
            xs: "column",
            md: "row",
          }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            md: "center",
          }}
          spacing={2}
          sx={{
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: "25px",
                  md: "32px",
                },
                fontWeight: 800,
                letterSpacing: "-0.5px",
              }}
            >
              SAFE HOME SERVICES ERP
            </Typography>

            <Typography
              sx={{
                mt: 0.7,
                color: "#bfdbfe",
                fontSize: "15px",
              }}
            >
              Biznesingizni bitta joydan
              boshqaring
            </Typography>
          </Box>

          <Button
            onClick={loadDashboard}
            startIcon={<Refresh />}
            variant="contained"
            sx={{
              background:
                "rgba(255,255,255,0.12)",
              backdropFilter: "blur(10px)",
              border:
                "1px solid rgba(255,255,255,0.15)",
              color: "white",
              borderRadius: "12px",
              padding: "10px 18px",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": {
                background:
                  "rgba(255,255,255,0.20)",
              },
            }}
          >
            Yangilash
          </Button>
        </Stack>
      </Box>

      {loading && (
        <LinearProgress
          sx={{
            mb: 3,
            borderRadius: 5,
          }}
        />
      )}

      {/* STATISTICS */}

      <Grid
        container
        spacing={2.5}
      >
        {cards.map((item) => (
          <Grid
            key={item.title}
            size={{
              xs: 12,
              sm: 6,
              md: 3,
            }}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: "20px",
                border:
                  "1px solid rgba(148,163,184,0.15)",
                boxShadow:
                  "0 8px 25px rgba(15,23,42,0.06)",
                transition:
                  "all 0.25s ease",
                "&:hover": {
                  transform:
                    "translateY(-4px)",
                  boxShadow:
                    "0 14px 30px rgba(15,23,42,0.11)",
                },
              }}
            >
              <CardContent
                sx={{
                  padding: "21px !important",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box>
                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: {
                          xs: "22px",
                          md: "25px",
                        },
                        fontWeight: 800,
                        color: "#0f172a",
                      }}
                    >
                      {item.value}
                    </Typography>
                  </Box>

                  <Avatar
                    sx={{
                      width: 48,
                      height: 48,
                      background:
                        item.background,
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </Avatar>
                </Stack>

                <Stack
                  direction="row"
                  spacing={0.5}
                  alignItems="center"
                  sx={{
                    mt: 2,
                    color:
                      item.title === "Qarz"
                        ? "#dc2626"
                        : "#16a34a",
                  }}
                >
                  {item.title === "Qarz" ? (
                    <ArrowDownward
                      sx={{ fontSize: 16 }}
                    />
                  ) : (
                    <ArrowUpward
                      sx={{ fontSize: 16 }}
                    />
                  )}

                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    Moliyaviy ko'rsatkich
                  </Typography>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* CHARTS */}

      <Grid
        container
        spacing={2.5}
        sx={{ mt: 0.5 }}
      >
        <Grid
          size={{
            xs: 12,
            md: 8,
          }}
        >
          <Card
            sx={{
              borderRadius: "20px",
              boxShadow:
                "0 8px 25px rgba(15,23,42,0.06)",
              border:
                "1px solid rgba(148,163,184,0.15)",
            }}
          >
            <CardContent
              sx={{ padding: "24px !important" }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#0f172a",
                    }}
                  >
                    Savdo dinamikasi
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: "13px",
                      mt: 0.4,
                    }}
                  >
                    Oxirgi 7 kun
                  </Typography>
                </Box>

                <Chip
                  icon={<TrendingUp />}
                  label="Savdo"
                  sx={{
                    background: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: 700,
                  }}
                />
              </Stack>

              <ResponsiveContainer
                width="100%"
                height={320}
              >
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#e2e8f0"
                  />

                  <XAxis
                    dataKey="day"
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <YAxis
                    tick={{
                      fontSize: 12,
                    }}
                  />

                  <Tooltip
                    formatter={(value) =>
                      Number(value).toLocaleString(
                        "uz-UZ"
                      ) + " so'm"
                    }
                  />

                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#2563eb"
                    strokeWidth={4}
                    dot={{
                      r: 5,
                    }}
                    activeDot={{
                      r: 7,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <Card
            sx={{
              borderRadius: "20px",
              boxShadow:
                "0 8px 25px rgba(15,23,42,0.06)",
              border:
                "1px solid rgba(148,163,184,0.15)",
              height: "100%",
            }}
          >
            <CardContent
              sx={{ padding: "24px !important" }}
            >
              <Typography
                sx={{
                  fontSize: "18px",
                  fontWeight: 800,
                  color: "#0f172a",
                }}
              >
                To'lov turlari
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "13px",
                  mt: 0.5,
                }}
              >
                Savdolarning taqsimoti
              </Typography>

              <ResponsiveContainer
                width="100%"
                height={270}
              >
                <PieChart>
                  <Pie
                    data={paymentChart}
                    dataKey="value"
                    outerRadius={90}
                    innerRadius={55}
                    paddingAngle={4}
                  >
                    {paymentChart.map(
                      (item, index) => (
                        <Cell
                          key={item.name}
                          fill={COLORS[index]}
                        />
                      )
                    )}
                  </Pie>

                  <Tooltip
                    formatter={(value) =>
                      Number(value).toLocaleString(
                        "uz-UZ"
                      ) + " so'm"
                    }
                  />
                </PieChart>
              </ResponsiveContainer>

              <Stack spacing={1}>
                {paymentChart.map(
                  (item, index) => (
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
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            background:
                              COLORS[index],
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: "13px",
                            color: "#475569",
                          }}
                        >
                          {item.name}
                        </Typography>
                      </Stack>

                      <Typography
                        sx={{
                          fontSize: "13px",
                          fontWeight: 700,
                        }}
                      >
                        {Number(
                          item.value
                        ).toLocaleString(
                          "uz-UZ"
                        )}{" "}
                        so'm
                      </Typography>
                    </Stack>
                  )
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* WAREHOUSE + LOW STOCK */}

      <Grid
        container
        spacing={2.5}
        sx={{ mt: 0.5 }}
      >
        <Grid
          size={{
            xs: 12,
            md: 5,
          }}
        >
          <Card
            sx={{
              borderRadius: "20px",
              boxShadow:
                "0 8px 25px rgba(15,23,42,0.06)",
              border:
                "1px solid rgba(148,163,184,0.15)",
              height: "100%",
            }}
          >
            <CardContent
              sx={{
                padding: "25px !important",
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Avatar
                  sx={{
                    width: 52,
                    height: 52,
                    background: "#eff6ff",
                    color: "#2563eb",
                  }}
                >
                  <Warehouse />
                </Avatar>

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: "18px",
                    }}
                  >
                    Ombor holati
                  </Typography>

                  <Typography
                    sx={{
                      color: "#64748b",
                      fontSize: "13px",
                    }}
                  >
                    Jami mavjud mahsulot
                  </Typography>
                </Box>
              </Stack>

              <Typography
                sx={{
                  fontSize: "42px",
                  fontWeight: 900,
                  mt: 3,
                  color: "#0f172a",
                }}
              >
                {Number(
                  dashboard.warehouse
                ).toLocaleString()}
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                dona mahsulot mavjud
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 7,
          }}
        >
          <Card
            sx={{
              borderRadius: "20px",
              boxShadow:
                "0 8px 25px rgba(15,23,42,0.06)",
              border:
                "1px solid rgba(148,163,184,0.15)",
            }}
          >
            <CardContent
              sx={{
                padding: "25px !important",
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                mb={1}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <Avatar
                    sx={{
                      width: 42,
                      height: 42,
                      background: "#fef2f2",
                      color: "#dc2626",
                    }}
                  >
                    <Warning />
                  </Avatar>

                  <Box>
                    <Typography
                      sx={{
                        fontWeight: 800,
                        fontSize: "18px",
                      }}
                    >
                      Kam qolgan mahsulotlar
                    </Typography>

                    <Typography
                      sx={{
                        color: "#64748b",
                        fontSize: "12px",
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
                />
              </Stack>

              {dashboard.low_products.length ===
              0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    padding: "25px",
                    color: "#16a34a",
                  }}
                >
                  <Typography
                    fontWeight="bold"
                  >
                    ✓ Barcha mahsulotlar yetarli
                  </Typography>
                </Box>
              ) : (
                <List>
                  {dashboard.low_products
                    .slice(0, 5)
                    .map((item) => (
                      <Box key={item.id}>
                        <ListItem
                          sx={{
                            px: 0,
                          }}
                        >
                          <ListItemText
                            primary={
                              <Typography
                                fontWeight={700}
                              >
                                {item.name}
                              </Typography>
                            }
                            secondary={`Qoldiq: ${item.quantity} dona`}
                          />

                          <Chip
                            label="Kam"
                            color="error"
                            size="small"
                          />
                        </ListItem>

                        <Divider />
                      </Box>
                    ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* LAST SALES */}

      <Card
        sx={{
          mt: 2.5,
          borderRadius: "20px",
          boxShadow:
            "0 8px 25px rgba(15,23,42,0.06)",
          border:
            "1px solid rgba(148,163,184,0.15)",
        }}
      >
        <CardContent
          sx={{
            padding: "25px !important",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "19px",
                  fontWeight: 800,
                }}
              >
                So'nggi savdolar
              </Typography>

              <Typography
                sx={{
                  color: "#64748b",
                  fontSize: "13px",
                  mt: 0.4,
                }}
              >
                Oxirgi amalga oshirilgan savdolar
              </Typography>
            </Box>

            <Chip
              icon={<ShoppingCart />}
              label={`${dashboard.last_sales.length} ta`}
              sx={{
                background: "#eff6ff",
                color: "#2563eb",
                fontWeight: 700,
              }}
            />
          </Stack>

          {dashboard.last_sales.length === 0 ? (
            <Box
              sx={{
                padding: "35px",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              Hozircha savdolar mavjud emas
            </Box>
          ) : (
            <List>
              {dashboard.last_sales.map(
                (item, index) => (
                  <Box key={item.id}>
                    <ListItem
                      sx={{
                        px: 0,
                        py: 1.5,
                      }}
                    >
                      <Avatar
                        sx={{
                          mr: 2,
                          background:
                            "#eff6ff",
                          color: "#2563eb",
                        }}
                      >
                        <ShoppingCart />
                      </Avatar>

                      <ListItemText
                        primary={
                          <Typography
                            fontWeight={700}
                          >
                            {item.customer ||
                              "Mijoz"}
                          </Typography>
                        }
                        secondary={
                          item.date || "-"
                        }
                      />

                      <Typography
                        sx={{
                          fontWeight: 800,
                          color: "#0f172a",
                        }}
                      >
                        {Number(
                          item.total || 0
                        ).toLocaleString(
                          "uz-UZ"
                        )}{" "}
                        so'm
                      </Typography>
                    </ListItem>

                    {index !==
                      dashboard.last_sales
                        .length -
                        1 && <Divider />}
                  </Box>
                )
              )}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default Dashboard;