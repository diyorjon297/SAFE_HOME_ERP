import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout() {
  const location = useLocation();

  const backgrounds = {
    "/": "#eef6ff",
    "/customers": "#f5f0ff",
    "/products": "#effaf3",
    "/cameras": "#eef8ff",
    "/sales": "#fff8e8",
    "/debts": "#fff1f2",
    "/finance": "#ecfdf5",
    "/orders": "#f5f3ff",
    "/warehouse": "#f0f9ff",
    "/services": "#f0fdfa",
    "/expenses": "#fff7ed",
    "/reports": "#f5f3ff",
    "/settings": "#f8fafc",
  };

  const currentBackground =
    backgrounds[location.pathname] || "#f5f7fb";

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        background: currentBackground,
        transition: "background 0.3s ease",
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          background: currentBackground,
          transition: "background 0.3s ease",
        }}
      >
        <Header />

        <Box
          sx={{
            p: { xs: 2, md: 3 },
            mt: 8,
            minHeight: "calc(100vh - 64px)",
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}