"use client";

import Link from "next/link";
import { memo, ReactNode } from "react";
import { Badge, Box, IconButton, ListItemButton, ListItemText, Typography } from "@mui/material";
import { ChatView, getChatChannelKey } from "../../../../stores/chat-store";

/**
 * Builds shared styles for selectable sidebar rail items.
 *
 * @param isSelected - Whether the rail item represents the active channel.
 * @param accent - Accent color used for selection borders and highlights.
 * @returns MUI sx object for a rail item.
 */
export function railItemSx(isSelected: boolean, accent = "#60a5fa") {
  return {
    border: "1px solid transparent",
    borderLeft: `3px solid ${isSelected ? accent : "transparent"}`,
    borderRadius: 1,
    color: "inherit",
    display: "grid",
    gap: 0.35,
    minHeight: 62,
    px: 1.3,
    py: 0.85,
    transition: "background-color 140ms ease, border-color 140ms ease",
    "&:hover": {
      bgcolor: "rgba(96, 165, 250, 0.07)",
    },
    "&.Mui-selected": {
      background: "linear-gradient(90deg, rgba(37, 99, 235, 0.22), rgba(37, 99, 235, 0.04))",
      borderColor: "rgba(96, 165, 250, 0.22)",
      borderLeftColor: accent,
    },
    "&.Mui-selected:hover": {
      bgcolor: "rgba(37, 99, 235, 0.16)",
    },
  };
}

/** Props for a labeled sidebar section header with an optional action link. */
type SectionHeadingProps = {
  actionHref?: string;
  actionLabel?: string;
  children: ReactNode;
  hasTopMargin?: boolean;
};

export function SidebarSectionHeading({ actionHref, actionLabel, children, hasTopMargin = false }: SectionHeadingProps) {
  return (
    <Box
      sx={{
        alignItems: "center",
        borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
        display: "flex",
        justifyContent: "space-between",
        mb: 1,
        mt: hasTopMargin ? 2.2 : 0,
        pb: 1,
      }}
    >
      <Typography
        sx={{
          color: "#aab9ca",
          fontSize: "0.74rem",
          fontWeight: 800,
          letterSpacing: 1.4,
          textTransform: "uppercase",
        }}
      >
        {children}
      </Typography>
      {actionHref ? (
        <IconButton
          aria-label={actionLabel ?? "Open section action"}
          component={Link}
          href={actionHref}
          size="small"
          sx={{ bgcolor: "rgba(96, 165, 250, 0.1)", color: "#bfdbfe", height: 28, width: 28 }}
        >
          +
        </IconButton>
      ) : null}
    </Box>
  );
}

type ChannelPrimaryProps = {
  channel: ChatView;
  endAdornment?: ReactNode;
  label: string;
  unreadByChannel: Record<string, number>;
};

/**
 * Renders a channel label with unread count and optional right-side adornment.
 *
 * @param props - Channel label, unread counters, and optional adornment.
 * @returns Sidebar primary label content.
 */
export function ChannelPrimary({ channel, endAdornment, label, unreadByChannel }: ChannelPrimaryProps) {
  const unreadCount = unreadByChannel[getChatChannelKey(channel)] ?? 0;

  return (
    <Box component="span" sx={{ alignItems: "center", columnGap: 1.75, display: "flex", flex: "1 1 auto", justifyContent: "space-between", minWidth: 0 }}>
      <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {label}
      </Box>
      {endAdornment}
      {unreadCount > 0 ? (
        <Badge badgeContent={unreadCount > 99 ? "99+" : unreadCount} color="primary" sx={{ flex: "0 0 auto", ml: 1, mr: 1 }} />
      ) : null}
    </Box>
  );
}

/** Props for global/open channel rail items. */
type ChannelRailItemProps = {
  accent: string;
  activeChannel: ChatView;
  avatarPath: string;
  channel: ChatView;
  disabled: boolean;
  label: string;
  onChannelChange: (channel: ChatView) => void;
  unreadByChannel: Record<string, number>;
};

function ChannelRailItemComponent({ accent, activeChannel, avatarPath, channel, disabled, label, onChannelChange, unreadByChannel }: ChannelRailItemProps) {
  const isSelected = !disabled && activeChannel.type === channel.type;

  return (
    <ListItemButton disabled={disabled} onClick={() => onChannelChange(channel)} selected={isSelected} sx={railItemSx(isSelected, accent)}>
      <ListItemText
        primary={
          <Box component="span" sx={{ alignItems: "center", display: "flex", gap: 1.4, minWidth: 0 }}>
            <Box
              component="img"
              alt=""
              src={avatarPath}
              sx={{
                bgcolor: "rgba(2, 8, 18, 0.34)",
                border: `1px solid ${accent}44`,
                borderRadius: "50%",
                display: "block",
                flex: "0 0 auto",
                height: 44,
                objectFit: "cover",
                width: 44,
              }}
            />
            <ChannelPrimary channel={channel} label={label} unreadByChannel={unreadByChannel} />
          </Box>
        }
        slotProps={{ primary: { sx: { fontWeight: 700 } } }}
      />
    </ListItemButton>
  );
}

export const ChannelRailItem = memo(ChannelRailItemComponent);
