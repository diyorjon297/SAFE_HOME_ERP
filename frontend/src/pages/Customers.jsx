import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  Avatar,
  Stack,
  Divider,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PeopleIcon from "@mui/icons-material/People";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import BusinessIcon from "@mui/icons-material/Business";
import RefreshIcon from "@mui/icons-material/Refresh";

export default function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    object: "",
    debt: 0,
  });

  // =====================================================
  // MIJOZLARNI YUKLASH
  // =====================================================

  const loadCustomers = async () => {
    try {
      setLoading(true);

      let res;

      try {
        res = await API.get("/customers");
      } catch {
        res = await API.get("/customers/");
      }

      const data = res.data;

      if (Array.isArray(data)) {
        setCustomers(data);
      } else if (Array.isArray(data?.customers)) {
        setCustomers(data.customers);
      } else if (Array.isArray(data?.items)) {
        setCustomers(data.items);
      } else {
        setCustomers([]);
      }
    } catch (error) {
      console.error("Customers load error:", error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  // =====================================================
  // FORM
  // =====================================================

  const resetForm = () => {
    setForm({
      name: "",
      phone: "",
      address: "",
      object: "",
      debt: 0,
    });

    setEditId(null);
  };

  const openNewCustomer = () => {
    resetForm();
    setOpen(true);
  };

  // =====================================================
  // SAQLASH
  // =====================================================

  const saveCustomer = async () => {
    if (!form.name.trim()) {
      alert("Mijoz nomini kiriting!");
      return;
    }

    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        object: form.object.trim(),
        debt: Number(form.debt) || 0,
      };

      if (editId) {
        await API.put(`/customers/${editId}`, payload);
      } else {
        await API.post("/customers", payload);
      }

      setOpen(false);
      resetForm();

      await loadCustomers();
    } catch (error) {
      console.error("Customer save error:", error);

      alert(
        error?.response?.data?.detail ||
          "Mijozni saqlashda xatolik yuz berdi."
      );
    }
  };

  // =====================================================
  // TAHRIRLASH
  // =====================================================

  const editCustomer = (row) => {
    setEditId(row.id);

    setForm({
      name: row.name || "",
      phone: row.phone || "",
      address: row.address || "",
      object: row.object || "",
      debt: Number(row.debt) || 0,
    });

    setOpen(true);
  };

  // =====================================================
  // O'CHIRISH
  // =====================================================

  const deleteCustomer = async (id) => {
    if (!window.confirm("Mijoz o'chirilsinmi?")) {
      return;
    }

    try {
      await API.delete(`/customers/${id}`);
      await loadCustomers();
    } catch (error) {
      console.error("Customer delete error:", error);

      alert(
        error?.response?.data?.detail ||
          "Mijozni o'chirishda xatolik yuz berdi."
      );
    }
  };

  // =====================================================
  // QIDIRUV
  // =====================================================

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    if (!q) return customers;

    return customers.filter((customer) => {
      const text = `
        ${customer.name || ""}
        ${customer.phone || ""}
        ${customer.address || ""}
        ${customer.object || ""}
      `.toLowerCase();

      return text.includes(q);
    });
  }, [customers, search]);

  // =====================================================
  // STATISTIKA
  // =====================================================

  const totalCustomers = customers.length;

  const debtorsCount = customers.filter(
    (customer) => Number(customer.debt) > 0
  ).length;

  const totalDebt = customers.reduce(
    (sum, customer) => sum + Number(customer.debt || 0),
    0
  );

  // =====================================================
  // DATA GRID
  // =====================================================

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 70,
    },

    {
      field: "name",
      headerName: "MIJOZ",
      flex: 1.2,
      minWidth: 190,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1.5}
          alignItems="center"
          sx={{ height: "100%" }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: "#2563eb",
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {(params.value || "M").charAt(0).toUpperCase()}
          </Avatar>

          <Typography fontWeight={700}>
            {params.value || "Noma'lum"}
          </Typography>
        </Stack>
      ),
    },

    {
      field: "phone",
      headerName: "TELEFON",
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ height: "100%" }}
        >
          <PhoneIcon
            sx={{
              fontSize: 18,
              color: "#2563eb",
            }}
          />

          <Typography>
            {params.value || "-"}
          </Typography>
        </Stack>
      ),
    },

    {
      field: "address",
      headerName: "MANZIL",
      flex: 1,
      minWidth: 170,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ height: "100%" }}
        >
          <LocationOnIcon
            sx={{
              fontSize: 18,
              color: "#64748b",
            }}
          />

          <Typography>
            {params.value || "-"}
          </Typography>
        </Stack>
      ),
    },

    {
      field: "object",
      headerName: "OBYEKT",
      flex: 1,
      minWidth: 160,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ height: "100%" }}
        >
          <BusinessIcon
            sx={{
              fontSize: 18,
              color: "#7c3aed",
            }}
          />

          <Typography>
            {params.value || "-"}
          </Typography>
        </Stack>
      ),
    },

    {
      field: "debt",
      headerName: "QARZ",
      width: 160,
      renderCell: (params) => {
        const debt = Number(params.value || 0);

        return debt <= 0 ? (
          <Chip
            label="Qarz yo'q"
            color="success"
            size="small"
            sx={{
              fontWeight: 700,
            }}
          />
        ) : (
          <Chip
            label={`${debt.toLocaleString("uz-UZ")} so'm`}
            color="error"
            size="small"
            sx={{
              fontWeight: 700,
            }}
          />
        );
      },
    },

    {
      field: "actions",
      headerName: "AMALLAR",
      width: 170,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            height: "100%",
            alignItems: "center",
          }}
        >
          <IconButton
            color="info"
            title="Ko'rish"
            onClick={() =>
              navigate(`/customers/${params.row.id}`)
            }
          >
            <VisibilityIcon />
          </IconButton>

          <IconButton
            color="primary"
            title="Tahrirlash"
            onClick={() => editCustomer(params.row)}
          >
            <EditIcon />
          </IconButton>

          <IconButton
            color="error"
            title="O'chirish"
            onClick={() =>
              deleteCustomer(params.row.id)
            }
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      ),
    },
  ];

  // =====================================================
  // STAT CARD
  // =====================================================

  const StatCard = ({
    title,
    value,
    icon,
    gradient,
  }) => (
    <Card
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        position: "relative",
        height: "100%",
        border: "1px solid rgba(148,163,184,.15)",
        boxShadow:
          "0 8px 30px rgba(15,23,42,.07)",
        background: "#fff",
      }}
    >
      <Box
        sx={{
          position: "absolute",
          right: -25,
          top: -25,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: gradient,
          opacity: 0.12,
        }}
      />

      <CardContent sx={{ p: 2.5 }}>
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
              variant="h4"
              fontWeight={800}
              sx={{ mt: 1 }}
            >
              {value}
            </Typography>
          </Box>

          <Avatar
            sx={{
              width: 50,
              height: 50,
              background: gradient,
              boxShadow:
                "0 8px 20px rgba(37,99,235,.20)",
            }}
          >
            {icon}
          </Avatar>
        </Stack>
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 64px)",
        background:
          "linear-gradient(135deg,#f8fafc 0%,#eef4ff 100%)",
        p: { xs: 2, md: 3 },
      }}
    >
      {/* =================================================
          HEADER
      ================================================= */}

      <Box
        sx={{
          mb: 3,
          p: { xs: 2.5, md: 3 },
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
              <Avatar
                sx={{
                  bgcolor:
                    "rgba(255,255,255,.15)",
                  width: 50,
                  height: 50,
                }}
              >
                <PeopleIcon />
              </Avatar>

              <Box>
                <Typography
                  variant="h4"
                  fontWeight={800}
                >
                  Mijozlar
                </Typography>

                <Typography
                  sx={{
                    color: "rgba(255,255,255,.7)",
                    mt: 0.5,
                  }}
                >
                  Mijozlar bazasi va qarzlarni boshqarish
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Stack
            direction="row"
            spacing={1}
          >
            <Button
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={loadCustomers}
              sx={{
                background:
                  "rgba(255,255,255,.12)",
                color: "white",
                border:
                  "1px solid rgba(255,255,255,.2)",
                "&:hover": {
                  background:
                    "rgba(255,255,255,.2)",
                },
              }}
            >
              Yangilash
            </Button>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openNewCustomer}
              sx={{
                bgcolor: "#38bdf8",
                color: "#082f49",
                fontWeight: 800,
                "&:hover": {
                  bgcolor: "#7dd3fc",
                },
              }}
            >
              Yangi mijoz
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* =================================================
          STATISTIKA
      ================================================= */}

      <Grid
        container
        spacing={2}
        mb={3}
      >
        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <StatCard
            title="Jami mijozlar"
            value={totalCustomers}
            icon={<PeopleIcon />}
            gradient="linear-gradient(135deg,#2563eb,#60a5fa)"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            sm: 6,
            md: 4,
          }}
        >
          <StatCard
            title="Qarzdor mijozlar"
            value={debtorsCount}
            icon={<WarningAmberIcon />}
            gradient="linear-gradient(135deg,#dc2626,#fb7185)"
          />
        </Grid>

        <Grid
          size={{
            xs: 12,
            md: 4,
          }}
        >
          <StatCard
            title="Umumiy mijozlar qarzi"
            value={`${totalDebt.toLocaleString(
              "uz-UZ"
            )} so'm`}
            icon={
              <AccountBalanceWalletIcon />
            }
            gradient="linear-gradient(135deg,#16a34a,#4ade80)"
          />
        </Grid>
      </Grid>

      {/* =================================================
          SEARCH
      ================================================= */}

      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          border:
            "1px solid rgba(148,163,184,.18)",
          boxShadow:
            "0 5px 20px rgba(15,23,42,.05)",
        }}
      >
        <CardContent sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Mijoz, telefon, manzil yoki obyekt bo'yicha qidirish..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{
                      color: "#2563eb",
                    }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                background: "#f8fafc",
              },
            }}
          />
        </CardContent>
      </Card>

      {/* =================================================
          TABLE
      ================================================= */}

      <Card
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          border:
            "1px solid rgba(148,163,184,.18)",
          boxShadow:
            "0 10px 35px rgba(15,23,42,.07)",
        }}
      >
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom:
              "1px solid #e2e8f0",
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={800}
              >
                Mijozlar ro'yxati
              </Typography>

              <Typography
                color="text.secondary"
                fontSize={14}
              >
                {filtered.length} ta mijoz
              </Typography>
            </Box>

            {search && (
              <Chip
                label={`"${search}"`}
                onDelete={() =>
                  setSearch("")
                }
                color="primary"
                variant="outlined"
              />
            )}
          </Stack>
        </Box>

        <Box
          sx={{
            width: "100%",
            "& .MuiDataGrid-root": {
              border: "none",
            },

            "& .MuiDataGrid-columnHeaders": {
              background: "#f8fafc",
              borderBottom:
                "1px solid #e2e8f0",
            },

            "& .MuiDataGrid-columnHeaderTitle": {
              fontWeight: 800,
              fontSize: 12,
              color: "#475569",
            },

            "& .MuiDataGrid-row:hover": {
              background:
                "rgba(37,99,235,.035)",
            },

            "& .MuiDataGrid-cell": {
              borderBottom:
                "1px solid #f1f5f9",
            },

            "& .MuiDataGrid-footerContainer": {
              borderTop:
                "1px solid #e2e8f0",
            },
          }}
        >
          <DataGrid
            rows={filtered}
            columns={columns}
            loading={loading}
            getRowId={(row) => row.id}
            autoHeight
            pageSizeOptions={[
              5,
              10,
              20,
              50,
            ]}
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
                "Mijoz topilmadi",
            }}
          />
        </Box>
      </Card>

      {/* =================================================
          ADD / EDIT DIALOG
      ================================================= */}

      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
          resetForm();
        }}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            background:
              "linear-gradient(135deg,#0f172a,#1e3a8a)",
            color: "white",
            fontWeight: 800,
            py: 2.5,
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Avatar
              sx={{
                bgcolor:
                  "rgba(255,255,255,.15)",
              }}
            >
              {editId ? (
                <EditIcon />
              ) : (
                <AddIcon />
              )}
            </Avatar>

            <Box>
              {editId
                ? "Mijozni tahrirlash"
                : "Yangi mijoz"}

              <Typography
                display="block"
                fontSize={13}
                sx={{
                  color:
                    "rgba(255,255,255,.65)",
                  mt: 0.3,
                }}
              >
                SAFE HOME SERVICES ERP
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Mijoz nomi *"
            value={form.name}
            onChange={(e) =>
              setForm({
                ...form,
                name: e.target.value,
              })
            }
          />

          <TextField
            fullWidth
            margin="dense"
            label="Telefon"
            value={form.phone}
            onChange={(e) =>
              setForm({
                ...form,
                phone: e.target.value,
              })
            }
          />

          <TextField
            fullWidth
            margin="dense"
            label="Manzil"
            value={form.address}
            onChange={(e) =>
              setForm({
                ...form,
                address: e.target.value,
              })
            }
          />

          <TextField
            fullWidth
            margin="dense"
            label="Obyekt"
            value={form.object}
            onChange={(e) =>
              setForm({
                ...form,
                object: e.target.value,
              })
            }
          />

          <TextField
            fullWidth
            margin="dense"
            type="number"
            label="Qarz"
            value={form.debt}
            onChange={(e) =>
              setForm({
                ...form,
                debt: e.target.value,
              })
            }
          />
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => {
              setOpen(false);
              resetForm();
            }}
            sx={{
              borderRadius: 2,
            }}
          >
            Bekor qilish
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={saveCustomer}
            sx={{
              borderRadius: 2,
              px: 3,
              fontWeight: 700,
            }}
          >
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}