"use client";

import Link from "next/link";
import { MouseEvent } from "react";
import { Box, Button, List, Typography } from "@mui/material";
import { ChatView } from "../../../stores/chat-store";
import type { Guild } from "../../../stores/guild-store";
import type { ChatUser } from "../../../stores/user-store";
import { GuildRailItem } from "./sidebar/guild-rail-item";
import { PlayerActionMenu } from "./sidebar/player-action-menu";
import { ChannelRailItem, SidebarSectionHeading } from "./sidebar/sidebar-rail";
import { WhisperRailItem } from "./sidebar/whisper-rail-item";

type ChatSidebarProps = {
  activeChannel: ChatView;
  guilds: Guild[];
  isAuthenticated: boolean;
  manageableGuilds: Guild[];
  onChannelChange: (channel: ChatView) => void;
  onInviteSelectedPlayer: (guildId: string) => void;
  onPlayerMenuClose: () => void;
  onPlayerMenuOpen: (event: MouseEvent<HTMLButtonElement>, user: ChatUser) => void;
  onStartWhisper: (user: ChatUser) => void;
  playerMenuAnchor: HTMLElement | null;
  selectedPlayer: ChatUser | null;
  t: Record<string, string>;
  unreadByChannel: Record<string, number>;
  users: ChatUser[];
};

export function ChatSidebar({
  activeChannel,
  guilds,
  isAuthenticated,
  manageableGuilds,
  onChannelChange,
  onInviteSelectedPlayer,
  onPlayerMenuClose,
  onPlayerMenuOpen,
  onStartWhisper,
  playerMenuAnchor,
  selectedPlayer,
  t,
  unreadByChannel,
  users,
}: ChatSidebarProps) {
  return (
    <Box
      component="aside"
      aria-label={t.conversations}
      sx={{
        background:
          "linear-gradient(180deg, rgba(3, 10, 20, 0.82), rgba(3, 10, 20, 0.68)), radial-gradient(circle at 50% 100%, rgba(37, 99, 235, 0.16), transparent 42%)",
        borderRight: { lg: "1px solid rgba(96, 165, 250, 0.16)" },
        color: "#f8fafc",
        display: "flex",
        flexDirection: "column",
        gap: 2.25,
        gridColumn: { xs: "1", lg: "1" },
        minHeight: 0,
        overflowY: "auto",
        p: { xs: 2.5, md: 2.25 },
      }}
    >
      <List aria-label={t.conversations} disablePadding sx={{ display: "grid", gap: 0.45 }}>
        <SidebarSectionHeading>Channels</SidebarSectionHeading>

        <ChannelRailItem
          accent="#60a5fa"
          activeChannel={activeChannel}
          avatarPath="/assets/imgs/open_avatar.png"
          channel={{ type: "open" }}
          disabled={!isAuthenticated}
          label={t.openChat}
          onChannelChange={onChannelChange}
          unreadByChannel={unreadByChannel}
        />

        <ChannelRailItem
          accent="#4ade80"
          activeChannel={activeChannel}
          avatarPath="/assets/imgs/global_avatar.png"
          channel={{ type: "global" }}
          disabled={!isAuthenticated}
          label={t.globalChat}
          onChannelChange={onChannelChange}
          unreadByChannel={unreadByChannel}
        />

        <SidebarSectionHeading actionHref="/guilds" hasTopMargin>
          {t.guilds}
        </SidebarSectionHeading>

        {guilds.map((guild) => (
          <GuildRailItem
            activeChannel={activeChannel}
            disabled={!isAuthenticated}
            guild={guild}
            key={guild._id}
            onChannelChange={onChannelChange}
            unreadByChannel={unreadByChannel}
          />
        ))}

        <SidebarSectionHeading hasTopMargin>{t.whisper}</SidebarSectionHeading>

        {users.length > 0 ? (
          users.map((user) => (
            <WhisperRailItem
              activeChannel={activeChannel}
              disabled={!isAuthenticated}
              key={user.accountId}
              onPlayerMenuOpen={onPlayerMenuOpen}
              onStartWhisper={onStartWhisper}
              unreadByChannel={unreadByChannel}
              user={user}
            />
          ))
        ) : (
          <Typography sx={{ color: "#b7c3cf", fontSize: "0.85rem" }}>{t.noUsers}</Typography>
        )}

        <PlayerActionMenu
          anchorEl={playerMenuAnchor}
          manageableGuilds={manageableGuilds}
          onClose={onPlayerMenuClose}
          onInviteSelectedPlayer={onInviteSelectedPlayer}
          onStartWhisper={onStartWhisper}
          selectedPlayer={selectedPlayer}
          t={t}
        />
      </List>

      <Box sx={{ flex: 1, minHeight: 28 }} />

      <Button
        component={Link}
        href="/guilds"
        sx={{
          borderColor: "rgba(96, 165, 250, 0.55)",
          color: "#7dd3fc",
          fontWeight: 800,
          letterSpacing: 0.5,
          py: 1.2,
          "&:hover": {
            borderColor: "#60a5fa",
            bgcolor: "rgba(96, 165, 250, 0.1)",
          },
        }}
        variant="outlined"
      >
        + {t.createGuild}
      </Button>
    </Box>
  );
}
