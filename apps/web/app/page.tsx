"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, MouseEvent, ReactNode, useEffect, useMemo, useState } from "react";
import {
  Box,
  Avatar,
  Button,
  Chip,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Alert,
  Badge,
} from "@mui/material";
import { useAuthStore } from "../stores/auth-store";
import { resolveAvatarPath } from "../lib/avatar-options";
import { getGuildThemeAccent, resolveGuildBackgroundUrl, resolveGuildEmblemUrl } from "../lib/guild-flags";
import { getChatChannelKey, useChatStore } from "../stores/chat-store";
import { Guild, useGuildStore } from "../stores/guild-store";
import { useLanguageStore } from "../stores/language-store";
import { useUserStore, type ChatUser } from "../stores/user-store";

function hexToRgba(hexColor: string, alpha: number) {
  const normalizedHex = hexColor.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export default function Home() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  const activeChannel = useChatStore((state) => state.activeChannel);
  const composeChannel = useChatStore((state) => state.composeChannel);
  const draft = useChatStore((state) => state.draft);
  const connectionError = useChatStore((state) => state.connectionError);
  const connectionStatus = useChatStore((state) => state.connectionStatus);
  const health = useChatStore((state) => state.health);
  const healthError = useChatStore((state) => state.healthError);
  const messages = useChatStore((state) => state.messages);
  const unreadByChannel = useChatStore((state) => state.unreadByChannel);
  const loadHealth = useChatStore((state) => state.loadHealth);
  const loadMessages = useChatStore((state) => state.loadMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const setActiveChannel = useChatStore((state) => state.setActiveChannel);
  const setComposeChannel = useChatStore((state) => state.setComposeChannel);
  const setDraft = useChatStore((state) => state.setDraft);
  const guilds = useGuildStore((state) => state.guilds);
  const guildError = useGuildStore((state) => state.error);
  const inviteMember = useGuildStore((state) => state.inviteMember);
  const users = useUserStore((state) => state.users);
  const usersError = useUserStore((state) => state.error);
  const account = useAuthStore((state) => state.account);
  const getFreshAccessToken = useAuthStore((state) => state.getFreshAccessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const profile = useAuthStore((state) => state.profile);
  const tokens = useAuthStore((state) => state.tokens);
  const language = useLanguageStore((state) => state.language);
  const t = useLanguageStore((state) => state.t);

  useEffect(() => {
    void loadHealth(apiBaseUrl);
  }, [apiBaseUrl, loadHealth]);

  const apiStatus = useMemo(() => {
    if (health?.status === "ok" && health.database === "connected") {
      return t.apiConnected;
    }

    if (health?.status === "ok") {
      return t.apiNoDatabase;
    }

    return t.apiDisconnected;
  }, [health, t]);

  const isApiConnected = health?.status === "ok" && health.database === "connected";
  const isAuthenticated = Boolean(profile && tokens?.accessToken);
  const activeGuild = activeChannel.type === "guild" ? guilds.find((guild) => guild._id === activeChannel.guildId) : null;
  const composeGuild = composeChannel.type === "guild" ? guilds.find((guild) => guild._id === composeChannel.guildId) : null;
  const activeGuildBackgroundUrl = activeGuild ? resolveGuildBackgroundUrl(activeGuild.backgroundUrl) : null;
  const activeChannelTitle =
    activeChannel.type === "open" ? t.openChat : activeChannel.type === "whisper" ? activeChannel.recipientDisplayName : activeGuild?.name ?? t.globalChat;
  const channelAppearance = useMemo(() => {
    if (activeChannel.type === "open") {
      return {
        accent: "#60a5fa",
        badgeBg: "rgba(96, 165, 250, 0.16)",
        badgeColor: "#bfdbfe",
        label: t.openChat,
        messageBg: "rgba(96, 165, 250, 0.13)",
        messageBorder: "rgba(96, 165, 250, 0.34)",
        pageBg: "rgba(4, 15, 28, 0.72)",
        softBg: "rgba(96, 165, 250, 0.08)",
      };
    }

    if (activeChannel.type === "guild") {
      const accent = getGuildThemeAccent(activeGuild?.themeColor);

      return {
        accent,
        badgeBg: hexToRgba(accent, 0.16),
        badgeColor: accent,
        label: t.guilds,
        messageBg: hexToRgba(accent, 0.13),
        messageBorder: hexToRgba(accent, 0.36),
        pageBg: "rgba(12, 17, 26, 0.78)",
        softBg: hexToRgba(accent, 0.09),
      };
    }

    if (activeChannel.type === "whisper") {
      return {
        accent: "#7dd3fc",
        badgeBg: "rgba(125, 211, 252, 0.15)",
        badgeColor: "#bae6fd",
        label: t.whisper,
        messageBg: "rgba(125, 211, 252, 0.12)",
        messageBorder: "rgba(125, 211, 252, 0.32)",
        pageBg: "rgba(4, 18, 32, 0.78)",
        softBg: "rgba(125, 211, 252, 0.08)",
      };
    }

    return {
      accent: "#4ade80",
      badgeBg: "rgba(74, 222, 128, 0.14)",
      badgeColor: "#bbf7d0",
      label: t.globalChat,
      messageBg: "rgba(74, 222, 128, 0.11)",
      messageBorder: "rgba(74, 222, 128, 0.3)",
      pageBg: "rgba(3, 22, 20, 0.72)",
      softBg: "rgba(74, 222, 128, 0.07)",
    };
  }, [activeChannel.type, activeGuild?.themeColor, t.globalChat, t.guilds, t.openChat, t.whisper]);
  const composeAppearance = useMemo(() => {
    if (composeChannel.type === "guild") {
      const accent = getGuildThemeAccent(composeGuild?.themeColor);

      return {
        accent,
        badgeColor: accent,
        messageBorder: hexToRgba(accent, 0.32),
      };
    }

    if (composeChannel.type === "whisper") {
      return {
        accent: "#2563eb",
        badgeColor: "#1d4ed8",
        messageBorder: "rgba(37, 99, 235, 0.28)",
      };
    }

    return {
      accent: "#0f766e",
      badgeColor: "#0f5f59",
      messageBorder: "rgba(20, 108, 95, 0.24)",
    };
  }, [composeChannel.type, composeGuild?.themeColor]);
  const manageableGuilds = useMemo(() => guilds.filter((guild) => ["owner", "officer"].includes(guild.membership.role ?? "")), [guilds]);
  const onlineUsers = useMemo(() => users.filter((user) => user.onlineStatus !== "offline"), [users]);
  const [playerMenuAnchor, setPlayerMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<ChatUser | null>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    let isCancelled = false;

    if (!isAuthenticated || !tokens?.accessToken) {
      return;
    }

    async function loadActiveChannelMessages() {
      const accessToken = await getFreshAccessToken(apiBaseUrl);

      if (isCancelled || !accessToken) {
        return;
      }

      void loadMessages(apiBaseUrl, accessToken);
    }

    void loadActiveChannelMessages();

    return () => {
      isCancelled = true;
    };
  }, [apiBaseUrl, activeChannel, getFreshAccessToken, isAuthenticated, loadMessages, tokens?.accessToken]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (!text) {
      return;
    }

    sendMessage(text);
  }

  function handleChannelChange(channel: Parameters<typeof setActiveChannel>[0]) {
    setActiveChannel(channel);
  }

  function getComposeChannelValue(channel: typeof composeChannel) {
    return getChatChannelKey(channel);
  }

  function handleComposeChannelChange(event: SelectChangeEvent<string>) {
    const channelKey = event.target.value;

    if (channelKey === "global") {
      setComposeChannel({ type: "global" });
      return;
    }

    if (channelKey.startsWith("guild:")) {
      const guildId = channelKey.replace("guild:", "");
      const guild = guilds.find((guild) => guild._id === guildId);

      if (guild) {
        setComposeChannel({ guildId: guild._id, type: "guild" });
      }
      return;
    }

    if (channelKey.startsWith("whisper:")) {
      const recipientId = channelKey.replace("whisper:", "");
      const user = users.find((user) => user.accountId === recipientId);

      if (user) {
        setComposeChannel({
          recipientDisplayName: user.displayName,
          recipientId: user.accountId,
          type: "whisper",
        });
      }
    }
  }

  function getMessageChannelLabel(message: (typeof messages)[number]) {
    if (message.channelType === "global") {
      return t.globalChat;
    }

    if (message.channelType === "guild") {
      return guilds.find((guild) => guild._id === message.guildId)?.name ?? t.guilds;
    }

    return t.whisper;
  }

  function handlePlayerMenuOpen(event: MouseEvent<HTMLButtonElement>, user: ChatUser) {
    event.stopPropagation();
    setSelectedPlayer(user);
    setPlayerMenuAnchor(event.currentTarget);
  }

  function handlePlayerMenuClose() {
    setPlayerMenuAnchor(null);
    setSelectedPlayer(null);
  }

  function startWhisper(user: ChatUser) {
    handleChannelChange({
      recipientDisplayName: user.displayName,
      recipientId: user.accountId,
      type: "whisper",
    });
    handlePlayerMenuClose();
  }

  async function inviteSelectedPlayer(guildId: string) {
    if (!selectedPlayer) {
      return;
    }

    const player = selectedPlayer;
    handlePlayerMenuClose();

    const accessToken = await getFreshAccessToken(apiBaseUrl);

    if (!accessToken) {
      return;
    }

    await inviteMember(apiBaseUrl, accessToken, guildId, player.accountId);
  }

  function renderChannelPrimary(label: string, channel: Parameters<typeof setActiveChannel>[0], endAdornment?: ReactNode) {
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

  function renderRailPrimary(label: string, channel: Parameters<typeof setActiveChannel>[0], icon: ReactNode, iconColor = "#60a5fa") {
    return (
      <Box component="span" sx={{ alignItems: "center", display: "flex", gap: 1.4, minWidth: 0 }}>
        <Box
          component="span"
          sx={{
            alignItems: "center",
            bgcolor: "rgba(2, 8, 18, 0.34)",
            border: `1px solid ${iconColor}66`,
            color: iconColor,
            display: "flex",
            flex: "0 0 auto",
            fontSize: "0.9rem",
            fontWeight: 800,
            height: 34,
            justifyContent: "center",
            width: 34,
          }}
        >
          {icon}
        </Box>
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

  return (
    <Box
      component="main"
      sx={{
        color: "#e5edf7",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "320px minmax(0, 1fr) 320px" },
        height: "100%",
        overflow: "hidden",
      }}
    >
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
        <Box>
          <Typography color="#8aa3b5" sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
            {t.chat}
          </Typography>
          <Typography component="h1" sx={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.1 }}>
            {t.conversations}
          </Typography>
        </Box>

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
            onClick={() => handleChannelChange({ type: "open" })}
            selected={isAuthenticated && activeChannel.type === "open"}
            sx={railItemSx(isAuthenticated && activeChannel.type === "open", "#60a5fa")}
          >
            <ListItemText
              primary={renderRailPrimary(t.openChat, { type: "open" }, "O", "#60a5fa")}
              slotProps={{
                primary: { sx: { fontWeight: 700 } },
              }}
            />
          </ListItemButton>

          <ListItemButton
            disabled={!isAuthenticated}
            onClick={() => handleChannelChange({ type: "global" })}
            selected={isAuthenticated && activeChannel.type === "global"}
            sx={railItemSx(isAuthenticated && activeChannel.type === "global", "#4ade80")}
          >
            <ListItemText
              primary={renderRailPrimary(t.globalChat, { type: "global" }, "◎", "#4ade80")}
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
              onClick={() => handleChannelChange({ guildId: guild._id, type: "guild" })}
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
                onClick={() => startWhisper(user)}
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
                        onClick={(event) => handlePlayerMenuOpen(event, user)}
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
                  secondary={user.onlineStatus}
                  slotProps={{
                    primary: { sx: { fontWeight: 700 } },
                    secondary: { sx: { color: "#b7c3cf", fontSize: "0.85rem" } },
                  }}
                />
              </ListItemButton>
            ))
          ) : (
            <Typography sx={{ color: "#b7c3cf", fontSize: "0.85rem" }}>{t.noUsers}</Typography>
          )}

          <Menu
            anchorEl={playerMenuAnchor}
            onClose={handlePlayerMenuClose}
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
            {selectedPlayer ? <MenuItem onClick={() => startWhisper(selectedPlayer)}>{t.startWhisper}</MenuItem> : null}
            {selectedPlayer
              ? manageableGuilds
                  .filter((guild) => !guild.members.includes(selectedPlayer.accountId))
                  .map((guild) => (
                    <MenuItem key={guild._id} onClick={() => void inviteSelectedPlayer(guild._id)}>
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

      <Box
        component="section"
        id="current"
        aria-label={activeChannelTitle}
        sx={{
          bgcolor: channelAppearance.pageBg,
          borderLeft: "1px solid rgba(96, 165, 250, 0.08)",
          borderRight: { lg: "1px solid rgba(96, 165, 250, 0.08)" },
          display: "grid",
          gridColumn: { xs: "1", lg: "2" },
          gridTemplateRows: activeGuild ? "auto minmax(0, 1fr) auto" : "auto minmax(0, 1fr) auto",
          minHeight: 0,
          minWidth: 0,
          p: { xs: 2.5, md: 4 },
          rowGap: activeGuild ? 2.25 : 0,
        }}
      >
        {!activeGuild ? (
          <Box
            component="header"
            sx={{
              bgcolor: channelAppearance.softBg,
              border: "1px solid rgba(96, 165, 250, 0.14)",
              borderBottom: 3,
              borderColor: channelAppearance.accent,
              borderRadius: 1,
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: 2.5,
              justifyContent: "space-between",
              p: 2.25,
            }}
          >
            <Box>
              <Typography color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                {t.workspace}
              </Typography>
              <Typography component="h2" sx={{ color: channelAppearance.accent, fontSize: "1.45rem", fontWeight: 700, lineHeight: 1.2 }}>
                {activeChannelTitle}
              </Typography>
              <Chip
                label={channelAppearance.label}
                size="small"
                sx={{
                  bgcolor: channelAppearance.badgeBg,
                  color: channelAppearance.badgeColor,
                  fontWeight: 700,
                  mt: 1,
                }}
              />
            </Box>

            <Box sx={{ alignItems: { xs: "flex-start", md: "center" }, display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip
                color={connectionStatus === "connected" ? "primary" : "warning"}
                label={connectionStatus}
                sx={{ fontWeight: 700, maxWidth: "100%" }}
                variant="outlined"
              />
              <Chip
                color={isApiConnected ? "primary" : "warning"}
                label={apiStatus}
                sx={{ fontWeight: 700, maxWidth: "100%" }}
                variant="outlined"
              />
            </Box>
          </Box>
        ) : null}

        {activeGuild ? (
          <Box
            component="section"
            sx={{
              alignItems: "center",
              backgroundImage: `linear-gradient(90deg, rgba(3, 10, 20, 0.9) 0%, rgba(3, 10, 20, 0.58) 52%, rgba(3, 10, 20, 0.22) 100%), url(${activeGuildBackgroundUrl})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              border: `1px solid ${channelAppearance.messageBorder}`,
              borderRadius: 1,
              boxShadow: `inset 0 -56px 90px rgba(2, 8, 18, 0.42), 0 18px 44px rgba(0, 0, 0, 0.22)`,
              display: "grid",
              gap: { xs: 1.5, sm: 2.5 },
              gridTemplateColumns: { xs: "74px minmax(0, 1fr)", md: "116px minmax(0, 1fr) auto" },
              minHeight: { xs: 234, md: 282 },
              overflow: "hidden",
              p: { xs: 2, md: 2.5 },
              position: "relative",
            }}
          >
            <Box
              component="img"
              alt=""
              src={resolveGuildEmblemUrl(activeGuild.emblemUrl, activeGuild.themeColor)}
              sx={{
                alignSelf: "stretch",
                filter: "drop-shadow(0 16px 24px rgba(0, 0, 0, 0.54))",
                height: "100%",
                maxHeight: { xs: 195, md: 246 },
                objectFit: "contain",
                width: { xs: 70, md: 108 },
              }}
            />

            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ color: channelAppearance.accent, fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>
                {t.guilds}
              </Typography>
              <Typography
                component="h3"
                sx={{
                  color: "#f8fbff",
                  fontSize: { xs: "1.45rem", md: "2rem" },
                  fontWeight: 800,
                  lineHeight: 1.1,
                  mt: 0.5,
                  overflowWrap: "anywhere",
                  textShadow: "0 2px 18px rgba(0, 0, 0, 0.68)",
                }}
              >
                {activeGuild.name}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.25 }}>
                <Chip
                  label={`${activeGuild.members.length} ${t.members}`}
                  size="small"
                  sx={{ bgcolor: hexToRgba(channelAppearance.accent, 0.18), color: "#f8fbff", fontWeight: 800 }}
                />
                <Chip
                  label={`/${activeGuild.slug}`}
                  size="small"
                  sx={{ bgcolor: "rgba(2, 8, 18, 0.42)", color: "#bfdbfe", fontWeight: 700 }}
                />
              </Box>
            </Box>

            <Button
              component={Link}
              href="/guilds"
              sx={{
                alignSelf: "center",
                borderColor: hexToRgba(channelAppearance.accent, 0.72),
                color: "#f8fbff",
                display: { xs: "none", md: "inline-flex" },
                fontWeight: 800,
                justifySelf: "end",
                px: 3,
                textTransform: "none",
                "&:hover": {
                  bgcolor: hexToRgba(channelAppearance.accent, 0.12),
                  borderColor: channelAppearance.accent,
                },
              }}
              variant="outlined"
            >
              {t.guilds}
            </Button>
          </Box>
        ) : null}

        {isAuthenticated ? (
          <>
            <Box
              aria-live="polite"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.75,
                minHeight: 0,
                overflowY: "auto",
                py: activeGuild ? 1.5 : 3.5,
              }}
            >
              {messages.map((message) => {
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
                    key={message._id}
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
                        border: `1px solid ${isOwnMessage ? channelAppearance.messageBorder : "rgba(96, 165, 250, 0.3)"}`,
                        flex: "0 0 auto",
                        height: { xs: 44, md: 52 },
                        width: { xs: 44, md: 52 },
                      }}
                    />
                    <Paper
                      component="article"
                      elevation={isOwnMessage ? 0 : 3}
                      sx={{
                        bgcolor: isOwnMessage ? channelAppearance.messageBg : "rgba(5, 17, 31, 0.82)",
                        border: 1,
                        borderColor: isOwnMessage ? channelAppearance.messageBorder : "rgba(148, 163, 184, 0.16)",
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
                                bgcolor:
                                  message.channelType === "guild" ? "#fff3df" : message.channelType === "whisper" ? "#eef4ff" : "#eafaf5",
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
              })}

              {connectionError ? (
                <Alert severity="warning" variant="outlined">
                  {connectionError}
                </Alert>
              ) : null}

              {healthError ? (
                <Alert severity="warning" variant="outlined">
                  {healthError}
                </Alert>
              ) : null}

              {usersError ? (
                <Alert severity="warning" variant="outlined">
                  {usersError}
                </Alert>
              ) : null}

              {guildError ? (
                <Alert severity="warning" variant="outlined">
                  {guildError}
                </Alert>
              ) : null}
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Divider sx={{ borderColor: composeAppearance.messageBorder, mb: 2.5 }} />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.25,
                }}
              >
                {activeChannel.type === "open" ? (
                  <FormControl sx={{ minWidth: { sm: 180 } }}>
                    <InputLabel id="compose-channel-label" sx={{ color: composeAppearance.accent, "&.Mui-focused": { color: composeAppearance.accent } }}>
                      {t.sendTo}
                    </InputLabel>
                    <Select
                      label={t.sendTo}
                      labelId="compose-channel-label"
                      onChange={handleComposeChannelChange}
                      sx={{
                        color: composeAppearance.accent,
                        fontWeight: 700,
                        bgcolor: "rgba(2, 8, 18, 0.3)",
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: composeAppearance.messageBorder,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: composeAppearance.accent,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: composeAppearance.accent,
                        },
                      }}
                      value={getComposeChannelValue(composeChannel)}
                    >
                      <MenuItem value="global">{t.globalChat}</MenuItem>
                      {guilds.map((guild) => (
                        <MenuItem key={guild._id} value={`guild:${guild._id}`}>
                          {guild.name}
                        </MenuItem>
                      ))}
                      {users.map((user) => (
                        <MenuItem key={user.accountId} value={`whisper:${user.accountId}`}>
                          {t.whisper}: {user.displayName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : null}
                <TextField
                  fullWidth
                  id="message"
                  label={t.message}
                  name="message"
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={t.typeMessage}
                  sx={{
                    "& .MuiOutlinedInput-input": {
                      color: composeAppearance.accent,
                    },
                    "& .MuiOutlinedInput-root": {
                      bgcolor: "rgba(2, 8, 18, 0.3)",
                    },
                    "& .MuiOutlinedInput-root fieldset": {
                      borderColor: composeAppearance.messageBorder,
                    },
                    "& .MuiOutlinedInput-root:hover fieldset": {
                      borderColor: composeAppearance.accent,
                    },
                    "& .MuiOutlinedInput-root.Mui-focused fieldset": {
                      borderColor: composeAppearance.accent,
                    },
                    "& .MuiInputLabel-root": {
                      color: composeAppearance.accent,
                    },
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: composeAppearance.accent,
                    },
                  }}
                  value={draft}
                />
                <Button
                  disabled={connectionStatus !== "connected"}
                  sx={{
                    bgcolor: composeAppearance.accent,
                    minWidth: { sm: 120 },
                    "&:hover": {
                      bgcolor: composeAppearance.badgeColor,
                    },
                  }}
                  type="submit"
                  variant="contained"
                >
                  {t.send}
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
              minHeight: 0,
              py: 3.5,
            }}
          >
            <Paper
              sx={{
                maxWidth: 520,
                p: 3,
                textAlign: "center",
                width: "100%",
              }}
              variant="outlined"
            >
              <Typography component="h3" sx={{ fontSize: "1.35rem", fontWeight: 700, mb: 1 }}>
                {t.chatLockedTitle}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.55 }}>
                {t.chatLockedBody}
              </Typography>
              <Button component={Link} href="/auth" sx={{ mt: 2.5 }} variant="contained">
                {t.login}
              </Button>
            </Paper>
          </Box>
        )}
      </Box>

      <Box
        component="aside"
        aria-label={t.onlinePlayers}
        sx={{
          bgcolor: "rgba(3, 10, 20, 0.62)",
          color: "#e5edf7",
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          gridColumn: { xs: "1", lg: "3" },
          minHeight: 0,
          overflowY: "auto",
          p: { xs: 2.5, md: 3 },
        }}
      >
        <Paper
          elevation={0}
          sx={{
            bgcolor: "rgba(5, 17, 31, 0.76)",
            border: "1px solid rgba(96, 165, 250, 0.16)",
            color: "inherit",
            p: 2.25,
          }}
          variant="outlined"
        >
          <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", mb: 2 }}>
            <Typography sx={{ color: "#c7d5e6", fontSize: "0.78rem", fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>
              {t.onlinePlayers} - {onlineUsers.length}
            </Typography>
          </Box>

          <TextField
            disabled
            fullWidth
            placeholder="Search friends..."
            size="small"
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                bgcolor: "rgba(2, 8, 18, 0.58)",
                color: "#90a4ba",
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(148, 163, 184, 0.18)",
              },
            }}
          />

          <Box sx={{ display: "grid", gap: 1.2 }}>
            {onlineUsers.length > 0 ? (
              onlineUsers.map((user) => (
                <Box
                  key={user.accountId}
                  sx={{
                    alignItems: "center",
                    borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                    display: "grid",
                    gap: 1.25,
                    gridTemplateColumns: "40px minmax(0, 1fr) 32px",
                    pb: 1.15,
                  }}
                >
                  <Box sx={{ position: "relative" }}>
                    <Avatar
                      src={resolveAvatarPath(user.avatarUrl)}
                      sx={{
                        bgcolor: "#132337",
                        border: "1px solid rgba(96, 165, 250, 0.35)",
                        height: 40,
                        width: 40,
                      }}
                    />
                    <Box
                      sx={{
                        bgcolor: user.onlineStatus === "online" ? "#22c55e" : user.onlineStatus === "busy" ? "#f59e0b" : "#60a5fa",
                        border: "2px solid #06111e",
                        borderRadius: "50%",
                        bottom: 0,
                        height: 12,
                        position: "absolute",
                        right: 0,
                        width: 12,
                      }}
                    />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.displayName}</Typography>
                    <Typography sx={{ color: user.onlineStatus === "online" ? "#78d88f" : "#f0b35f", fontSize: "0.82rem" }}>
                      {user.onlineStatus}
                    </Typography>
                  </Box>
                  <IconButton
                    aria-label={`${user.displayName} menu`}
                    color="inherit"
                    onClick={(event) => handlePlayerMenuOpen(event, user)}
                    size="small"
                    sx={{ color: "#f0b35f" }}
                    type="button"
                  >
                    ...
                  </IconButton>
                </Box>
              ))
            ) : (
              <Typography sx={{ color: "#8ca3ba", fontSize: "0.9rem" }}>{t.noOnlinePlayers}</Typography>
            )}
          </Box>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            bgcolor: "rgba(5, 17, 31, 0.58)",
            border: "1px solid rgba(96, 165, 250, 0.14)",
            color: "inherit",
            p: 2.25,
          }}
          variant="outlined"
        >
          <Typography sx={{ color: "#c7d5e6", fontSize: "0.78rem", fontWeight: 800, letterSpacing: 1.4, mb: 1.5, textTransform: "uppercase" }}>
            {t.apiTitle}
          </Typography>
          <Chip label={apiStatus} size="small" sx={{ bgcolor: isApiConnected ? "rgba(34, 197, 94, 0.14)" : "rgba(245, 158, 11, 0.14)", color: isApiConnected ? "#86efac" : "#fcd34d", fontWeight: 700 }} />
        </Paper>
      </Box>
    </Box>
  );
}
