"use client";

import { MouseEvent } from "react";
import { Avatar, Box, IconButton, ListItemButton, ListItemText } from "@mui/material";
import { resolveAvatarPath } from "../../../lib/avatar-options";
import { ChatView } from "../../../stores/chat-store";
import type { ChatUser } from "../../../stores/user-store";
import { ChannelPrimary, railItemSx } from "./sidebar-rail";

type WhisperRailItemProps = {
  activeChannel: ChatView;
  disabled: boolean;
  onPlayerMenuOpen: (event: MouseEvent<HTMLButtonElement>, user: ChatUser) => void;
  onStartWhisper: (user: ChatUser) => void;
  unreadByChannel: Record<string, number>;
  user: ChatUser;
};

export function WhisperRailItem({ activeChannel, disabled, onPlayerMenuOpen, onStartWhisper, unreadByChannel, user }: WhisperRailItemProps) {
  const channel: ChatView = {
    recipientDisplayName: user.displayName,
    recipientId: user.accountId,
    type: "whisper",
  };
  const isSelected = activeChannel.type === "whisper" && activeChannel.recipientId === user.accountId;

  return (
    <ListItemButton disabled={disabled} key={user.accountId} onClick={() => onStartWhisper(user)} selected={isSelected} sx={railItemSx(isSelected, "#7dd3fc")}>
      <ListItemText
        primary={
          <Box component="span" sx={{ alignItems: "center", display: "flex", gap: 1, justifyContent: "space-between", minWidth: 0 }}>
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
            <IconButton
              aria-label={`${user.displayName} menu`}
              color="inherit"
              onClick={(event) => onPlayerMenuOpen(event, user)}
              size="small"
              sx={{ color: "#f8fafc", flex: "0 0 auto", height: 28, width: 28 }}
              type="button"
            >
              <Box component="span" sx={{ fontSize: "1rem", lineHeight: 1 }}>
                ...
              </Box>
            </IconButton>
          </Box>
        }
        slotProps={{ primary: { sx: { fontWeight: 700 } } }}
      />
    </ListItemButton>
  );
}
