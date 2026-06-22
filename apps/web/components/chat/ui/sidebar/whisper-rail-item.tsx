"use client";

import { memo, MouseEvent } from "react";
import { Avatar, Box, IconButton, ListItemButton, ListItemText } from "@mui/material";
import { resolveAvatarPath } from "../../../../lib/avatar-options";
import { ChatView } from "../../../../stores/chat-store";
import type { ChatUser } from "../../../../stores/user-store";
import { ChannelPrimary, railItemSx } from "./sidebar-rail";

/** Props for one whisper conversation entry in the sidebar rail. */
type WhisperRailItemProps = {
  /** Channel currently displayed in the main chat panel. */
  activeChannel: ChatView;
  /** Whether this item should be disabled for unauthenticated users. */
  disabled: boolean;
  /**
   * Opens the contextual player action menu.
   *
   * @param event - Button click event used as the menu anchor.
   * @param user - Player represented by this whisper item.
   * @returns Nothing.
   */
  onPlayerMenuOpen: (event: MouseEvent<HTMLButtonElement>, user: ChatUser) => void;
  /**
   * Opens or focuses the whisper channel for this player.
   *
   * @param user - Player represented by this whisper item.
   * @returns Nothing.
   */
  onStartWhisper: (user: ChatUser) => void;
  /** Unread counters keyed by chat channel. */
  unreadByChannel: Record<string, number>;
  /** Player represented by this rail item. */
  user: ChatUser;
};

function WhisperRailItemComponent({ activeChannel, disabled, onPlayerMenuOpen, onStartWhisper, unreadByChannel, user }: WhisperRailItemProps) {
  const channel: ChatView = {
    recipientDisplayName: user.displayName,
    recipientId: user.accountId,
    type: "whisper",
  };
  const isSelected = activeChannel.type === "whisper" && activeChannel.recipientId === user.accountId;

  return (
    <Box
      component="li"
      key={user.accountId}
      sx={{
        ...railItemSx(isSelected, "#7dd3fc"),
        alignItems: "center",
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) 32px",
        listStyle: "none",
        "&.Mui-selected": undefined,
        ...(isSelected
          ? {
              background: "linear-gradient(90deg, rgba(37, 99, 235, 0.22), rgba(37, 99, 235, 0.04))",
              borderColor: "rgba(96, 165, 250, 0.22)",
              borderLeftColor: "#7dd3fc",
            }
          : {}),
      }}
    >
      <ListItemButton
        aria-current={isSelected ? "page" : undefined}
        disabled={disabled}
        onClick={() => onStartWhisper(user)}
        sx={{ color: "inherit", minWidth: 0, p: 0, "&:hover": { bgcolor: "transparent" } }}
      >
        <ListItemText
          primary={
            <Box component="span" sx={{ alignItems: "center", display: "flex", gap: 1.4, minWidth: 0 }}>
              <Avatar
                src={resolveAvatarPath(user.avatarUrl)}
                sx={{
                  bgcolor: "#132337",
                  border: "1px solid rgba(125, 211, 252, 0.42)",
                  flex: "0 0 auto",
                  height: 44,
                  width: 44,
                }}
              />
              <ChannelPrimary channel={channel} label={user.displayName} unreadByChannel={unreadByChannel} />
            </Box>
          }
          slotProps={{ primary: { sx: { fontWeight: 700 } } }}
        />
      </ListItemButton>
      <IconButton
        aria-label={`Open actions menu for ${user.displayName}`}
        color="inherit"
        disabled={disabled}
        onClick={(event) => onPlayerMenuOpen(event, user)}
        size="small"
        sx={{ color: "#f8fafc", height: 28, justifySelf: "end", width: 28 }}
        type="button"
      >
        <Box aria-hidden component="span" sx={{ fontSize: "1rem", lineHeight: 1 }}>
          ...
        </Box>
      </IconButton>
    </Box>
  );
}

export const WhisperRailItem = memo(WhisperRailItemComponent);
