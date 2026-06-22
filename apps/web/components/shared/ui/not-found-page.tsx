"use client";

import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import { useLanguageStore } from "../../../stores/language-store";

/**
 * Renders the localized 404 screen with portal artwork and a return action.
 *
 * @returns Not-found page content for Next.js unmatched routes.
 */
export function NotFoundPage() {
  const t = useLanguageStore((state) => state.t);

  return (
    <Box
      component="main"
      sx={{
        alignItems: "center",
        backgroundImage: "linear-gradient(180deg, rgba(2, 8, 18, 0.08), rgba(2, 8, 18, 0.32)), url(/assets/imgs/%20404.png)",
        backgroundPosition: "center",
        backgroundSize: "cover",
        color: "#f7d68f",
        display: "flex",
        height: "100%",
        justifyContent: { xs: "center", md: "flex-end" },
        minHeight: 0,
        overflow: "hidden",
        p: { xs: 2, md: 5, lg: 7 },
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          alignItems: "center",
          display: "grid",
          gap: { xs: 2, md: 2.4 },
          justifyItems: "center",
          maxWidth: { xs: 720, md: 600, lg: 660 },
          mr: { md: "4vw", lg: "8vw" },
          transform: { xs: "none", md: "translateY(3vh)" },
          width: "100%",
        }}
      >
        <Box
          aria-hidden
          sx={{
            background: "linear-gradient(90deg, transparent, rgba(240, 179, 95, 0.9), transparent)",
            height: 1,
            position: "relative",
            width: "min(620px, 88%)",
          }}
        />

        <Box
          sx={{
            background: "linear-gradient(90deg, rgba(5, 13, 19, 0), rgba(5, 13, 19, 0.82) 18%, rgba(5, 13, 19, 0.82) 82%, rgba(5, 13, 19, 0))",
            borderBlock: "1px solid rgba(217, 169, 95, 0.72)",
            boxShadow: "0 18px 60px rgba(0, 0, 0, 0.36)",
            px: { xs: 2, md: 5 },
            py: { xs: 2.1, md: 2.8 },
            width: "100%",
          }}
        >
          <Typography
            component="h1"
            sx={{
              color: "#f7d68f",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: { xs: "1.55rem", sm: "2rem", md: "2.5rem" },
              fontWeight: 500,
              lineHeight: 1.12,
              textShadow: "0 3px 20px rgba(0, 0, 0, 0.86)",
            }}
          >
            {t.notFoundMessage}
          </Typography>
        </Box>

        <Box
          aria-hidden
          sx={{
            background: "linear-gradient(90deg, transparent, rgba(240, 179, 95, 0.78), transparent)",
            height: 1,
            position: "relative",
            width: "min(620px, 88%)",
          }}
        />

        <Button
          component={Link}
          href="/"
          sx={{
            background: "linear-gradient(180deg, #17486a, #0b2d46)",
            border: "2px solid #d9a95f",
            boxShadow: "inset 0 0 0 2px rgba(24, 65, 92, 0.9), 0 12px 32px rgba(0, 0, 0, 0.46), 0 0 18px rgba(96, 165, 250, 0.32)",
            color: "#f7d68f",
            fontFamily: "Georgia, 'Times New Roman', serif",
            fontSize: { xs: "1.02rem", sm: "1.35rem", md: "1.65rem" },
            fontWeight: 800,
            letterSpacing: 0.8,
            minHeight: { xs: 56, md: 72 },
            px: { xs: 3, sm: 5, md: 8 },
            position: "relative",
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.82)",
            textTransform: "uppercase",
            "&:hover": {
              background: "linear-gradient(180deg, #1e5b82, #0e3652)",
              borderColor: "#f0c978",
              boxShadow: "inset 0 0 0 2px rgba(24, 65, 92, 0.9), 0 14px 36px rgba(0, 0, 0, 0.5), 0 0 24px rgba(125, 211, 252, 0.42)",
            },
          }}
          variant="contained"
        >
          {t.notFoundReturn}
        </Button>
      </Box>
    </Box>
  );
}
