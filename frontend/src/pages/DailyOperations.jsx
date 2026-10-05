import React from "react";
import { Box, Card, CardContent, Typography, Button, Stack } from "@mui/material";

export default function DailyOperations() {
  return (
    <Box sx={{ width: "100%", maxWidth: 1400, mx: "auto" }}>
      <Typography
        sx={{
          fontSize: { xs: 26, md: 34 },
          fontWeight: 900,
          color: "#0f172a",
          mb: 1,
        }}
      >
        Kunlik operatsiyalar
      </Typography>

      <Typography
        sx={{
          color: "#64748b",
          mb: 3,
        }}
      >
        Bugungi barcha ishlarni shu yerda kiriting va boshqaring.
      </Typography>

      <Card
        sx={{
          borderRadius: "20px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 8px 28px rgba(15,23,42,.06)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack spacing={2}>
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 900,
                color: "#0f172a",
              }}
            >
              Bugungi operatsiyalar
            </Typography>

            <Typography sx={{ color: "#64748b" }}>
              Hozircha operatsiyalar mavjud emas.
            </Typography>

            <Button
              variant="contained"
              sx={{
                width: "fit-content",
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 800,
              }}
            >
              + Operatsiya qo'shish
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
