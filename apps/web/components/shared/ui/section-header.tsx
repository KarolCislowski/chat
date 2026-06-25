import { Box, Typography } from "@mui/material";
import { portalColors } from "../domain/portal-theme";

type SectionHeaderProps = {
  /** Small uppercase label above the title. */
  eyebrow?: string;
  /** Main section heading. */
  title: string;
  /** Optional supporting copy. */
  description?: string;
  /** Heading element for semantic hierarchy. */
  titleComponent?: "h1" | "h2" | "h3";
};

/**
 * Renders the repeated portal heading pattern used by feature pages.
 *
 * @param props - Header labels and semantic heading level.
 * @returns Eyebrow, title, and optional description block.
 */
export function SectionHeader({ description, eyebrow, title, titleComponent = "h2" }: SectionHeaderProps) {
  return (
    <Box sx={{ display: "grid", gap: 0.5 }}>
      {eyebrow ? (
        <Typography sx={{ color: portalColors.accentSoft, fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase" }}>
          {eyebrow}
        </Typography>
      ) : null}
      <Typography component={titleComponent} sx={{ color: portalColors.textStrong, fontSize: titleComponent === "h1" ? "1.9rem" : "1.55rem", fontWeight: 800, lineHeight: 1.1 }}>
        {title}
      </Typography>
      {description ? <Typography sx={{ color: "#9badbf", mt: 0.25 }}>{description}</Typography> : null}
    </Box>
  );
}
