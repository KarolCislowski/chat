"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import {
  Box,
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
import { languageLabels, UiLanguage } from "../i18n/translations";
import { useAuthStore } from "../stores/auth-store";
import { getChatChannelKey, useChatStore } from "../stores/chat-store";
import { useGuildStore } from "../stores/guild-store";
import { useLanguageStore } from "../stores/language-store";
import { useUserStore, type ChatUser } from "../stores/user-store";

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
  const connectRealtime = useChatStore((state) => state.connectRealtime);
  const disconnectRealtime = useChatStore((state) => state.disconnectRealtime);
  const loadHealth = useChatStore((state) => state.loadHealth);
  const loadMessages = useChatStore((state) => state.loadMessages);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const setActiveChannel = useChatStore((state) => state.setActiveChannel);
  const setComposeChannel = useChatStore((state) => state.setComposeChannel);
  const setCurrentAccountId = useChatStore((state) => state.setCurrentAccountId);
  const setDraft = useChatStore((state) => state.setDraft);
  const guilds = useGuildStore((state) => state.guilds);
  const guildError = useGuildStore((state) => state.error);
  const inviteMember = useGuildStore((state) => state.inviteMember);
  const loadGuilds = useGuildStore((state) => state.loadGuilds);
  const users = useUserStore((state) => state.users);
  const usersError = useUserStore((state) => state.error);
  const loadUsers = useUserStore((state) => state.loadUsers);
  const account = useAuthStore((state) => state.account);
  const getFreshAccessToken = useAuthStore((state) => state.getFreshAccessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const profile = useAuthStore((state) => state.profile);
  const tokens = useAuthStore((state) => state.tokens);
  const updateLanguagePreference = useAuthStore((state) => state.updateLanguagePreference);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.t);
  const languageFlags: Record<UiLanguage, string> = {
    en: "🇬🇧",
    pl: "🇵🇱",
    sv: "🇸🇪",
  };

  useEffect(() => {
    void loadHealth(apiBaseUrl);
  }, [apiBaseUrl, loadHealth]);

  useEffect(() => {
    if (profile?.language && profile.language !== language) {
      setLanguage(profile.language);
    }
  }, [language, profile?.language, setLanguage]);

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
      return {
        accent: "#f0b35f",
        badgeBg: "rgba(240, 179, 95, 0.15)",
        badgeColor: "#ffd9a3",
        label: t.guilds,
        messageBg: "rgba(240, 179, 95, 0.13)",
        messageBorder: "rgba(240, 179, 95, 0.34)",
        pageBg: "rgba(12, 17, 26, 0.78)",
        softBg: "rgba(240, 179, 95, 0.09)",
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
  }, [activeChannel.type, t.globalChat, t.guilds, t.openChat, t.whisper]);
  const composeAppearance = useMemo(() => {
    if (composeChannel.type === "guild") {
      return {
        accent: "#b56a1f",
        badgeColor: "#7c3f0b",
        messageBorder: "rgba(181, 106, 31, 0.32)",
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
  }, [composeChannel.type]);
  const manageableGuilds = useMemo(() => guilds.filter((guild) => ["owner", "officer"].includes(guild.membership.role ?? "")), [guilds]);
  const onlineUsers = useMemo(() => users.filter((user) => user.onlineStatus !== "offline"), [users]);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<HTMLElement | null>(null);
  const [playerMenuAnchor, setPlayerMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<ChatUser | null>(null);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    setCurrentAccountId(account?.id ?? null);
  }, [account?.id, setCurrentAccountId]);

  useEffect(() => {
    let isCancelled = false;

    if (!isAuthenticated || !tokens?.accessToken) {
      disconnectRealtime();
      return;
    }

    async function startChat() {
      const accessToken = await getFreshAccessToken(apiBaseUrl);

      if (isCancelled || !accessToken) {
        disconnectRealtime();
        return;
      }

      void loadGuilds(apiBaseUrl, accessToken);
      void loadUsers(apiBaseUrl, accessToken);
      connectRealtime(apiBaseUrl, accessToken);
    }

    void startChat();

    return () => {
      isCancelled = true;
      disconnectRealtime();
    };
  }, [apiBaseUrl, connectRealtime, disconnectRealtime, getFreshAccessToken, isAuthenticated, loadGuilds, loadUsers, tokens?.accessToken]);

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

  function handleAccountMenuOpen(event: MouseEvent<HTMLButtonElement>) {
    setAccountMenuAnchor(event.currentTarget);
  }

  function handleAccountMenuClose() {
    setAccountMenuAnchor(null);
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

  function renderChannelPrimary(label: string, channel: Parameters<typeof setActiveChannel>[0]) {
    const unreadCount = unreadByChannel[getChatChannelKey(channel)] ?? 0;

    return (
      <Box
        component="span"
        sx={{ alignItems: "center", columnGap: 1.75, display: "flex", flex: "1 1 auto", justifyContent: "space-between", minWidth: 0 }}
      >
        <Box component="span" sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {label}
        </Box>
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

  function renderRailPrimary(label: string, channel: Parameters<typeof setActiveChannel>[0], icon: string, iconColor = "#60a5fa") {
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

  function railItemSx(isSelected: boolean, accent = "#60a5fa") {
    return {
      border: "1px solid transparent",
      borderLeft: `3px solid ${isSelected ? accent : "transparent"}`,
      borderRadius: 1,
      color: "inherit",
      display: "grid",
      gap: 0.35,
      minHeight: 54,
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

  function handleLanguageChange(event: SelectChangeEvent<UiLanguage>) {
    const nextLanguage = event.target.value as UiLanguage;
    setLanguage(nextLanguage);

    if (isAuthenticated) {
      void updateLanguagePreference(apiBaseUrl, nextLanguage);
    }
  }

  return (
    <Box
      component="main"
      sx={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.22), transparent 34%), linear-gradient(135deg, #04101d 0%, #071827 52%, #020812 100%)",
        color: "#e5edf7",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "320px minmax(0, 1fr) 320px" },
        gridTemplateRows: { xs: "auto auto auto auto", lg: "92px minmax(0, 1fr)" },
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box
        component="header"
        sx={{
          alignItems: "center",
          backdropFilter: "blur(18px)",
          bgcolor: "rgba(3, 10, 20, 0.76)",
          borderBottom: "1px solid rgba(96, 165, 250, 0.18)",
          display: "grid",
          gridColumn: { xs: "1", lg: "1 / 4" },
          gridTemplateColumns: { xs: "1fr", md: "280px minmax(0, 1fr) auto" },
          minHeight: 92,
          px: { xs: 2.5, md: 4 },
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", gap: 2 }}>
          <Box
            sx={{
              alignItems: "center",
              border: "1px solid rgba(240, 179, 95, 0.68)",
              color: "#f0b35f",
              display: "flex",
              fontSize: "1.35rem",
              fontWeight: 800,
              height: 46,
              justifyContent: "center",
              width: 38,
            }}
          >
            DS
          </Box>
          <Box>
            <Typography sx={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: 1.4, lineHeight: 1 }}>
              Dworven Shaft
            </Typography>
            <Typography sx={{ color: "#8ca3ba", fontSize: "0.78rem", letterSpacing: 2, mt: 0.4 }}>
              {t.socialHub}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", minHeight: 92 }}>
          {[
            { href: null, key: "play", label: t.play },
            { href: null, key: "social", label: t.social },
            { href: "/profile", key: "profile", label: t.profile },
            { href: "/guilds", key: "guild", label: t.guilds },
            { href: null, key: "shop", label: t.shop },
          ].map((item) => (
            <Box
              component={item.href ? Link : "span"}
              href={item.href ?? undefined}
              key={item.key}
              sx={{
                alignItems: "center",
                borderBottom: item.key === "social" ? "2px solid #60a5fa" : "2px solid transparent",
                boxShadow: item.key === "social" ? "inset 0 -18px 24px rgba(96, 165, 250, 0.16)" : "none",
                color: item.key === "social" ? "#f8fbff" : "#9badbf",
                display: "flex",
                fontWeight: 700,
                letterSpacing: 1.3,
                px: 3,
                textDecoration: "none",
                textTransform: "uppercase",
              }}
            >
              {item.label}
            </Box>
          ))}
        </Box>

        <Box sx={{ alignItems: "center", display: "flex", gap: 2, justifyContent: { xs: "flex-start", md: "flex-end" }, py: { xs: 2, md: 0 } }}>
          <FormControl size="small" sx={{ minWidth: 82 }}>
            <Select
              aria-label={t.language}
              onChange={handleLanguageChange}
              renderValue={(value) => {
                const languageCode = value as UiLanguage;
                return `${languageFlags[languageCode]} ${languageCode.toUpperCase()}`;
              }}
              sx={{
                bgcolor: "rgba(2, 8, 18, 0.32)",
                color: "#c7d5e6",
                fontSize: "0.82rem",
                fontWeight: 800,
                height: 36,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(148, 163, 184, 0.18)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(96, 165, 250, 0.36)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(96, 165, 250, 0.64)",
                },
              }}
              value={language}
            >
              {(Object.keys(languageLabels) as UiLanguage[]).map((languageCode) => (
                <MenuItem key={languageCode} value={languageCode}>
                  {languageFlags[languageCode]} {languageCode.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Chip label={connectionStatus} size="small" sx={{ bgcolor: "rgba(96, 165, 250, 0.16)", color: "#bfdbfe", fontWeight: 700 }} />
          {isAuthenticated ? (
            <>
              <Button
                aria-controls={accountMenuAnchor ? "account-menu" : undefined}
                aria-haspopup="true"
                onClick={handleAccountMenuOpen}
                sx={{
                  borderRadius: 1,
                  color: "#e5edf7",
                  gap: 1.25,
                  justifyContent: "flex-start",
                  px: 1,
                  py: 0.75,
                  textTransform: "none",
                }}
                type="button"
              >
                <Box sx={{ bgcolor: "#132337", border: "1px solid rgba(96, 165, 250, 0.35)", borderRadius: "50%", height: 44, width: 44 }} />
                <Box sx={{ textAlign: "left" }}>
                  <Typography sx={{ fontWeight: 800, lineHeight: 1 }}>{profile?.displayName ?? "Player"}</Typography>
                  <Typography sx={{ color: "#78d88f", fontSize: "0.8rem" }}>{profile?.onlineStatus ?? "offline"}</Typography>
                </Box>
              </Button>
              <Menu
                anchorEl={accountMenuAnchor}
                id="account-menu"
                onClose={handleAccountMenuClose}
                open={Boolean(accountMenuAnchor)}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: "#081827",
                      border: "1px solid rgba(96, 165, 250, 0.22)",
                      color: "#e5edf7",
                      minWidth: 180,
                    },
                  },
                }}
              >
                <MenuItem component={Link} href="/profile" onClick={handleAccountMenuClose}>
                  {t.profile}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleAccountMenuClose();
                    void logout(apiBaseUrl);
                  }}
                >
                  {t.logout}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button component={Link} href="/auth" size="small" sx={{ color: "#bfdbfe", borderColor: "rgba(96, 165, 250, 0.28)" }} variant="outlined">
              {t.login}
            </Button>
          )}
        </Box>
      </Box>

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
          gridRow: { xs: "2", lg: "2" },
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
              secondary={t.conversations}
              slotProps={{
                primary: { sx: { fontWeight: 700 } },
                secondary: { sx: { color: "#b7c3cf", fontSize: "0.85rem" } },
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
              secondary={isAuthenticated ? t.local : t.conversationRequiresLogin}
              slotProps={{
                primary: { sx: { fontWeight: 700 } },
                secondary: { sx: { color: "#b7c3cf", fontSize: "0.85rem" } },
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
              sx={railItemSx(activeChannel.type === "guild" && activeChannel.guildId === guild._id, "#f0b35f")}
            >
              <ListItemText
                primary={renderRailPrimary(guild.name, { guildId: guild._id, type: "guild" }, "♜", "#f0b35f")}
                secondary={`${guild.members.length} members`}
                slotProps={{
                  primary: { sx: { fontWeight: 700 } },
                  secondary: { sx: { color: "#b7c3cf", fontSize: "0.85rem" } },
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
                      {renderRailPrimary(user.displayName, {
                        recipientDisplayName: user.displayName,
                        recipientId: user.accountId,
                        type: "whisper",
                      }, "●", "#7dd3fc")}
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
          gridRow: { xs: "3", lg: "2" },
          gridTemplateRows: "auto minmax(0, 1fr) auto",
          minHeight: 0,
          minWidth: 0,
          p: { xs: 2.5, md: 4 },
        }}
      >
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
                py: 3.5,
              }}
            >
              {messages.map((message) => {
                const isOwnMessage = message.senderId === account?.id;
                const author = isOwnMessage ? profile?.displayName ?? t.profile : message.sender?.displayName ?? message.senderId;
                const authorStatus = message.sender?.onlineStatus ?? (isOwnMessage ? profile?.onlineStatus : undefined);
                const messageTime = new Intl.DateTimeFormat(language, {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(message.createdAt));

                return (
                  <Paper
                    component="article"
                    elevation={isOwnMessage ? 0 : 3}
                    key={message._id}
                    sx={{
                      alignSelf: isOwnMessage ? "flex-end" : "flex-start",
                      bgcolor: isOwnMessage ? channelAppearance.messageBg : "rgba(5, 17, 31, 0.82)",
                      border: 1,
                      borderColor: isOwnMessage ? channelAppearance.messageBorder : "rgba(148, 163, 184, 0.16)",
                      color: "#e5edf7",
                      maxWidth: 680,
                      p: 2,
                      width: "min(680px, 100%)",
                    }}
                    variant="outlined"
                  >
                    <Box
                      sx={{
                        color: "text.secondary",
                        display: "flex",
                        fontSize: "0.82rem",
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
                      <Typography component="time" sx={{ fontSize: "inherit" }}>
                        {messageTime}
                      </Typography>
                    </Box>
                    <Typography sx={{ lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{message.content}</Typography>
                  </Paper>
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
          gridRow: { xs: "4", lg: "2" },
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
                    <Box sx={{ bgcolor: "#132337", border: "1px solid rgba(96, 165, 250, 0.35)", borderRadius: "50%", height: 40, width: 40 }} />
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
