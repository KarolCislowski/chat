"use client";

import { memo } from "react";
import { Box, Typography } from "@mui/material";
import type { ChannelAppearance } from "../domain/appearance";
import type { SystemNotice } from "../../../stores/chat-store";

type SystemNoticeItemProps = {
  /** Visual tokens for the active channel. */
  appearance: ChannelAppearance;
  /** Locale used by the timestamp formatter. */
  language: string;
  /** UI-only presence notice to render. */
  notice: SystemNotice;
  /** Translation dictionary used for the notice text. */
  t: Record<string, string>;
};

/**
 * Renders a subtle, transient presence notice inside the message timeline.
 *
 * @param props - Notice payload, appearance tokens, locale, and translations.
 * @returns Centered timeline separator for login/logout events.
 */
function SystemNoticeItemComponent({ appearance, language, notice, t }: SystemNoticeItemProps) {
  const noticeTime = new Intl.DateTimeFormat(language, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(notice.createdAt));
  const template = notice.type === "login" ? t.systemNoticeLogin : t.systemNoticeLogout;
  const message = template.replace("{name}", notice.displayName);

  return (
    <Box
      role="status"
      sx={{
        alignItems: "center",
        alignSelf: "center",
        color: notice.type === "login" ? "#a7f3d0" : "#9badbf",
        display: "flex",
        gap: 1.25,
        maxWidth: "min(520px, 100%)",
        opacity: 0.88,
        px: 1,
        width: "100%",
      }}
    >
      <Box
        sx={{
          background: `linear-gradient(90deg, transparent, ${appearance.messageBorder})`,
          flex: "1 1 auto",
          height: "1px",
          opacity: 0.58,
        }}
      />
      <Typography
        component="span"
        sx={{
          bgcolor: "rgba(2, 8, 18, 0.42)",
          border: `1px solid ${appearance.messageBorder}`,
          borderRadius: 999,
          color: "inherit",
          flex: "0 0 auto",
          fontSize: "0.76rem",
          fontWeight: 800,
          px: 1.35,
          py: 0.55,
          textAlign: "center",
          whiteSpace: "nowrap",
        }}
      >
        {message}
        <Box component="span" sx={{ color: "#70859d", fontWeight: 700, ml: 0.75 }}>
          {noticeTime}
        </Box>
      </Typography>
      <Box
        sx={{
          background: `linear-gradient(90deg, ${appearance.messageBorder}, transparent)`,
          flex: "1 1 auto",
          height: "1px",
          opacity: 0.58,
        }}
      />
    </Box>
  );
}

export const SystemNoticeItem = memo(SystemNoticeItemComponent);
