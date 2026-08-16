import { Grid, Paper, Typography } from "@mui/material";

function Card({ title, value, color }) {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        borderRadius: 3,
        borderLeft: `6px solid ${color}`,
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
      >
        {title}
      </Typography>

      <Typography
        variant="h5"
        fontWeight="bold"
        mt={1}
      >
        {value}
      </Typography>
    </Paper>
  );
}

export default function ProductStats({ products }) {
  const totalProducts = products.length;

  const totalQuantity = products.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  const warehouseValue = products.reduce(
    (sum, item) =>
      sum +
      Number(item.purchase_price) *
        Number(item.quantity),
    0
  );

  const expectedProfit = products.reduce(
    (sum, item) =>
      sum +
      (Number(item.sale_price) -
        Number(item.purchase_price)) *
        Number(item.quantity),
    0
  );

  return (
    <Grid
      container
      spacing={2}
      mb={3}
    >
      <Grid size={{ xs: 12, md: 3 }}>
        <Card
          title="Jami mahsulot"
          value={totalProducts}
          color="#1976d2"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card
          title="Ombordagi dona"
          value={totalQuantity}
          color="#2e7d32"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card
          title="Ombor qiymati"
          value={warehouseValue.toLocaleString() + " so'm"}
          color="#ef6c00"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Card
          title="Kutilayotgan foyda"
          value={expectedProfit.toLocaleString() + " so'm"}
          color="#8e24aa"
        />
      </Grid>
    </Grid>
  );
}