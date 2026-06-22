"use client";

import { Avatar, Box, Chip, Paper, Typography } from "@mui/material";
import { resolveAvatarPath } from "../../../lib/avatar-options";
import type { ChannelAppearance } from "../domain/appearance";
import type { UserAccount, UserProfile } from "../../../stores/auth-store";
import type { ChatView, Message } from "../../../stores/chat-store";

type MessageItemProps = {
  account: UserAccount | null;
  activeChannel: ChatView;
  appearance: ChannelAppearance;
  getMessageChannelLabel: (message: Message) => string;
  language: string;
  message: Message;
  profile: UserProfile | null;
  t: Record<string, string>;
};

export function MessageItem({ account, activeChannel, appearance, getMessageChannelLabel, language, message, profile, t }: MessageItemProps) {
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
              component="span"
              sx={{
                bgcolor: authorStatus === "online" ? "primary.main" : "text.disabled",
                borderRadius: "50%",
                flex: "0 0 auto",
                height: 8,
                width: 8,
              }}
            />
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
