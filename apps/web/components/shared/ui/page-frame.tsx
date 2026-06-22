import { Box } from "@mui/material";
import { ReactNode } from "react";

/**
 * Provides the standard full-page spacing for non-chat feature pages.
 *
 * @param props - Frame props.
 * @param props.children - Feature page content.
 * @returns Main page wrapper with portal spacing and text color.
 */
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
