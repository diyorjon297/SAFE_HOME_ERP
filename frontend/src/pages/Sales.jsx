import { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import API from "../api";

import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
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

import { DataGrid } from "@mui/x-data-grid";

import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PaymentsIcon from "@mui/icons-material/Payments";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MoneyOffIcon from "@mui/icons-material/MoneyOff";

function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [search, setSearch] = useState("");

  const [customerId, setCustomerId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("Naqd");

  const [items, setItems] = useState([
    {
      id: Date.now(),
      item_type: "product",
      product_id: "",
      service_id: "",
      quantity: 1,
      price: "",
    },
  ]);

  const [customerDialogOpen, setCustomerDialogOpen] =
    useState(false);

  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    object: "",
    debt: 0,
  });

  const [customerSaving, setCustomerSaving] =
    useState(false);

  useEffect(() => {
    loadSales();
    loadProducts();
    loadServices();
    loadCustomers();
  }, []);

  const loadSales = async () => {
    try {
      const res = await API.get("/sales/");
      setSales(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Sales yuklash xatosi:", err);
      setSales([]);
    }
  };

  const loadProducts = async () => {
    try {
      const res = await API.get("/products/");
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Products yuklash xatosi:", err);
      setProducts([]);
    }
  };

  const loadServices = async () => {
    try {
      const res = await API.get("/services/");
      setServices(
        Array.isArray(res.data) ? res.data : []
      );
    } catch (err) {
      console.log("Services yuklash xatosi:", err);
      setServices([]);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await API.get("/customers/");
      setCustomers(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("Customers yuklash xatosi:", err);
      setCustomers([]);
    }
  };

  const getUnit = (product) =>
    product?.unit ||
    product?.measurement_unit ||
    product?.unit_name ||
    "dona";

  const getProduct = (productId) =>
    products.find(
      (product) =>
        Number(product.id) === Number(productId)
    );

  const money = (value) =>
    Number(value || 0).toLocaleString("uz-UZ");

  const openCustomerDialog = () => {
    setNewCustomer({
      name: "",
      phone: "",
      address: "",
      object: "",
      debt: 0,
    });

    setCustomerDialogOpen(true);
  };

  const closeCustomerDialog = () => {
    if (!customerSaving) {
      setCustomerDialogOpen(false);
    }
  };

  const handleCustomerChange = (e) => {
    setNewCustomer((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const saveNewCustomer = async () => {
    if (!newCustomer.name.trim()) {
      alert("Mijoz nomini kiriting");
      return;
    }

    try {
      setCustomerSaving(true);

      const payload = {
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        address: newCustomer.address.trim(),
        object: newCustomer.object.trim(),
        debt: 0,
      };

      const res = await API.post(
        "/customers/",
        payload
      );

      await loadCustomers();

      if (res.data?.id) {
        setCustomerId(res.data.id);
      }

      setCustomerDialogOpen(false);

      alert("Yangi mijoz muvaffaqiyatli qo'shildi");
    } catch (err) {
      console.log(err);

      const detail = err.response?.data?.detail;

      alert(
        typeof detail === "string"
          ? detail
          : "Mijozni saqlashda xatolik"
      );
    } finally {
      setCustomerSaving(false);
    }
  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        item_type: "product",
        product_id: "",
        service_id: "",
        quantity: 1,
        price: "",
      },
    ]);
  };

  const removeItem = (itemId) => {
    setItems((prev) => {
      if (prev.length === 1) return prev;

      return prev.filter(
        (item) => item.id !== itemId
      );
    });
  };

  const getService = (serviceId) =>
    services.find(
      (service) =>
        Number(service.id) === Number(serviceId)
    );

  const changeItemType = (itemId, type) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              item_type: type,
              product_id: "",
              service_id: "",
              quantity: 1,
              price: "",
            }
          : item
      )
    );
  };

  const selectService = (itemId, serviceId) => {
    const service = getService(serviceId);

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              item_type: "service",
              service_id: serviceId,
              product_id: "",
              quantity: 1,
              price: service?.sale_price ?? "",
            }
          : item
      )
    );
  };

  const selectProduct = (itemId, productId) => {
    const product = getProduct(productId);

    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              item_type: "product",
              product_id: productId,
              service_id: "",
              quantity: 1,
              price: product?.sale_price ?? "",
            }
          : item
      )
    );
  };

  const changeQuantity = (itemId, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: value,
            }
          : item
      )
    );
  };

  const changePrice = (itemId, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              price: value,
            }
          : item
      )
    );
  };

  const getLineTotal = (item) => {
    return (
      (Number(item.quantity) || 0) *
      (Number(item.price) || 0)
    );
  };

  const grandTotal = items.reduce(
    (sum, item) =>
      sum + getLineTotal(item),
    0
  );

  const estimatedProfit = items.reduce(
    (sum, item) => {
      const quantity =
        Number(item.quantity) || 0;

      const salePrice =
        Number(item.price) || 0;

      if (item.item_type === "service") {
        const service = getService(item.service_id);

        const costPrice =
          Number(
            service?.purchase_price ??
            service?.cost_price ??
            0
          );

        return (
          sum +
          (salePrice - costPrice) *
            quantity
        );
      }

      const product =
        getProduct(item.product_id);

      const purchasePrice =
        Number(product?.purchase_price) || 0;

      return (
        sum +
        (salePrice - purchasePrice) *
          quantity
      );
    },
    0
  );

  const totalSales = sales.reduce(
    (sum, item) =>
      sum + Number(item.total || 0),
    0
  );

  const totalProfit = sales.reduce(
    (sum, item) =>
      sum + Number(item.profit || 0),
    0
  );

  const totalDebt = sales
    .filter(
      (item) =>
        item.payment_status === "Qarz"
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.total || 0),
      0
    );

  const cashSales = sales
    .filter(
      (item) =>
        item.payment_status === "Naqd"
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.total || 0),
      0
    );

  const cardSales = sales
    .filter(
      (item) =>
        item.payment_status === "Karta"
    )
    .reduce(
      (sum, item) =>
        sum + Number(item.total || 0),
      0
    );

  const filteredSales = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return sales;

    return sales.filter((sale) =>
      JSON.stringify(sale)
        .toLowerCase()
        .includes(q)
    );
  }, [sales, search]);

  const resetForm = () => {
    setCustomerId("");
    setPaymentStatus("Naqd");

    setItems([
      {
        id: Date.now() + Math.random(),
        item_type: "product",
        product_id: "",
        service_id: "",
        quantity: 1,
        price: "",
      },
    ]);
  };

  const saveBundleSale = async () => {
    if (!customerId) {
      alert("Mijozni tanlang");
      return;
    }

    const validItems = items.filter(
      (item) =>
        (
          item.item_type === "service"
            ? item.service_id
            : item.product_id
        ) &&
        Number(item.quantity) > 0
    );

    if (!validItems.length) {
      alert("Kamida bitta mahsulot yoki xizmat qo'shing");
      return;
    }

    for (const item of validItems) {
      const quantity =
        Number(item.quantity) || 0;

      const price =
        Number(item.price);

      if (!Number.isFinite(price) || price < 0) {
        alert("Narxni tekshiring");
        return;
      }

      if (item.item_type === "service") {
        const service = getService(item.service_id);

        if (!service) {
          alert("Xizmat topilmadi");
          return;
        }

        continue;
      }

      const product =
        getProduct(item.product_id);

      if (!product) {
        alert("Mahsulot topilmadi");
        return;
      }

      const available =
        Number(product.quantity) || 0;

      if (quantity > available) {
        alert(
          `${product.name} uchun omborda yetarli mahsulot yo'q.\n\n` +
          `Mavjud: ${available} ${getUnit(product)}\n` +
          `Kerak: ${quantity} ${getUnit(product)}`
        );
        return;
      }
    }

    try {
      const payload = {
        customer_id: Number(customerId),
        payment_status: paymentStatus,

        items: validItems.map((item) => ({
          item_type:
            item.item_type || "product",

          product_id:
            item.item_type === "service"
              ? null
              : Number(item.product_id),

          service_id:
            item.item_type === "service"
              ? Number(item.service_id)
              : null,

          quantity:
            Number(item.quantity),

          price:
            Number(item.price),
        })),
      };

      console.log("SALES PAYLOAD:", payload);

      const res = await API.post(
        "/sales/batch",
        payload
      );

      alert(
        `Sotuv muvaffaqiyatli saqlandi!\n\n` +
        `Jami: ${money(
          res.data.total || grandTotal
        )} so'm`
      );

      resetForm();

      await loadSales();
      await loadProducts();
      await loadCustomers();
      await loadServices();

    } catch (err) {
      console.log(err);

      const detail =
        err.response?.data?.detail;

      alert(
        typeof detail === "string"
          ? detail
          : "Sotuvni saqlashda xatolik"
      );
    }
  };


  // =========================
  // EXCEL EXPORT
  // =========================

  const exportSalesExcel = () => {

    if (!sales.length) {
      alert("Eksport qilish uchun sotuvlar mavjud emas");
      return;
    }

    const data = sales.map((sale) => ({
      ID: sale.id || "",
      Sana:
        sale.created_at ||
        sale.date ||
        "",
      Mijoz:
        sale.customer_name ||
        sale.customer?.name ||
        "Noma'lum",
      Telefon:
        sale.customer_phone ||
        sale.customer?.phone ||
        "",
      "To'lov holati":
        sale.payment_status ||
        sale.status ||
        "",
      "Jami":
        Number(
          sale.total ||
          sale.grand_total ||
          0
        ),
      "Foyda":
        Number(
          sale.profit ||
          0
        ),
    }));

    const worksheet =
      XLSX.utils.json_to_sheet(data);

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Sotuvlar"
    );

    XLSX.writeFile(
      workbook,
      "Sotuvlar.xlsx"
    );
  };
  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
    },
    {
      field: "customer_name",
      headerName: "Mijoz",
      flex: 1,
      minWidth: 150,
    },
    {
      field: "product_name",
      headerName: "Mahsulot",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "quantity",
      headerName: "Miqdor",
      width: 110,
      renderCell: (params) => {
        const product = getProduct(
          params.row.product_id
        );

        return `${params.value || 0} ${getUnit(
          product
        )}`;
      },
    },
    {
      field: "price",
      headerName: "Narxi",
      width: 150,
      renderCell: (params) =>
        `${money(params.value)} so'm`,
    },
    {
      field: "total",
      headerName: "Jami",
      width: 160,
      renderCell: (params) => (
        <Typography
          fontWeight={700}
          color="primary.main"
        >
          {money(params.value)} so'm
        </Typography>
      ),
    },
    {
      field: "payment_status",
      headerName: "To'lov",
      width: 130,
      renderCell: (params) => (
        <Chip
          label={params.value || "-"}
          size="small"
          color={
            params.value === "Qarz"
              ? "error"
              : params.value === "Karta"
              ? "info"
              : "success"
          }
        />
      ),
    },
    {
      field: "profit",
      headerName: "Foyda",
      width: 150,
      renderCell: (params) => (
        <Typography
          fontWeight={700}
          color="success.main"
        >
          {money(params.value)} so'm
        </Typography>
      ),
    },
    {
      field: "date",
      headerName: "Sana",
      width: 180,
      renderCell: (params) => {
        if (!params.value) return "-";

        const date = new Date(
          params.value
        );

        if (isNaN(date.getTime()))
          return "-";

        return date.toLocaleString(
          "uz-UZ"
        );
      },
    },
  ];

  const statCards = [
    {
      title: "Jami sotuv",
      value: `${money(totalSales)} so'm`,
      icon: <ReceiptLongIcon />,
      color: "#2563eb",
      bg: "#eff6ff",
    },
    {
      title: "Jami foyda",
      value: `${money(totalProfit)} so'm`,
      icon: <TrendingUpIcon />,
      color: "#16a34a",
      bg: "#f0fdf4",
    },
    {
      title: "Naqd",
      value: `${money(cashSales)} so'm`,
      icon: <PaymentsIcon />,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      title: "Karta",
      value: `${money(cardSales)} so'm`,
      icon: <CreditCardIcon />,
      color: "#0891b2",
      bg: "#ecfeff",
    },
    {
      title: "Qarz",
      value: `${money(totalDebt)} so'm`,
      icon: <MoneyOffIcon />,
      color: "#dc2626",
      bg: "#fef2f2",
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "linear-gradient(135deg,#f8fafc 0%,#eef4ff 50%,#f8fafc 100%)",
        py: 1,
      }}
    >
      <Container maxWidth="xl">

        {/* HEADER */}

        <Box
          sx={{
            mb: 4,
            p: 3,
            borderRadius: 4,
            background:
              "linear-gradient(135deg,#0f172a,#1e3a8a)",
            color: "white",
            boxShadow:
              "0 15px 35px rgba(15,23,42,.18)",
          }}
        >
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
          >
            <Box>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <ShoppingCartIcon
                  sx={{ fontSize: 38 }}
                />

                <Typography
                  variant="h4"
                  fontWeight={800}
                >
                  Sotuvlar
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 1,
                  opacity: 0.75,
                }}
              >
                Savdo, to'lovlar va foydani
                professional boshqarish
              </Typography>
            </Box>

            <Chip
              icon={<ShoppingCartIcon />}
              label={`${sales.length} ta sotuv`}
              sx={{
                color: "white",
                borderColor:
                  "rgba(255,255,255,.35)",
                background:
                  "rgba(255,255,255,.10)",
                fontWeight: 700,
                px: 1,
              }}
              variant="outlined"
            />
          </Stack>
        </Box>

        {/* STATISTIKA */}

        <Grid
          container
          spacing={2}
          mb={4}
        >
          {statCards.map((card) => (
            <Grid
              key={card.title}
              size={{
                xs: 12,
                sm: 6,
                md: 2.4,
              }}
            >
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 3,
                  border:
                    "1px solid rgba(148,163,184,.16)",
                  boxShadow:
                    "0 8px 25px rgba(15,23,42,.07)",
                  transition:
                    "all .2s ease",
                  "&:hover": {
                    transform:
                      "translateY(-4px)",
                    boxShadow:
                      "0 14px 30px rgba(15,23,42,.12)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 46,
                      height: 46,
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "center",
                      background: card.bg,
                      color: card.color,
                      mb: 2,
                    }}
                  >
                    {card.icon}
                  </Box>

                  <Typography
                    color="text.secondary"
                    fontSize={13}
                    fontWeight={600}
                  >
                    {card.title}
                  </Typography>

                  <Typography
                    variant="h6"
                    fontWeight={800}
                    mt={0.5}
                    sx={{
                      color: card.color,
                    }}
                  >
                    {card.value}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* NEW SALE */}

        <Card
          sx={{
            mb: 4,
            borderRadius: 4,
            overflow: "hidden",
            boxShadow:
              "0 12px 35px rgba(15,23,42,.08)",
          }}
        >
          <Box
            sx={{
              px: 3,
              py: 2,
              background:
                "linear-gradient(90deg,#eff6ff,#ffffff)",
              borderBottom:
                "1px solid #e2e8f0",
            }}
          >
            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <AccountBalanceWalletIcon
                  color="primary"
                />

                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    Yangi sotuv
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Mijoz va mahsulotlarni
                    tanlang
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction={{
                  xs: "column",
                  sm: "row",
                }}
                spacing={1}
              >
                <Button
                  variant="outlined"
                  startIcon={
                    <PersonAddIcon />
                  }
                  onClick={
                    openCustomerDialog
                  }
                >
                  Yangi mijoz
                </Button>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addItem}
                >
                  Pozitsiya qo'shish
                </Button>
              </Stack>
            </Stack>
          </Box>

          <CardContent sx={{ p: 3 }}>

            {/* CUSTOMER */}

            <Grid
              container
              spacing={2}
              mb={3}
            >
              <Grid
                size={{
                  xs: 12,
                  md: 6,
                }}
              >
                <Button
              variant="contained"
              onClick={exportSalesExcel}
              sx={{
                background: "#15803d",
                "&:hover": {
                  background: "#166534",
                },
                fontWeight: 700,
                ml: 1,
              }}
            >
              Excel
            </Button>
            <TextField
                  select
                  fullWidth
                  label="Mijoz"
                  value={customerId}
                  onChange={(e) =>
                    setCustomerId(
                      e.target.value
                    )
                  }
                  helperText={
                    customers.length
                      ? `${customers.length} ta mijoz mavjud`
                      : "Mijozlar mavjud emas"
                  }
                >
                  {customers.map(
                    (customer) => (
                      <MenuItem
                        key={customer.id}
                        value={
                          customer.id
                        }
                      >
                        {customer.name}
                        {customer.phone
                          ? ` вЂ” ${customer.phone}`
                          : ""}
                      </MenuItem>
                    )
                  )}
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 3,
                }}
              >
                <TextField
                  select
                  fullWidth
                  label="To'lov turi"
                  value={
                    paymentStatus
                  }
                  onChange={(e) =>
                    setPaymentStatus(
                      e.target.value
                    )
                  }
                >
                  <MenuItem value="Naqd">
                    рџ’µ Naqd
                  </MenuItem>

                  <MenuItem value="Karta">
                    рџ’і Karta
                  </MenuItem>

                  <MenuItem value="Qarz">
                    рџ”ґ Qarz
                  </MenuItem>
                </TextField>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 3,
                }}
              >
                <Box
                  sx={{
                    height: "56px",
                    px: 2,
                    borderRadius: 2,
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #e2e8f0",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Inventory2Icon
                      color="primary"
                    />

                    <Typography
                      fontWeight={800}
                    >
                      {items.filter(
                        (x) =>
                          x.product_id ||
                          x.service_id
                      ).length}{" "}
                      pozitsiya
                    </Typography>
                  </Stack>
                </Box>
              </Grid>
            </Grid>

            {/* ITEMS */}

            <Stack spacing={2}>
              {items.map((item, index) => {
                const product = getProduct(item.product_id);
                const service = getService(item.service_id);

                const unit =
                  item.item_type === "service"
                    ? "xizmat"
                    : getUnit(product);

                const quantity = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                const lineTotal = quantity * price;

                return (
                  <Paper
                    key={item.id}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      border: "1px solid #e2e8f0",
                      boxShadow:
                        "0 4px 15px rgba(15,23,42,.04)",
                    }}
                  >
                    <Stack
                      direction={{
                        xs: "column",
                        md: "row",
                      }}
                      spacing={2}
                      alignItems={{
                        xs: "stretch",
                        md: "center",
                      }}
                    >
                      <Box
                        sx={{
                          minWidth: 40,
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "#eff6ff",
                          color: "#2563eb",
                          fontWeight: 800,
                        }}
                      >
                        {index + 1}
                      </Box>

                      <TextField
                        select
                        label="Turi"
                        value={item.item_type || "product"}
                        onChange={(e) =>
                          changeItemType(
                            item.id,
                            e.target.value
                          )
                        }
                        sx={{
                          width: {
                            xs: "100%",
                            md: 150,
                          },
                        }}
                      >
                        <MenuItem value="product">
                          Mahsulot
                        </MenuItem>

                        <MenuItem value="service">
                          Xizmat
                        </MenuItem>
                      </TextField>

                      {item.item_type === "service" ? (
                        <TextField
                          select
                          fullWidth
                          label="Xizmat"
                          value={item.service_id || ""}
                          onChange={(e) =>
                            selectService(
                              item.id,
                              e.target.value
                            )
                          }
                          sx={{ flex: 2 }}
                        >
                          {services.map((service) => (
                            <MenuItem
                              key={service.id}
                              value={service.id}
                            >
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                width="100%"
                                gap={2}
                              >
                                <span>
                                  {service.name}
                                </span>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {money(
                                    service.sale_price
                                  )}{" "}
                                  so'm
                                </Typography>
                              </Stack>
                            </MenuItem>
                          ))}
                        </TextField>
                      ) : (
                        <TextField
                          select
                          fullWidth
                          label="Mahsulot"
                          value={item.product_id || ""}
                          onChange={(e) =>
                            selectProduct(
                              item.id,
                              e.target.value
                            )
                          }
                          sx={{ flex: 2 }}
                        >
                          {products.map((product) => (
                            <MenuItem
                              key={product.id}
                              value={product.id}
                            >
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                width="100%"
                                gap={2}
                              >
                                <span>
                                  {product.name}
                                </span>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  Qoldiq:{" "}
                                  {product.quantity}{" "}
                                  {getUnit(product)}
                                </Typography>
                              </Stack>
                            </MenuItem>
                          ))}
                        </TextField>
                      )}

                      <TextField
                        label={`Miqdor (${unit})`}
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          changeQuantity(
                            item.id,
                            e.target.value
                          )
                        }
                        sx={{
                          width: {
                            xs: "100%",
                            md: 150,
                          },
                        }}
                        inputProps={{
                          min: 0.01,
                          step:
                            item.item_type === "service"
                              ? 1
                              : unit === "metr"
                              ? 0.1
                              : 1,
                        }}
                      />

                      {item.item_type === "product" &&
                      product?.name?.toLowerCase().includes("kabel") ? (
                        <TextField
                          select
                          label={`Narx / ${unit}`}
                          value={item.price}
                          onChange={(e) =>
                            changePrice(
                              item.id,
                              e.target.value
                            )
                          }
                          sx={{
                            width: {
                              xs: "100%",
                              md: 180,
                            },
                          }}
                        >
                          <MenuItem value={4000}>
                            4 000 so'm / metr
                          </MenuItem>

                          <MenuItem value={5000}>
                            5 000 so'm / metr
                          </MenuItem>

                          <MenuItem value={6000}>
                            6 000 so'm / metr
                          </MenuItem>

                          <MenuItem value={7000}>
                            7 000 so'm / metr
                          </MenuItem>

                          <MenuItem value="">
                            Boshqa narx
                          </MenuItem>
                        </TextField>
                      ) : (
                        <TextField
                          label={`Narx / ${unit}`}
                          type="number"
                          value={item.price}
                          onChange={(e) =>
                            changePrice(
                              item.id,
                              e.target.value
                            )
                          }
                          sx={{
                            width: {
                              xs: "100%",
                              md: 180,
                            },
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                so'm
                              </InputAdornment>
                            ),
                          }}
                        />
                      )}

                      <Box
                        sx={{
                          minWidth: {
                            xs: "100%",
                            md: 180,
                          },
                          p: 1.5,
                          borderRadius: 2,
                          background: "#f0fdf4",
                          border:
                            "1px solid #bbf7d0",
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                        >
                          Qator jami
                        </Typography>

                        <Typography
                          fontWeight={800}
                          color="success.main"
                        >
                          {money(lineTotal)} so'm
                        </Typography>
                      </Box>

                      <IconButton
                        color="error"
                        onClick={() =>
                          removeItem(item.id)
                        }
                        disabled={items.length === 1}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
            <Divider sx={{ my: 3 }} />

            {/* TOTAL */}

            <Grid
              container
              spacing={2}
              alignItems="stretch"
            >
              <Grid
                size={{
                  xs: 12,
                  md: 7,
                }}
              >
                <Stack
                  direction={{
                    xs: "column",
                    sm: "row",
                  }}
                  spacing={2}
                >
                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: 2,
                      background:
                        "#eff6ff",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Mahsulotlar
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={800}
                      color="primary.main"
                    >
                      {items.length} ta
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      flex: 1,
                      p: 2,
                      borderRadius: 2,
                      background:
                        "#f0fdf4",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                    >
                      Taxminiy foyda
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={800}
                      color="success.main"
                    >
                      {money(
                        estimatedProfit
                      )}{" "}
                      so'm
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  md: 5,
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    p: 2.5,
                    borderRadius: 3,
                    color: "white",
                    background:
                      "linear-gradient(135deg,#0f172a,#1d4ed8)",
                    textAlign: "center",
                    boxShadow:
                      "0 10px 25px rgba(37,99,235,.22)",
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.7,
                    }}
                  >
                    KOMPLEKT JAMI
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={900}
                  >
                    {money(
                      grandTotal
                    )}{" "}
                    so'm
                  </Typography>
                </Box>
              </Grid>

              <Grid size={12}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  size="large"
                  onClick={
                    saveBundleSale
                  }
                  startIcon={
                    <ShoppingCartIcon />
                  }
                  sx={{
                    height: 62,
                    borderRadius: 3,
                    fontSize: 17,
                    fontWeight: 800,
                    textTransform:
                      "none",
                    boxShadow:
                      "0 10px 25px rgba(22,163,74,.25)",
                  }}
                >
                  Sotuvni yakunlash
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* SALES HISTORY */}

        <Card
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            boxShadow:
              "0 12px 35px rgba(15,23,42,.08)",
          }}
        >
          <Box
            sx={{
              p: 3,
              background:
                "linear-gradient(90deg,#f8fafc,#eef4ff)",
              borderBottom:
                "1px solid #e2e8f0",
            }}
          >
            <Stack
              direction={{
                xs: "column",
                md: "row",
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <ReceiptLongIcon color="primary" />

                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    Sotuvlar tarixi
                  </Typography>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  mt={0.5}
                >
                  Barcha amalga oshirilgan
                  sotuvlar
                </Typography>
              </Box>

              <TextField
                size="small"
                placeholder="Sotuv qidirish..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
                sx={{
                  width: {
                    xs: "100%",
                    md: 350,
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Box>

          <Box
            sx={{
              width: "100%",
            }}
          >
            <DataGrid
              rows={filteredSales}
              autoHeight
              pageSizeOptions={[
                5,
                10,
                20,
                50,
              ]}
              disableRowSelectionOnClick
              columns={columns}
              sx={{
                border: 0,

                "& .MuiDataGrid-columnHeaders": {
                  background:
                    "#f8fafc",
                  fontWeight: 800,
                },

                "& .MuiDataGrid-row:hover": {
                  background:
                    "#f8fafc",
                },

                "& .MuiDataGrid-cell": {
                  borderColor:
                    "#f1f5f9",
                },
              }}
            />
          </Box>
        </Card>

        {/* NEW CUSTOMER */}

        <Dialog
          open={customerDialogOpen}
          onClose={closeCustomerDialog}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: 4,
            },
          }}
        >
          <DialogTitle
            sx={{
              fontWeight: 800,
            }}
          >
            рџ‘¤ Yangi mijoz qo'shish
          </DialogTitle>

          <DialogContent>
            <Stack
              spacing={2}
              mt={1}
            >
              <TextField
                autoFocus
                fullWidth
                label="Mijoz nomi *"
                name="name"
                value={
                  newCustomer.name
                }
                onChange={
                  handleCustomerChange
                }
              />

              <TextField
                fullWidth
                label="Telefon"
                name="phone"
                value={
                  newCustomer.phone
                }
                onChange={
                  handleCustomerChange
                }
              />

              <TextField
                fullWidth
                label="Manzil"
                name="address"
                value={
                  newCustomer.address
                }
                onChange={
                  handleCustomerChange
                }
              />

              <TextField
                fullWidth
                label="Obyekt"
                name="object"
                value={
                  newCustomer.object
                }
                onChange={
                  handleCustomerChange
                }
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2.5 }}>
            <Button
              onClick={
                closeCustomerDialog
              }
              disabled={
                customerSaving
              }
            >
              Bekor qilish
            </Button>

            <Button
              variant="contained"
              onClick={
                saveNewCustomer
              }
              disabled={
                customerSaving
              }
              sx={{
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              {customerSaving
                ? "Saqlanmoqda..."
                : "Mijozni saqlash"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}

export default Sales;




