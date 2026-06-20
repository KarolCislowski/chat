import { Box } from "@mui/material";
import { ReactNode } from "react";

export function PageFrame({ children }: { children: ReactNode }) {
  return (
    <Box
      component="main"
      sx={{
        color: "#e5edf7",
        display: "grid",
        minHeight: "100%",
        p: { xs: 2.5, md: 4 },
      }}
    >
      {children}
    </Box>
  );
}
