import { useEffect, useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Grid,
  IconButton,
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

import API from "../api";

function Cameras() {
  const emptyForm = {
    customer_id: "",
    object_name: "",
    brand: "",
    model: "",
    serial_number: "",
    ip_address: "",
    username: "",
    password: "",
    install_date: "",
    warranty_month: "",
    note: "",
  };

  const [cameras, setCameras] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [form, setForm] = useState(emptyForm);

  const [search, setSearch] = useState("");

  const [openEdit, setOpenEdit] = useState(false);

  const [selectedId, setSelectedId] = useState(null);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadCameras();
    loadCustomers();
  }, []);

  const loadCameras = async () => {
    try {
      const res = await API.get("/cameras/");
      setCameras(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await API.get("/customers/");
      setCustomers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const saveCamera = async () => {
    try {
      await API.post("/cameras/", form);

      setSnackbar({
        open: true,
        message: "Kamera muvaffaqiyatli qo'shildi",
        severity: "success",
      });

      setForm(emptyForm);

      loadCameras();
    } catch (err) {
      console.log(err);

      setSnackbar({
        open: true,
        message: "Xatolik yuz berdi",
        severity: "error",
      });
    }
  };

  const openEditDialog = (camera) => {
    setSelectedId(camera.id);

    setForm({
      customer_id: camera.customer_id,
      object_name: camera.object_name,
      brand: camera.brand,
      model: camera.model,
      serial_number: camera.serial_number,
      ip_address: camera.ip_address,
      username: camera.username,
      password: camera.password,
      install_date: camera.install_date,
      warranty_month: camera.warranty_month,
      note: camera.note,
    });

    setOpenEdit(true);
  };
    const updateCamera = async () => {
    try {
      await API.put(`/cameras/${selectedId}`, form);

      setSnackbar({
        open: true,
        message: "Kamera yangilandi",
        severity: "success",
      });

      setOpenEdit(false);
      setForm(emptyForm);
      setSelectedId(null);

      loadCameras();
    } catch (err) {
      console.log(err);

      setSnackbar({
        open: true,
        message: "Yangilashda xatolik",
        severity: "error",
      });
    }
  };

  const deleteCamera = async (id) => {

    if (!window.confirm("Kamerani o'chirishni tasdiqlaysizmi?")) return;

    try {

      await API.delete(`/cameras/${id}`);

      setSnackbar({
        open: true,
        message: "Kamera o'chirildi",
        severity: "success",
      });

      loadCameras();

    } catch (err) {

      console.log(err);

      setSnackbar({
        open: true,
        message: "O'chirishda xatolik",
        severity: "error",
      });

    }
  };

  const filteredRows = cameras.filter((camera) => {

    const text = `${camera.brand} ${camera.model} ${camera.serial_number} ${camera.ip_address}`
      .toLowerCase();

    return text.includes(search.toLowerCase());

  });

  const columns = [
    {
      field: "id",
      headerName: "№",
      width: 70,
    },

    {
      field: "brand",
      headerName: "Brend",
      flex: 1,
    },

    {
      field: "model",
      headerName: "Model",
      flex: 1,
    },

    {
      field: "serial_number",
      headerName: "Serial",
      flex: 1,
    },

    {
      field: "ip_address",
      headerName: "IP",
      flex: 1,
    },

    {
      field: "warranty_month",
      headerName: "Kafolat (oy)",
      width: 130,
    },

    {
      field: "actions",
      headerName: "Amallar",
      width: 150,

      renderCell: (params) => (
        <>
          <IconButton
            color="primary"
            onClick={() => openEditDialog(params.row)}
          >
            <EditIcon />
          </IconButton>

          <IconButton
            color="error"
            onClick={() => deleteCamera(params.row.id)}
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>
        📷 Kameralar
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2}>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select
              fullWidth
              label="Mijoz"
              name="customer_id"
              value={form.customer_id}
              onChange={handleChange}
            >
              {customers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} ({c.phone})
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Obyekt nomi"
              name="object_name"
              value={form.object_name}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Brend"
              name="brand"
              value={form.brand}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Model"
              name="model"
              value={form.model}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Serial Number"
              name="serial_number"
              value={form.serial_number}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="IP Address"
              name="ip_address"
              value={form.ip_address}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="date"
              label="O'rnatilgan sana"
              name="install_date"
              value={form.install_date}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              type="number"
              label="Kafolat (oy)"
              name="warranty_month"
              value={form.warranty_month}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={12}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Izoh"
              name="note"
              value={form.note}
              onChange={handleChange}
            />
          </Grid>

          <Grid size={12}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={saveCamera}
            >
              Kamera qo'shish
            </Button>
          </Grid>

        </Grid>
      </Paper>

      <Paper sx={{ p: 2, mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: <SearchIcon sx={{ mr: 1 }} />
            }
          }}
        />
      </Paper>      <Paper sx={{ height: 600 }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
          pageSizeOptions={[10, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: {
                pageSize: 10,
              },
            },
          }}
        />
      </Paper>

      <Dialog
        open={openEdit}
        onClose={() => setOpenEdit(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Kamerani tahrirlash</DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>

            <TextField
              label="Obyekt nomi"
              name="object_name"
              value={form.object_name}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Brend"
              name="brand"
              value={form.brand}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Model"
              name="model"
              value={form.model}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Serial Number"
              name="serial_number"
              value={form.serial_number}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="IP Address"
              name="ip_address"
              value={form.ip_address}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              label="Password"
              name="password"
              value={form.password}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              type="number"
              label="Kafolat (oy)"
              name="warranty_month"
              value={form.warranty_month}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              multiline
              rows={3}
              label="Izoh"
              name="note"
              value={form.note}
              onChange={handleChange}
              fullWidth
            />

          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>
            Bekor qilish
          </Button>

          <Button
            variant="contained"
            onClick={updateCamera}
          >
            Saqlash
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() =>
          setSnackbar({
            ...snackbar,
            open: false,
          })
        }
      >
        <Alert
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

export default Cameras;