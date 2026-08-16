import { useEffect, useMemo, useState } from "react";
import API from "../api";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Stack,
  Paper,
  LinearProgress,
  Divider,
  Tabs,
  Tab,
} from "@mui/material";

import {
  Warehouse as WarehouseIcon,
  Inventory,
  Warning,
  CheckCircle,
  Search,
  TrendingUp,
  AttachMoney,
  ArrowDownward,
  ArrowUpward,
  History,
} from "@mui/icons-material";

import { DataGrid } from "@mui/x-data-grid";

export default function Warehouse() {
  const [products, setProducts] = useState([]);
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [historySearch, setHistorySearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [tab, setTab] = useState(0);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const res = await API.get("/products/");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Warehouse products error:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);
      const res = await API.get("/warehouse/history");
      setHistory(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Warehouse history error:", error);
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    loadHistory();
  }, []);

  const getUnit = (product) =>
    product?.unit ||
    product?.measurement_unit ||
    product?.unit_name ||
    "dona";

  const getQuantity = (product) =>
    Number(product?.quantity || 0);

  const formatMoney = (value) =>
    `${Number(value || 0).toLocaleString("uz-UZ")} so'm`;

  const formatDate = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return value;

    return date.toLocaleString("uz-UZ");
  };

  const totalProducts = products.length;

  const totalQuantity = products.reduce(
    (sum, product) => sum + getQuantity(product),
    0
  );

  const lowProducts = products.filter(
    (product) =>
      getQuantity(product) > 0 &&
      getQuantity(product) <= 5
  );

  const emptyProducts = products.filter(
    (product) => getQuantity(product) <= 0
  );

  const availableProducts = products.filter(
    (product) => getQuantity(product) > 5
  );

  const totalInventoryValue = products.reduce(
    (sum, product) =>
      sum +
      getQuantity(product) *
        Number(product?.purchase_price || 0),
    0
  );

  const totalIn = history
    .filter((item) => {
      const action = String(item.action || "").toUpperCase();

      return action === "IN" || action === "KIRIM";
    })
    .reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

  const totalOut = history
    .filter((item) => {
      const action = String(item.action || "").toUpperCase();

      return action === "OUT" || action === "CHIQIM";
    })
    .reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );

  const filteredProducts = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return products;

    return products.filter((product) => {
      const text = `
        ${product?.name || ""}
        ${product?.brand || ""}
        ${product?.model || ""}
        ${product?.category || ""}
        ${product?.serial_number || ""}
      `.toLowerCase();

      return text.includes(q);
    });
  }, [products, search]);

  const filteredHistory = useMemo(() => {
    const q = historySearch.toLowerCase().trim();

    if (!q) return history;

    return history.filter((item) => {
      const text = `
        ${item?.product_name || ""}
        ${item?.action || ""}
        ${item?.unit || ""}
        ${item?.product_id || ""}
      `.toLowerCase();

      return text.includes(q);
    });
  }, [history, historySearch]);

  const getStatus = (quantity) => {
    if (quantity <= 0) {
      return (
        <Chip
          label="Tugagan"
          color="error"
          size="small"
          icon={<Warning />}
        />
      );
    }

    if (quantity <= 5) {
      return (
        <Chip
          label="Kam"
          color="warning"
          size="small"
          icon={<Warning />}
        />
      );
    }

    return (
      <Chip
        label="Mavjud"
        color="success"
        size="small"
        icon={<CheckCircle />}
      />
    );
  };

  const productColumns = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "name",
      headerName: "Mahsulot",
      flex: 1.2,
      minWidth: 180,
    },
    {
      field: "brand",
      headerName: "Brend",
      width: 120,
    },
    {
      field: "model",
      headerName: "Model",
      flex: 1,
      minWidth: 160,
    },
    {
      field: "category",
      headerName: "Kategoriya",
      width: 140,
    },
    {
      field: "quantity",
      headerName: "Qoldiq",
      width: 130,
      renderCell: (params) => {
        const quantity = getQuantity(params.row);

        return (
          <Typography
            fontWeight={700}
            color={
              quantity <= 0
                ? "error.main"
                : quantity <= 5
                ? "warning.main"
                : "success.main"
            }
          >
            {quantity} {getUnit(params.row)}
          </Typography>
        );
      },
    },
    {
      field: "purchase_price",
      headerName: "Kirim narxi",
      width: 150,
      renderCell: (params) =>
        formatMoney(params.value),
    },
    {
      field: "sale_price",
      headerName: "Sotuv narxi",
      width: 150,
      renderCell: (params) =>
        formatMoney(params.value),
    },
    {
      field: "status",
      headerName: "Holat",
      width: 130,
      sortable: false,
      renderCell: (params) =>
        getStatus(getQuantity(params.row)),
    },
  ];

  const historyColumns = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "product_id",
      headerName: "Mahsulot ID",
      width: 110,
    },
    {
      field: "product_name",
      headerName: "Mahsulot",
      flex: 1.5,
      minWidth: 220,
    },
    {
      field: "action",
      headerName: "Amal",
      width: 130,
      renderCell: (params) => {
        const action = String(
          params.value || ""
        ).toUpperCase();

        const isIn =
          action === "IN" ||
          action === "KIRIM";

        return (
          <Chip
            icon={
              isIn ? (
                <ArrowDownward />
              ) : (
                <ArrowUpward />
              )
            }
            label={isIn ? "KIRIM" : "CHIQIM"}
            color={isIn ? "success" : "error"}
            size="small"
          />
        );
      },
    },
    {
      field: "quantity",
      headerName: "Miqdor",
      width: 130,
      renderCell: (params) => (
        <Typography fontWeight={700}>
          {Number(params.value || 0).toLocaleString(
            "uz-UZ"
          )}{" "}
          {params.row?.unit || "dona"}
        </Typography>
      ),
    },
    {
      field: "unit",
      headerName: "Birlik",
      width: 100,
    },
    {
      field: "date",
      headerName: "Sana",
      flex: 1,
      minWidth: 190,
      renderCell: (params) =>
        formatDate(params.value),
    },
  ];

  const statCards = [
    {
      title: "Jami mahsulot",
      value: totalProducts.toLocaleString("uz-UZ"),
      icon: <Inventory />,
      subtitle: "Mahsulot turlari",
      color: "#2563eb",
      background:
        "linear-gradient(135deg,#eff6ff,#dbeafe)",
    },
    {
      title: "Jami qoldiq",
      value: totalQuantity.toLocaleString("uz-UZ"),
      icon: <WarehouseIcon />,
      subtitle: "Ombordagi birliklar",
      color: "#7c3aed",
      background:
        "linear-gradient(135deg,#f5f3ff,#ede9fe)",
    },
    {
      title: "Kam qolgan",
      value: lowProducts.length,
      icon: <Warning />,
      subtitle: "5 yoki undan kam",
      color: "#d97706",
      background:
        "linear-gradient(135deg,#fffbeb,#fef3c7)",
    },
    {
      title: "Tugagan",
      value: emptyProducts.length,
      icon: <TrendingUp />,
      subtitle: "Qayta xarid kerak",
      color: "#dc2626",
      background:
        "linear-gradient(135deg,#fef2f2,#fee2e2)",
    },
  ];

  return (
    <Box sx={{ minHeight: "100%", pb: 4 }}>
      <Box
        sx={{
          mb: 3,
          p: 3,
          borderRadius: 4,
          background:
            "linear-gradient(135deg,#0f172a,#1e3a8a)",
          color: "white",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{
            xs: "flex-start",
            sm: "center",
          }}
          spacing={2}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background:
                  "rgba(255,255,255,0.14)",
              }}
            >
              <WarehouseIcon />
            </Box>

            <Box>
              <Typography
                variant="h4"
                fontWeight={800}
              >
                Ombor
              </Typography>

              <Typography sx={{ opacity: 0.75 }}>
                SAFE HOME SERVICES ERP
              </Typography>
            </Box>
          </Stack>

          <Chip
            icon={<CheckCircle />}
            label={`${availableProducts.length} ta mahsulot mavjud`}
            sx={{
              color: "white",
              background:
                "rgba(255,255,255,0.12)",
            }}
          />
        </Stack>
      </Box>

      <Grid
        container
        spacing={2.5}
        mb={3}
      >
        {statCards.map((item) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
            key={item.title}
          >
            <Card
              sx={{
                height: "100%",
                borderRadius: 4,
                background: item.background,
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
                      fontWeight={600}
                    >
                      {item.title}
                    </Typography>

                    <Typography
                      variant="h4"
                      fontWeight={800}
                      sx={{
                        mt: 1,
                        color: item.color,
                      }}
                    >
                      {item.value}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {item.subtitle}
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: item.color,
                    }}
                  >
                    {item.icon}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card
        sx={{
          mb: 3,
          borderRadius: 4,
          background:
            "linear-gradient(135deg,#ecfdf5,#f0fdf4)",
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <AttachMoney color="success" />

            <Box>
              <Typography
                color="text.secondary"
                fontWeight={600}
              >
                Ombordagi mahsulotlarning kirim qiymati
              </Typography>

              <Typography
                variant="h5"
                fontWeight={800}
                color="success.main"
              >
                {formatMoney(totalInventoryValue)}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Grid
        container
        spacing={2}
        mb={3}
      >
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              background:
                "linear-gradient(135deg,#ecfdf5,#dcfce7)",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <ArrowDownward color="success" />

                <Box>
                  <Typography
                    color="text.secondary"
                    fontWeight={600}
                  >
                    Jami kirim
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="success.main"
                  >
                    {totalIn.toLocaleString("uz-UZ")}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              background:
                "linear-gradient(135deg,#fef2f2,#fee2e2)",
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <ArrowUpward color="error" />

                <Box>
                  <Typography
                    color="text.secondary"
                    fontWeight={600}
                  >
                    Jami chiqim
                  </Typography>

                  <Typography
                    variant="h5"
                    fontWeight={800}
                    color="error.main"
                  >
                    {totalOut.toLocaleString("uz-UZ")}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper
        sx={{
          mb: 2,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Tabs
          value={tab}
          onChange={(event, newValue) =>
            setTab(newValue)
          }
          variant="fullWidth"
        >
          <Tab
            icon={<Inventory />}
            iconPosition="start"
            label="Mahsulotlar"
          />

          <Tab
            icon={<History />}
            iconPosition="start"
            label={`Kirim / Chiqim tarixi (${history.length})`}
          />
        </Tabs>
      </Paper>

      {tab === 0 && (
        <>
          <Paper
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 4,
            }}
          >
            <TextField
              fullWidth
              placeholder="Mahsulot, brend, model yoki kategoriya bo'yicha qidirish..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          <Paper
            sx={{
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Ombor mahsulotlari
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Barcha mavjud mahsulotlar va qoldiqlar
              </Typography>
            </Box>

            <Divider />

            {loading && <LinearProgress />}

            <DataGrid
              rows={filteredProducts}
              columns={productColumns}
              loading={loading}
              getRowId={(row) => row.id}
              autoHeight
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                    page: 0,
                  },
                },
              }}
              disableRowSelectionOnClick
              localeText={{
                noRowsLabel:
                  "Mahsulot topilmadi",
              }}
              sx={{ border: 0 }}
            />
          </Paper>
        </>
      )}

      {tab === 1 && (
        <>
          <Paper
            sx={{
              p: 2,
              mb: 2,
              borderRadius: 4,
            }}
          >
            <TextField
              fullWidth
              placeholder="Mahsulot yoki amal bo'yicha qidirish..."
              value={historySearch}
              onChange={(e) =>
                setHistorySearch(e.target.value)
              }
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="primary" />
                  </InputAdornment>
                ),
              }}
            />
          </Paper>

          <Paper
            sx={{
              borderRadius: 4,
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: 2 }}>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Ombor tarixi
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Mahsulotlarning kirim va chiqim harakatlari
              </Typography>
            </Box>

            <Divider />

            {historyLoading && (
              <LinearProgress />
            )}

            <DataGrid
              rows={filteredHistory}
              columns={historyColumns}
              loading={historyLoading}
              getRowId={(row) => row.id}
              autoHeight
              pageSizeOptions={[10, 25, 50, 100]}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: 10,
                    page: 0,
                  },
                },
              }}
              disableRowSelectionOnClick
              localeText={{
                noRowsLabel:
                  "Ombor tarixi mavjud emas",
              }}
              sx={{ border: 0 }}
            />
          </Paper>
        </>
      )}
    </Box>
  );
}