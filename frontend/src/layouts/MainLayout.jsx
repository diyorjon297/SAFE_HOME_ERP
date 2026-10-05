import { Outlet, useLocation } from "react-router-dom";
import { Box } from "@mui/material";

import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function MainLayout() {
  const location = useLocation();

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
  };

  const currentBackground =
    backgrounds[location.pathname] || "#f8fafc";

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        minHeight: "100vh",
        background: currentBackground,
      }}
    >
      <Sidebar />

      <Box
        component="main"
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Header />

        <Box
          sx={{
            flex: 1,
            width: "100%",
            minWidth: 0,
            p: {
              xs: 2,
              sm: 2.5,
              md: 3,
              lg: 3.5,
            },
            pt: {
              xs: 2,
              sm: 2.5,
              md: 3,
            },
            boxSizing: "border-box",
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}