"use client";

import { memo } from "react";
import { Avatar, Box, Chip, Paper, Typography } from "@mui/material";
import { resolveAvatarPath } from "../../../lib/avatar-options";
import type { ChannelAppearance } from "../domain/appearance";
import type { UserAccount, UserProfile } from "../../../stores/auth-store";
import type { ChatView, Message } from "../../../stores/chat-store";

/** Props for a single rendered chat message. */
type MessageItemProps = {
  /** Current signed-in account, used to detect owned messages. */
  account: UserAccount | null;
  /** Active chat view used to decide whether channel badges are shown. */
  activeChannel: ChatView;
  /** Visual tokens for the message bubble. */
  appearance: ChannelAppearance;
  /**
   * Formats the source channel label for open-view messages.
   *
   * @param message - Message whose channel should be labeled.
   * @returns Human-readable channel label.
   */
  getMessageChannelLabel: (message: Message) => string;
  /** Active locale used by the timestamp formatter. */
  language: string;
  /** Message payload to render. */
  message: Message;
  /** Current user's profile, used for owned message display data. */
  profile: UserProfile | null;
  /** Translation dictionary used for fallback labels. */
  t: Record<string, string>;
};

function MessageItemComponent({ account, activeChannel, appearance, getMessageChannelLabel, language, message, profile, t }: MessageItemProps) {
  const isOwnMessage = message.senderId === account?.id;
  const author = isOwnMessage ? profile?.displayName ?? t.profile : message.sender?.displayName ?? message.senderId;
  const authorStatus = message.sender?.onlineStatus ?? (isOwnMessage ? profile?.onlineStatus : undefined);
  const authorAvatar = resolveAvatarPath(isOwnMessage ? profile?.avatarUrl : message.sender?.avatarUrl);
  const messageTime = new Intl.DateTimeFormat(language, {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(message.createdAt));

  return (
    <Box
      sx={{
        alignSelf: isOwnMessage ? "flex-end" : "flex-start",
        alignItems: "flex-end",
        display: "flex",
        flexDirection: isOwnMessage ? "row-reverse" : "row",
        gap: 1.35,
        maxWidth: 680,
        width: "min(680px, 100%)",
      }}
    >
      <Avatar
        src={authorAvatar}
        sx={{
          bgcolor: "#132337",
          border: `1px solid ${isOwnMessage ? appearance.messageBorder : "rgba(96, 165, 250, 0.3)"}`,
          flex: "0 0 auto",
          height: { xs: 44, md: 52 },
          width: { xs: 44, md: 52 },
        }}
      />
      <Paper
        component="article"
        elevation={isOwnMessage ? 0 : 3}
        sx={{
          bgcolor: isOwnMessage ? appearance.messageBg : "rgba(5, 17, 31, 0.82)",
          border: 1,
          borderColor: isOwnMessage ? appearance.messageBorder : "rgba(148, 163, 184, 0.16)",
          color: "#e5edf7",
          minWidth: 0,
          p: 2,
          width: "100%",
        }}
        variant="outlined"
      >
        <Box
          sx={{
            color: "text.secondary",
            display: "flex",
            fontSize: "0.82rem",
            gap: 1,
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Box component="span" sx={{ alignItems: "center", display: "inline-flex", gap: 0.75, minWidth: 0 }}>
            {activeChannel.type === "open" ? (
              <Chip
                label={getMessageChannelLabel(message)}
                size="small"
                sx={{
                  bgcolor: message.channelType === "guild" ? "#fff3df" : message.channelType === "whisper" ? "#eef4ff" : "#eafaf5",
                  color: message.channelType === "guild" ? "#7c3f0b" : message.channelType === "whisper" ? "#1d4ed8" : "#0f5f59",
                  flex: "0 0 auto",
                  fontSize: "0.68rem",
                  fontWeight: 700,
                  height: 22,
                }}
              />
            ) : null}
            <Box
              aria-hidden="true"
              component="span"
              sx={{
                bgcolor: authorStatus === "online" ? "primary.main" : "text.disabled",
                borderRadius: "50%",
                flex: "0 0 auto",
                height: 8,
                width: 8,
              }}
            />
            <Box
              component="span"
              sx={{
                border: 0,
                clip: "rect(0 0 0 0)",
                height: 1,
                m: -1,
                overflow: "hidden",
                p: 0,
                position: "absolute",
                whiteSpace: "nowrap",
                width: 1,
              }}
            >
              {authorStatus ? `Status: ${t[authorStatus] ?? authorStatus}.` : ""}
            </Box>
            <Typography component="span" sx={{ fontSize: "inherit", overflowWrap: "anywhere" }}>
              {author}
            </Typography>
          </Box>
          <Typography component="time" sx={{ flex: "0 0 auto", fontSize: "inherit" }}>
            {messageTime}
          </Typography>
        </Box>
        <Typography sx={{ lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{message.content}</Typography>
      </Paper>
    </Box>
  );
}

export const MessageItem = memo(MessageItemComponent);
