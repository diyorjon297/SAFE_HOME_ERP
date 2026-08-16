import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
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

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Mahsulot nomi"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              label="Kategoriya"
              name="category"
              value={form.category}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Soni"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Kirim narxi"
              name="buy_price"
              value={form.buy_price}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              type="number"
              label="Sotuv narxi"
              name="sell_price"
              value={form.sell_price}
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