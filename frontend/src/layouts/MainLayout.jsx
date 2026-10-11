
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const backgrounds = {
    "/": "#f1f5f9",
    "/customers": "#f8fafc",
    "/products": "#f8fafc",
    "/cameras": "#f8fafc",
    "/sales": "#f8fafc",
    "/debts": "#f8fafc",
    "/finance": "#f8fafc",
    "/orders": "#f8fafc",
    "/warehouse": "#f8fafc",
    "/services": "#f8fafc",
    "/expenses": "#f8fafc",
    "/reports": "#f8fafc",
    "/settings": "#f8fafc",
    "/objects": "#f8fafc",
    "/employees": "#f8fafc",
  };

  const currentBackground =
    backgrounds[location.pathname] || "#f8fafc";

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minWidth: 0,
        minHeight: "100vh",
        overflowX: "clip",
        background: currentBackground,
      }}
    >
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={closeMobileMenu}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          width: 0,
          minWidth: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header
          onMenuClick={() => setMobileOpen(true)}
        />

        <Box
          sx={{
            flex: 1,
            width: "100%",
            minWidth: 0,
            p: { xs: 1.5, sm: 2.5, md: 3, lg: 3.5 },
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
