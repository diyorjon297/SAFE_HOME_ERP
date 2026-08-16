import { useEffect, useMemo, useState } from "react";
import API from "../api";

import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  MenuItem,
  InputAdornment,
  Autocomplete,
  Card,
  CardContent,
  Chip,
  Avatar,
} from "@mui/material";

import {
  Add,
  Edit,
  Delete,
  Search,
  Inventory,
  Category,
  Warning,
  AttachMoney,
  Storage,
  Refresh,
} from "@mui/icons-material";

import { DataGrid } from "@mui/x-data-grid";


export default function Products() {

  const emptyForm = {
    id: null,
    name: "",
    brand: "",
    model: "",
    category: "",
    resolution: "",
    connection: "",
    unit: "dona",
    serial_number: "",
    purchase_price: "",
    sale_price: "",
    quantity: "",
    warranty_month: "",
  };

  const [products, setProducts] = useState([]);
  const [cameraList, setCameraList] = useState([]);
  const [form, setForm] = useState(emptyForm);

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    type: "success",
  });


  // =========================
  // MESSAGE
  // =========================

  const showMessage = (message, type = "success") => {
    setSnackbar({
      open: true,
      message,
      type,
    });
  };


  // =========================
  // PRODUCTS
  // =========================

  const loadProducts = async () => {

    try {

      setLoading(true);

      const res = await API.get("/products/");

      setProducts(
        Array.isArray(res.data)
          ? res.data
          : []
      );

    } catch (error) {

      console.error(error);

      showMessage(
        "Mahsulotlarni yuklashda xato",
        "error"
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // CAMERA CATALOG
  // =========================

  const loadCameraCatalog = async () => {

    try {

      const res = await API.get("/cameras/catalog");

      setCameraList(
        Array.isArray(res.data)
          ? res.data
          : []
      );

    } catch (error) {

      console.log(error);

    }
  };


  useEffect(() => {

    loadProducts();
    loadCameraCatalog();

  }, []);


  // =========================
  // FORM
  // =========================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

  };


  // =========================
  // CAMERA AUTO FILL
  // =========================

  const handleCameraSelect = (value) => {

    const camera = cameraList.find(
      (item) => item.model === value
    );

    setForm((prev) => ({
      ...prev,

      model: value || "",

      brand: camera?.brand || prev.brand,

      category:
        camera?.camera_type ||
        prev.category,

      resolution:
        camera?.resolution ||
        prev.resolution,

      connection:
        camera?.connection ||
        prev.connection,

      warranty_month:
        camera?.warranty_month ||
        prev.warranty_month,
    }));

  };


  // =========================
  // SAVE
  // =========================

  const handleSave = async () => {

    if (!form.name.trim()) {

      showMessage(
        "Mahsulot nomini kiriting",
        "error"
      );

      return;
    }

    try {

      const data = {

        name: form.name.trim(),

        brand: form.brand,

        model: form.model,

        category: form.category,

        resolution: form.resolution,

        connection: form.connection,

        unit: form.unit,

        serial_number: form.serial_number,

        purchase_price:
          Number(form.purchase_price) || 0,

        sale_price:
          Number(form.sale_price) || 0,

        quantity:
          Number(form.quantity) || 0,

        warranty_month:
          Number(form.warranty_month) || 0,
      };


      if (editMode) {

        await API.put(
          `/products/${form.id}`,
          data
        );

        showMessage(
          "Mahsulot muvaffaqiyatli yangilandi"
        );

      } else {

        await API.post(
          "/products/",
          data
        );

        showMessage(
          "Mahsulot muvaffaqiyatli qo'shildi"
        );

      }


      setOpen(false);

      setForm(emptyForm);

      await loadProducts();

    } catch (error) {

      console.error(error);

      showMessage(
        error?.response?.data?.detail ||
          "Saqlashda xatolik yuz berdi",
        "error"
      );

    }
  };


  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {

    if (
      !window.confirm(
        "Ushbu mahsulotni o'chirmoqchimisiz?"
      )
    ) {
      return;
    }


    try {

      await API.delete(
        `/products/${id}`
      );

      showMessage(
        "Mahsulot o'chirildi"
      );

      await loadProducts();

    } catch (error) {

      showMessage(
        "Mahsulotni o'chirishda xato",
        "error"
      );

    }
  };


  // =========================
  // EDIT
  // =========================

  const handleEdit = (row) => {

    setEditMode(true);

    setForm({
      ...emptyForm,
      ...row,
    });

    setOpen(true);

  };


  // =========================
  // ADD
  // =========================

  const handleAdd = () => {

    setEditMode(false);

    setForm(emptyForm);

    setOpen(true);

  };


  // =========================
  // SEARCH
  // =========================

  const filteredProducts = useMemo(() => {

    const q = search
      .toLowerCase()
      .trim();

    if (!q) {
      return products;
    }

    return products.filter((item) => {

      const text = `
        ${item.name || ""}
        ${item.brand || ""}
        ${item.model || ""}
        ${item.category || ""}
        ${item.serial_number || ""}
      `.toLowerCase();

      return text.includes(q);

    });

  }, [products, search]);


  // =========================
  // STATISTICS
  // =========================

  const totalProducts = products.length;

  const totalQuantity = products.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0),
    0
  );

  const lowStock = products.filter(
    (item) =>
      Number(item.quantity || 0) <= 5
  ).length;

  const totalValue = products.reduce(
    (sum, item) =>
      sum +
      Number(item.purchase_price || 0) *
        Number(item.quantity || 0),
    0
  );


  // =========================
  // COLUMNS
  // =========================

  const columns = [

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

      renderCell: (params) => (

        <Stack
          direction="row"
          spacing={1.2}
          alignItems="center"
          sx={{ height: "100%" }}
        >

          <Avatar
            sx={{
              width: 34,
              height: 34,
              background:
                "linear-gradient(135deg,#2563eb,#7c3aed)",
            }}
          >
            <Inventory fontSize="small" />
          </Avatar>

          <Typography
            fontWeight={600}
            noWrap
          >
            {params.value || "-"}
          </Typography>

        </Stack>

      ),
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

      renderCell: (params) => (

        <Chip
          label={params.value || "-"}
          size="small"
          sx={{
            fontWeight: 600,
            background: "#eff6ff",
            color: "#2563eb",
          }}
        />

      ),
    },


    {
      field: "resolution",
      headerName: "MP",
      width: 90,
    },


    {
      field: "connection",
      headerName: "Ulanish",
      width: 110,
    },


    {
      field: "quantity",
      headerName: "Miqdor",
      width: 110,

      renderCell: (params) => {

        const quantity =
          Number(params.value || 0);

        return (

          <Chip
            label={`${quantity} ${params.row.unit || "dona"}`}
            size="small"
            color={
              quantity <= 5
                ? "error"
                : "success"
            }
            variant="outlined"
          />

        );
      },
    },


    {
      field: "sale_price",
      headerName: "Sotuv narxi",
      width: 150,

      renderCell: (params) => (

        <Typography
          fontWeight={600}
          color="success.main"
        >
          {Number(
            params.value || 0
          ).toLocaleString("uz-UZ")}{" "}
          so'm
        </Typography>

      ),
    },


    {
      field: "warranty_month",
      headerName: "Kafolat",
      width: 110,

      renderCell: (params) => (

        <Chip
          label={`${params.value || 0} oy`}
          size="small"
          variant="outlined"
        />

      ),
    },


    {
      field: "actions",
      headerName: "Amallar",
      width: 120,
      sortable: false,
      filterable: false,

      renderCell: (params) => (

        <Stack direction="row">

          <IconButton
            color="primary"
            onClick={() =>
              handleEdit(params.row)
            }
          >
            <Edit />
          </IconButton>

          <IconButton
            color="error"
            onClick={() =>
              handleDelete(params.row.id)
            }
          >
            <Delete />
          </IconButton>

        </Stack>

      ),
    },

  ];


  // =========================
  // UI
  // =========================

  return (

    <Box
      sx={{
        minHeight: "100vh",
        p: { xs: 2, md: 3 },

        background:
          "linear-gradient(135deg,#f8fafc 0%,#eef4ff 50%,#f8fafc 100%)",
      }}
    >


      {/* HEADER */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: {
            xs: "flex-start",
            md: "center",
          },

          flexDirection: {
            xs: "column",
            md: "row",
          },

          gap: 2,
          mb: 3,
        }}
      >

        <Box>

          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >

            <Avatar
              sx={{
                width: 50,
                height: 50,

                background:
                  "linear-gradient(135deg,#2563eb,#4f46e5)",

                boxShadow:
                  "0 8px 25px rgba(37,99,235,.25)",
              }}
            >

              <Inventory />

            </Avatar>


            <Box>

              <Typography
                variant="h4"
                fontWeight={800}
                sx={{
                  letterSpacing: "-.5px",
                }}
              >
                Mahsulotlar
              </Typography>

              <Typography
                color="text.secondary"
              >
                SAFE HOME ERP • Ombor va mahsulotlar
              </Typography>

            </Box>

          </Stack>

        </Box>


        <Button
          variant="contained"
          size="large"
          startIcon={<Add />}
          onClick={handleAdd}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.3,

            fontWeight: 700,

            textTransform: "none",

            background:
              "linear-gradient(135deg,#2563eb,#4f46e5)",

            boxShadow:
              "0 8px 22px rgba(37,99,235,.28)",

            "&:hover": {
              background:
                "linear-gradient(135deg,#1d4ed8,#4338ca)",
            },
          }}
        >
          Yangi mahsulot
        </Button>

      </Box>



      {/* STAT CARDS */}

      <Box
        sx={{
          display: "grid",

          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",

          gap: 2,

          mb: 3,
        }}
      >

        <StatCard
          title="Jami mahsulot"
          value={totalProducts}
          icon={<Inventory />}
          color="#2563eb"
        />


        <StatCard
          title="Jami miqdor"
          value={totalQuantity}
          icon={<Storage />}
          color="#16a34a"
        />


        <StatCard
          title="Kam qolgan"
          value={lowStock}
          icon={<Warning />}
          color="#dc2626"
        />


        <StatCard
          title="Ombor qiymati"
          value={`${totalValue.toLocaleString("uz-UZ")} so'm`}
          icon={<AttachMoney />}
          color="#7c3aed"
        />

      </Box>



      {/* SEARCH */}

      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,

          borderRadius: 3,

          border:
            "1px solid #e2e8f0",

          boxShadow:
            "0 8px 30px rgba(15,23,42,.05)",
        }}
      >

        <TextField
          fullWidth
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }

          placeholder="Mahsulot, brend, model yoki kategoriya bo'yicha qidiring..."

          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search color="primary" />
              </InputAdornment>
            ),
          }}

          sx={{
            "& fieldset": {
              border: "none",
            },
          }}
        />

      </Paper>



      {/* TABLE */}

      <Paper
        elevation={0}
        sx={{
          height: 620,

          borderRadius: 3,

          overflow: "hidden",

          border:
            "1px solid #e2e8f0",

          boxShadow:
            "0 12px 35px rgba(15,23,42,.07)",
        }}
      >

        <DataGrid
          rows={filteredProducts}
          columns={columns}
          loading={loading}

          getRowId={(row) => row.id}

          pageSizeOptions={[
            10,
            25,
            50,
          ]}

          disableRowSelectionOnClick

          sx={{

            border: "none",

            "& .MuiDataGrid-columnHeaders": {
              background: "#f8fafc",
              fontWeight: 800,
            },

            "& .MuiDataGrid-row:hover": {
              background: "#f8fbff",
            },

            "& .MuiDataGrid-cell": {
              borderColor: "#f1f5f9",
            },

            "& .MuiDataGrid-footerContainer": {
              background: "#f8fafc",
            },
          }}
        />

      </Paper>



      {/* DIALOG */}

      <Dialog
        open={open}
        onClose={() =>
          setOpen(false)
        }

        fullWidth
        maxWidth="sm"

        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow:
              "0 25px 70px rgba(15,23,42,.25)",
          },
        }}
      >

        <DialogTitle
          sx={{
            fontWeight: 800,
            fontSize: 24,
          }}
        >

          {editMode
            ? "Mahsulotni tahrirlash"
            : "Yangi mahsulot qo'shish"}

        </DialogTitle>


        <DialogContent>

          <Stack
            spacing={2}
            mt={1}
          >

            <TextField
              label="Mahsulot nomi"
              name="name"
              value={form.name}
              onChange={handleChange}
              fullWidth
            />


            <Autocomplete
              freeSolo

              options={
                cameraList.map(
                  (item) => item.model
                )
              }

              value={form.model}

              onChange={(e, value) =>
                handleCameraSelect(value)
              }

              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Kamera modeli"
                />
              )}
            />


            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >

              <TextField
                fullWidth
                label="Brend"
                name="brand"
                value={form.brand}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                label="Kategoriya"
                name="category"
                value={form.category}
                onChange={handleChange}
              />

            </Stack>


            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >

              <TextField
                fullWidth
                label="Rezolyutsiya"
                name="resolution"
                value={form.resolution}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                label="Ulanish turi"
                name="connection"
                value={form.connection}
                onChange={handleChange}
              />

            </Stack>


            <TextField
              select
              fullWidth
              label="Birlik"
              name="unit"
              value={form.unit}
              onChange={handleChange}
            >

              <MenuItem value="dona">
                Dona
              </MenuItem>

              <MenuItem value="metr">
                Metr
              </MenuItem>

              <MenuItem value="quti">
                Quti
              </MenuItem>

            </TextField>


            <TextField
              fullWidth
              label="Seriya raqam"
              name="serial_number"
              value={form.serial_number}
              onChange={handleChange}
            />


            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >

              <TextField
                fullWidth
                label="Kirim narxi"
                name="purchase_price"
                type="number"
                value={form.purchase_price}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                label="Sotuv narxi"
                name="sale_price"
                type="number"
                value={form.sale_price}
                onChange={handleChange}
              />

            </Stack>


            <Stack
              direction={{
                xs: "column",
                sm: "row",
              }}
              spacing={2}
            >

              <TextField
                fullWidth
                label={
                  form.unit === "metr"
                    ? "Metr"
                    : "Miqdor"
                }

                name="quantity"

                type="number"

                value={form.quantity}

                onChange={handleChange}
              />


              <TextField
                fullWidth
                label="Kafolat (oy)"
                name="warranty_month"
                type="number"
                value={form.warranty_month}
                onChange={handleChange}
              />

            </Stack>

          </Stack>

        </DialogContent>


        <DialogActions
          sx={{
            p: 3,
            gap: 1,
          }}
        >

          <Button
            onClick={() =>
              setOpen(false)
            }

            sx={{
              textTransform: "none",
            }}
          >
            Bekor qilish
          </Button>


          <Button
            variant="contained"
            onClick={handleSave}

            sx={{
              borderRadius: 2.5,
              px: 3,
              textTransform: "none",
              fontWeight: 700,
            }}
          >

            {editMode
              ? "Yangilash"
              : "Saqlash"}

          </Button>

        </DialogActions>

      </Dialog>



      {/* SNACKBAR */}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}

        onClose={() =>
          setSnackbar((prev) => ({
            ...prev,
            open: false,
          }))
        }

        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
      >

        <Alert
          severity={snackbar.type}
          variant="filled"
          sx={{
            borderRadius: 2,
          }}
        >
          {snackbar.message}
        </Alert>

      </Snackbar>

    </Box>
  );
}


// =========================
// STAT CARD
// =========================

function StatCard({
  title,
  value,
  icon,
  color,
}) {

  return (

    <Card
      elevation={0}
      sx={{
        position: "relative",
        overflow: "hidden",

        borderRadius: 3,

        border:
          "1px solid #e2e8f0",

        boxShadow:
          "0 10px 30px rgba(15,23,42,.06)",

        transition:
          "transform .2s, box-shadow .2s",

        "&:hover": {
          transform: "translateY(-3px)",

          boxShadow:
            "0 16px 35px rgba(15,23,42,.10)",
        },
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
              sx={{
                color: "#0f172a",
              }}
            >
              {value}
            </Typography>

          </Box>


          <Avatar
            sx={{
              width: 48,
              height: 48,

              background: `${color}15`,

              color: color,
            }}
          >
            {icon}
          </Avatar>

        </Stack>

      </CardContent>

    </Card>
  );
}