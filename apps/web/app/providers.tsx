"use client";

import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { ReactNode } from "react";

const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: "#030a14",
      paper: "#081827",
    },
    primary: {
      main: "#60a5fa",
      dark: "#2563eb",
    },
    secondary: {
      main: "#f0b35f",
    },
    text: {
      primary: "#e5edf7",
      secondary: "#9badbf",
    },
    warning: {
      main: "#f0b35f",
    },
    success: {
      main: "#4ade80",
    },
    error: {
      main: "#f87171",
    },
    info: {
      main: "#7dd3fc",
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
    MuiAlert: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(8, 24, 39, 0.9)",
          borderColor: "rgba(240, 179, 95, 0.38)",
          color: "#e5edf7",
          "&.MuiAlert-outlinedSuccess": {
            backgroundColor: "rgba(12, 38, 31, 0.86)",
            borderColor: "rgba(74, 222, 128, 0.42)",
            color: "#bbf7d0",
          },
          "&.MuiAlert-outlinedWarning": {
            backgroundColor: "rgba(42, 29, 12, 0.82)",
            borderColor: "rgba(240, 179, 95, 0.46)",
            color: "#ffd9a3",
          },
          "&.MuiAlert-outlinedError": {
            backgroundColor: "rgba(48, 18, 22, 0.86)",
            borderColor: "rgba(248, 113, 113, 0.46)",
            color: "#fecaca",
          },
          "&.MuiAlert-outlinedInfo": {
            backgroundColor: "rgba(8, 31, 48, 0.86)",
            borderColor: "rgba(125, 211, 252, 0.42)",
            color: "#bae6fd",
          },
        },
        icon: {
          color: "inherit",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 44,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
        rounded: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: "#081827",
          backgroundImage: "linear-gradient(180deg, rgba(8, 24, 39, 0.98), rgba(4, 15, 28, 0.98))",
          border: "1px solid rgba(96, 165, 250, 0.2)",
          boxShadow: "0 28px 90px rgba(0, 0, 0, 0.58)",
          color: "#e5edf7",
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: "rgba(1, 6, 14, 0.72)",
          backdropFilter: "blur(2px)",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: "#081827",
          backgroundImage: "none",
          border: "1px solid rgba(96, 165, 250, 0.22)",
          color: "#e5edf7",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          "&:hover": {
            backgroundColor: "rgba(96, 165, 250, 0.12)",
          },
          "&.Mui-selected": {
            backgroundColor: "rgba(96, 165, 250, 0.18)",
          },
          "&.Mui-selected:hover": {
            backgroundColor: "rgba(96, 165, 250, 0.24)",
          },
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: "#081827",
          backgroundImage: "none",
          border: "1px solid rgba(96, 165, 250, 0.22)",
          color: "#e5edf7",
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          color: "#9badbf",
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
