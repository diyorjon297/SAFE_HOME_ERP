import {
  TextField,
  Button,
  Paper,
  Grid,
  Typography,
} from "@mui/material";

function ProductForm({
  form,
  handleChange,
  saveProduct,
  editId,
}) {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" mb={3}>
        {editId ? "Mahsulotni tahrirlash" : "Yangi mahsulot"}
      </Typography>

      <form onSubmit={saveProduct}>
        <Grid container spacing={2}>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Mahsulot nomi"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Model"
              name="model"
              value={form.model}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Serial Number"
              name="serial_number"
              value={form.serial_number}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Soni"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Sotib olish narxi"
              name="purchase_price"
              value={form.purchase_price}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Sotish narxi"
              name="sale_price"
              value={form.sale_price}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              type="submit"
              size="large"
            >
              {editId ? "Yangilash" : "Saqlash"}
            </Button>
          </Grid>

        </Grid>
      </form>
    </Paper>
  );
}

export default ProductForm;