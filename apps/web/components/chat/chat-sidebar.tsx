import Link from "next/link";
import { MouseEvent, ReactNode } from "react";
import { Avatar, Badge, Box, Button, IconButton, List, ListItemButton, ListItemText, Menu, MenuItem, Typography } from "@mui/material";
import { resolveAvatarPath } from "../../lib/avatar-options";
import { getGuildThemeAccent, resolveGuildEmblemUrl } from "../../lib/guild-flags";
import { ChatView, getChatChannelKey } from "../../stores/chat-store";
import { Guild } from "../../stores/guild-store";
import { ChatUser } from "../../stores/user-store";

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

function railItemSx(isSelected: boolean, accent = "#60a5fa") {
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
  function renderChannelPrimary(label: string, channel: ChatView, endAdornment?: ReactNode) {
    const unreadCount = unreadByChannel[getChatChannelKey(channel)] ?? 0;

    return (
      <Box
        component="span"
        sx={{ alignItems: "center", columnGap: 1.75, display: "flex", flex: "1 1 auto", justifyContent: "space-between", minWidth: 0 }}
      >
        <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </Box>
        {endAdornment}
        {unreadCount > 0 ? (
          <Badge
            badgeContent={unreadCount > 99 ? "99+" : unreadCount}
            color="primary"
            sx={{ flex: "0 0 auto", ml: 1, mr: 1 }}
          />
        ) : null}
      </Box>
    );
  }

  function renderChannelAvatarRailPrimary(label: string, channel: ChatView, avatarPath: string, accent: string) {
    return (
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
        {renderChannelPrimary(label, channel)}
      </Box>
    );
  }

  function renderWhisperRailPrimary(user: ChatUser) {
    return (
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
        {renderChannelPrimary(user.displayName, {
          recipientDisplayName: user.displayName,
          recipientId: user.accountId,
          type: "whisper",
        })}
      </Box>
    );
  }

  function renderGuildRailPrimary(guild: Guild) {
    const accent = getGuildThemeAccent(guild.themeColor);

    return (
      <Box component="span" sx={{ alignItems: "stretch", display: "flex", gap: 1.35, minHeight: 68, minWidth: 0 }}>
        <Box
          component="img"
          alt=""
          src={resolveGuildEmblemUrl(guild.emblemUrl, guild.themeColor)}
          sx={{
            alignSelf: "stretch",
            display: "block",
            flex: "0 0 auto",
            filter: `drop-shadow(0 0 8px ${accent}55)`,
            height: 68,
            objectFit: "contain",
            width: 44,
          }}
        />
        <Box component="span" sx={{ alignItems: "center", display: "flex", flex: "1 1 auto", minWidth: 0 }}>
          {renderChannelPrimary(
            guild.name,
            { guildId: guild._id, type: "guild" },
            <Box component="span" sx={{ color: "#b7c3cf", flex: "0 0 auto", fontSize: "0.78rem", fontWeight: 700 }}>
              {guild.members.length}
            </Box>,
          )}
        </Box>
      </Box>
    );
  }

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
        <Typography
          sx={{
            borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
            color: "#aab9ca",
            fontSize: "0.74rem",
            fontWeight: 800,
            letterSpacing: 1.4,
            mb: 1,
            pb: 1,
            textTransform: "uppercase",
          }}
        >
          Channels
        </Typography>

        <ListItemButton
          disabled={!isAuthenticated}
          onClick={() => onChannelChange({ type: "open" })}
          selected={isAuthenticated && activeChannel.type === "open"}
          sx={railItemSx(isAuthenticated && activeChannel.type === "open", "#60a5fa")}
        >
          <ListItemText
            primary={renderChannelAvatarRailPrimary(t.openChat, { type: "open" }, "/assets/imgs/open_avatar.png", "#60a5fa")}
            slotProps={{
              primary: { sx: { fontWeight: 700 } },
            }}
          />
        </ListItemButton>

        <ListItemButton
          disabled={!isAuthenticated}
          onClick={() => onChannelChange({ type: "global" })}
          selected={isAuthenticated && activeChannel.type === "global"}
          sx={railItemSx(isAuthenticated && activeChannel.type === "global", "#4ade80")}
        >
          <ListItemText
            primary={renderChannelAvatarRailPrimary(t.globalChat, { type: "global" }, "/assets/imgs/global_avatar.png", "#4ade80")}
            slotProps={{
              primary: { sx: { fontWeight: 700 } },
            }}
          />
        </ListItemButton>

        <Box sx={{ alignItems: "center", borderBottom: "1px solid rgba(148, 163, 184, 0.14)", display: "flex", justifyContent: "space-between", mb: 1, mt: 2.2, pb: 1 }}>
          <Typography
            sx={{
              color: "#aab9ca",
              fontSize: "0.74rem",
              fontWeight: 800,
              letterSpacing: 1.4,
              textTransform: "uppercase",
            }}
          >
            {t.guilds}
          </Typography>
          <IconButton component={Link} href="/guilds" size="small" sx={{ bgcolor: "rgba(96, 165, 250, 0.1)", color: "#bfdbfe", height: 28, width: 28 }}>
            +
          </IconButton>
        </Box>

        {guilds.map((guild) => (
          <ListItemButton
            disabled={!isAuthenticated}
            key={guild._id}
            onClick={() => onChannelChange({ guildId: guild._id, type: "guild" })}
            selected={activeChannel.type === "guild" && activeChannel.guildId === guild._id}
            sx={{
              ...railItemSx(activeChannel.type === "guild" && activeChannel.guildId === guild._id, getGuildThemeAccent(guild.themeColor)),
              minHeight: 72,
              overflow: "hidden",
              py: 0,
            }}
          >
            <ListItemText
              primary={renderGuildRailPrimary(guild)}
              slotProps={{
                primary: { sx: { fontWeight: 700 } },
              }}
            />
          </ListItemButton>
        ))}

        <Typography
          sx={{
            borderBottom: "1px solid rgba(148, 163, 184, 0.14)",
            color: "#aab9ca",
            fontSize: "0.74rem",
            fontWeight: 800,
            letterSpacing: 1.4,
            mb: 1,
            mt: 2.2,
            pb: 1,
            textTransform: "uppercase",
          }}
        >
          {t.whisper}
        </Typography>

        {users.length > 0 ? (
          users.map((user) => (
            <ListItemButton
              disabled={!isAuthenticated}
              key={user.accountId}
              onClick={() => onStartWhisper(user)}
              selected={activeChannel.type === "whisper" && activeChannel.recipientId === user.accountId}
              sx={railItemSx(activeChannel.type === "whisper" && activeChannel.recipientId === user.accountId, "#7dd3fc")}
            >
              <ListItemText
                primary={
                  <Box component="span" sx={{ alignItems: "center", display: "flex", gap: 1, justifyContent: "space-between", minWidth: 0 }}>
                    {renderWhisperRailPrimary(user)}
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
                slotProps={{
                  primary: { sx: { fontWeight: 700 } },
                }}
              />
            </ListItemButton>
          ))
        ) : (
          <Typography sx={{ color: "#b7c3cf", fontSize: "0.85rem" }}>{t.noUsers}</Typography>
        )}

        <Menu
          anchorEl={playerMenuAnchor}
          onClose={onPlayerMenuClose}
          open={Boolean(playerMenuAnchor)}
          slotProps={{
            paper: {
              sx: {
                bgcolor: "#081827",
                border: "1px solid rgba(96, 165, 250, 0.22)",
                color: "#e5edf7",
              },
            },
          }}
        >
          {selectedPlayer ? <MenuItem onClick={() => onStartWhisper(selectedPlayer)}>{t.startWhisper}</MenuItem> : null}
          {selectedPlayer
            ? manageableGuilds
                .filter((guild) => !guild.members.includes(selectedPlayer.accountId))
                .map((guild) => (
                  <MenuItem key={guild._id} onClick={() => onInviteSelectedPlayer(guild._id)}>
                    {t.inviteToGuild} {guild.name}
                  </MenuItem>
                ))
            : null}
        </Menu>
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
