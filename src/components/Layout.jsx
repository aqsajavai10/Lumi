import React from "react";
import { ThemeProvider, createTheme } from "@mui/material";
import { CssBaseline } from "@mui/material";
import Header from "./Header";
import { Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../firebase/Auth"; // Make sure this path is correct

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#f5f5dc", // Beige
    },
    secondary: {
      main: "#d2b48c", // Tan (complementary to beige)
    },
    background: {
      default: "#1c1c1d", // Dark background
      paper: "#2c2c2d", // Slightly lighter dark background for paper elements
    },
    text: {
      primary: "#ffffff", // White text
      secondary: "#c0c0c0", // Light Gray text
    },
  },
  typography: {
    fontFamily: "'Quicksand', Arial, sans-serif",
  },
  shape: {
    borderRadius: 8,
  },
});

export default function Layout() {
  const { user, signOut } = useAuth();
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {!isAuthPage && <Header user={user} signOut={signOut} />}
      <main>
        <Outlet />
      </main>
      {!isAuthPage && <footer></footer>}
    </ThemeProvider>
  );
}
