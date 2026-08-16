import { TextField, Paper } from "@mui/material";

function SearchBar({ search, setSearch }) {
  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <TextField
        fullWidth
        label="Mijozni qidirish..."
        placeholder="Ism, telefon yoki manzil..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </Paper>
  );
}

export default SearchBar;