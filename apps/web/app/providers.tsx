"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f4f6f8",
      paper: "#ffffff",
    },
    primary: {
      main: "#146c5f",
      dark: "#0e5147",
    },
    secondary: {
      main: "#c94f2f",
    },
    text: {
      primary: "#17202a",
      secondary: "#667381",
    },
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: "Arial, Helvetica, sans-serif",
    button: {
      fontWeight: 700,
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 8,
        },
      },
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
