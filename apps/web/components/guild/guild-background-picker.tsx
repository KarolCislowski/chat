"use client";

import { Box, Button, Tooltip } from "@mui/material";
import { guildBackgroundOptions, resolveGuildBackgroundUrl } from "../../lib/guild-flags";

type GuildBackgroundPickerProps = {
  backgroundUrl: string;
  disabled: boolean;
  minColumnWidth?: number;
  onChange: (backgroundUrl: string) => void;
};

export function GuildBackgroundPicker({
  backgroundUrl,
  disabled,
  minColumnWidth = 96,
  onChange,
}: GuildBackgroundPickerProps) {
  const resolvedBackgroundUrl = resolveGuildBackgroundUrl(backgroundUrl);

  return (
    <Box
      sx={{
        bgcolor: "rgba(2, 8, 18, 0.3)",
        border: "1px solid rgba(96, 165, 250, 0.14)",
        borderRadius: 1,
        display: "grid",
        gap: 0.8,
        gridTemplateColumns: `repeat(auto-fill, minmax(${minColumnWidth}px, 1fr))`,
        p: 1,
      }}
    >
      {guildBackgroundOptions.map((option) => {
        const isSelected = option === resolvedBackgroundUrl;

        return (
          <Tooltip
            key={option}
            placement="top"
            slotProps={{ tooltip: { sx: { bgcolor: "transparent", maxWidth: "none", p: 0 } } }}
            title={
              <Box sx={{ bgcolor: "rgba(2, 8, 18, 0.92)", border: "1px solid rgba(96, 165, 250, 0.38)", borderRadius: 1, p: 1 }}>
                <Box component="img" alt="" src={option} sx={{ display: "block", height: 180, objectFit: "cover", width: 320 }} />
              </Box>
            }
          >
            <Box component="span" sx={{ display: "block" }}>
              <Button
                aria-label={option}
                disabled={disabled}
                onClick={() => onChange(option)}
                sx={{
                  aspectRatio: "16 / 9",
                  backgroundImage: `linear-gradient(180deg, rgba(3, 10, 20, 0.08), rgba(3, 10, 20, 0.38)), url(${option})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  border: "1px solid",
                  borderColor: isSelected ? "#f8fbff" : "rgba(96, 165, 250, 0.16)",
                  borderRadius: 1,
                  boxShadow: isSelected ? "0 0 0 2px rgba(96, 165, 250, 0.32)" : "none",
                  minWidth: 0,
                  overflow: "hidden",
                  p: 0,
                  width: "100%",
                  "&:hover": {
                    borderColor: "#60a5fa",
                    filter: "brightness(1.08)",
                  },
                }}
                type="button"
              />
            </Box>
          </Tooltip>
        );
      })}
    </Box>
  );
}
