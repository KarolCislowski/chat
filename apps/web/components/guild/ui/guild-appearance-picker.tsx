"use client";

import { Box, Button, Tooltip } from "@mui/material";
import { getGuildFlagSet, guildFlagSets } from "../../../lib/guild-flags";
import type { GuildThemeColor } from "../../../lib/guild-flags";

/** Props for the guild theme color and emblem picker. */
type GuildAppearancePickerProps = {
  /** Whether controls should be disabled while saving or when access is read-only. */
  disabled: boolean;
  /** Currently selected guild emblem URL. */
  emblemUrl: string;
  /** Optional maximum height for the emblem grid. */
  maxHeight?: number;
  /**
   * Handles selecting a theme color or emblem.
   *
   * @param themeColor - Selected flag color set.
   * @param emblemUrl - Selected emblem asset URL.
   * @returns Nothing.
   */
  onChange: (themeColor: GuildThemeColor, emblemUrl: string) => void;
  /** Currently selected guild theme color. */
  themeColor: GuildThemeColor;
};

export function GuildAppearancePicker({
  disabled,
  emblemUrl,
  maxHeight = 146,
  onChange,
  themeColor,
}: GuildAppearancePickerProps) {
  const flagSet = getGuildFlagSet(themeColor);

  return (
    <Box sx={{ display: "grid", gap: 1.25 }}>
      <Box aria-label="Guild color" role="group" sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {guildFlagSets.map((set) => (
          <Button
            aria-label={`Select ${set.label} guild color`}
            aria-pressed={themeColor === set.label}
            disabled={disabled}
            key={set.label}
            onClick={() => onChange(set.label, set.paths[0])}
            sx={{
              bgcolor: set.accent,
              border: "1px solid",
              borderColor: themeColor === set.label ? "#f8fbff" : "rgba(255, 255, 255, 0.22)",
              boxShadow: themeColor === set.label ? `0 0 0 2px ${set.accent}55` : "none",
              height: 24,
              minWidth: 0,
              p: 0,
              width: 34,
              "&:hover": {
                bgcolor: set.accent,
                opacity: 0.86,
              },
            }}
            type="button"
          />
        ))}
      </Box>

      <Box
        aria-label={`${themeColor} guild emblems`}
        role="group"
        sx={{
          bgcolor: "rgba(2, 8, 18, 0.3)",
          border: "1px solid rgba(96, 165, 250, 0.14)",
          borderRadius: 1,
          display: "grid",
          gap: 0.8,
          gridTemplateColumns: "repeat(auto-fill, minmax(42px, 1fr))",
          maxHeight,
          overflowY: "auto",
          p: 1,
        }}
      >
        {flagSet.paths.map((flagPath, index) => {
          const isSelected = flagPath === emblemUrl;
          const emblemLabel = `Select ${flagSet.label} guild emblem ${index + 1}`;

          return (
            <Tooltip
              key={flagPath}
              placement="top"
              slotProps={{ tooltip: { sx: { bgcolor: "transparent", maxWidth: "none", p: 0 } } }}
              title={
                <Box sx={{ bgcolor: "rgba(2, 8, 18, 0.92)", border: `1px solid ${flagSet.accent}66`, borderRadius: 1, p: 1 }}>
                  <Box component="img" alt="" src={flagPath} sx={{ display: "block", height: 190, objectFit: "contain", width: 128 }} />
                </Box>
              }
            >
              <Box component="span" sx={{ display: "block" }}>
                <Button
                  aria-label={emblemLabel}
                  aria-pressed={isSelected}
                  disabled={disabled}
                  onClick={() => onChange(flagSet.label, flagPath)}
                  sx={{
                    bgcolor: isSelected ? "rgba(248, 251, 255, 0.08)" : "transparent",
                    border: "1px solid",
                    borderColor: isSelected ? `${flagSet.accent}` : "transparent",
                    borderRadius: 1,
                    minWidth: 0,
                    p: 0.35,
                    width: "100%",
                    "&:hover": {
                      bgcolor: "rgba(96, 165, 250, 0.1)",
                      borderColor: flagSet.accent,
                    },
                  }}
                  type="button"
                >
                  <Box component="img" alt="" src={flagPath} sx={{ display: "block", height: 52, objectFit: "contain", width: 34 }} />
                </Button>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
