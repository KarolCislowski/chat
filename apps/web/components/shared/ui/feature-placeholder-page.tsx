import Link from "next/link";
import { Box, Button, Typography } from "@mui/material";
import { PageFrame } from "./page-frame";

interface FeaturePlaceholderPageProps {
  /** Decorative artwork shown as the page background. */
  backgroundUrl: string;
  /** Small label that identifies the future feature. */
  eyebrow: string;
  /** Main placeholder message. */
  title: string;
  /** Short supporting copy for the placeholder state. */
  body: string;
  /** Label for the return action. */
  actionLabel: string;
}

/**
 * Renders a portal-styled placeholder page for planned top-level features.
 *
 * @param props - Placeholder content and artwork.
 * @returns Full-page artwork with localized copy and a chat return action.
 */
export function FeaturePlaceholderPage({ actionLabel, backgroundUrl, body, eyebrow, title }: FeaturePlaceholderPageProps) {
  return (
    <PageFrame>
      <Box
        sx={{
          alignItems: "end",
          backgroundImage: `linear-gradient(90deg, rgba(2, 8, 18, 0.86), rgba(2, 8, 18, 0.42) 46%, rgba(2, 8, 18, 0.12)), url(${backgroundUrl})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
          border: "1px solid rgba(96, 165, 250, 0.18)",
          boxShadow: "inset 0 0 0 1px rgba(255, 255, 255, 0.03), 0 24px 80px rgba(0, 0, 0, 0.32)",
          display: "grid",
          minHeight: { xs: "calc(100vh - 140px)", md: "calc(100vh - 156px)" },
          overflow: "hidden",
          p: { xs: 2.5, md: 5, lg: 7 },
          position: "relative",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gap: 2,
            maxWidth: 620,
            pb: { xs: 1, md: 2 },
            position: "relative",
            zIndex: 1,
          }}
        >
          <Typography
            sx={{
              color: "#7dd3fc",
              fontSize: "0.78rem",
              fontWeight: 900,
              letterSpacing: 2.2,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </Typography>
          <Typography
            component="h1"
            sx={{
              color: "#f8fbff",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: { xs: "2.25rem", sm: "3rem", md: "4.25rem" },
              fontWeight: 700,
              lineHeight: 0.98,
              textShadow: "0 4px 26px rgba(0, 0, 0, 0.74)",
            }}
          >
            {title}
          </Typography>
          <Typography
            sx={{
              color: "#b9c8d9",
              fontSize: { xs: "1rem", md: "1.12rem" },
              lineHeight: 1.7,
              maxWidth: 520,
              textShadow: "0 2px 16px rgba(0, 0, 0, 0.78)",
            }}
          >
            {body}
          </Typography>
          <Box sx={{ display: "flex", mt: 1 }}>
            <Button
              component={Link}
              href="/"
              sx={{
                bgcolor: "rgba(14, 45, 73, 0.84)",
                border: "1px solid rgba(125, 211, 252, 0.58)",
                boxShadow: "0 0 24px rgba(56, 189, 248, 0.16)",
                color: "#dff4ff",
                fontWeight: 900,
                letterSpacing: 0.8,
                px: 3,
                py: 1.2,
                textTransform: "uppercase",
                "&:hover": {
                  bgcolor: "rgba(20, 74, 113, 0.92)",
                  borderColor: "rgba(186, 230, 253, 0.86)",
                },
              }}
              variant="contained"
            >
              {actionLabel}
            </Button>
          </Box>
        </Box>
      </Box>
    </PageFrame>
  );
}
