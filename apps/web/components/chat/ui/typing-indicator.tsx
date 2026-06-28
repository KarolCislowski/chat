"use client";

import { keyframes } from "@mui/system";
import { Box, Typography } from "@mui/material";
import type { ComposeAppearance } from "../domain/appearance";
import type { TypingIndicator as TypingIndicatorData } from "../../../stores/chat-store";

const typingBounce = keyframes`
  0%, 80%, 100% {
    opacity: 0.35;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-4px);
  }
`;

type TypingIndicatorProps = {
  /** Visual tokens for the active compose destination. */
  appearance: ComposeAppearance;
  /** Active typing users visible in the current chat view. */
  indicators: TypingIndicatorData[];
  /** Translation dictionary used for the visible label. */
  t: Record<string, string>;
};

/**
 * Renders the classic animated ellipsis for users typing in the current channel.
 *
 * @param props - Appearance tokens, typing users, and translations.
 * @returns Inline typing indicator, or null when nobody is typing.
 */
export function TypingIndicator({ appearance, indicators, t }: TypingIndicatorProps) {
  if (indicators.length === 0) {
    return null;
  }

  const visibleNames = indicators.slice(0, 2).map((indicator) => indicator.displayName);
  const names = visibleNames.join(", ");
  const template = indicators.length === 1 ? t.typingIndicatorSingle : t.typingIndicatorMultiple;
  const label = template.replace("{name}", names).replace("{count}", String(indicators.length));

  return (
    <Box
      aria-live="polite"
      sx={{
        alignItems: "center",
        color: appearance.accent,
        display: "flex",
        gap: 1,
        minHeight: 22,
        px: 0.5,
      }}
    >
      <Typography sx={{ color: "#9badbf", fontSize: "0.82rem", fontWeight: 700 }}>{label}</Typography>
      <Box aria-hidden="true" sx={{ alignItems: "center", display: "inline-flex", gap: 0.45 }}>
        {[0, 1, 2].map((dotIndex) => (
          <Box
            key={dotIndex}
            sx={{
              animation: `${typingBounce} 1.1s ease-in-out ${dotIndex * 0.14}s infinite`,
              bgcolor: appearance.accent,
              borderRadius: "50%",
              height: 6,
              width: 6,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
