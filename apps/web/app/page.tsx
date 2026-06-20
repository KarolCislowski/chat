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
        accent: "#475569",
        badgeBg: "#f1f5f9",
        badgeColor: "#334155",
        label: t.openChat,
        messageBg: "#f8fafc",
        messageBorder: "rgba(71, 85, 105, 0.24)",
        pageBg: "#f8fafc",
        softBg: "rgba(71, 85, 105, 0.08)",
      };
    }

    if (activeChannel.type === "guild") {
      return {
        accent: "#b56a1f",
        badgeBg: "#fff3df",
        badgeColor: "#7c3f0b",
        label: t.guilds,
        messageBg: "#fff7ed",
        messageBorder: "rgba(181, 106, 31, 0.32)",
        pageBg: "#fffaf3",
        softBg: "rgba(181, 106, 31, 0.08)",
      };
    }

    if (activeChannel.type === "whisper") {
      return {
        accent: "#2563eb",
        badgeBg: "#eef4ff",
        badgeColor: "#1d4ed8",
        label: t.whisper,
        messageBg: "#eff6ff",
        messageBorder: "rgba(37, 99, 235, 0.28)",
        pageBg: "#f7fbff",
        softBg: "rgba(37, 99, 235, 0.08)",
      };
    }

    return {
      accent: "#0f766e",
      badgeBg: "#eafaf5",
      badgeColor: "#0f5f59",
      label: t.globalChat,
      messageBg: "#eef8f5",
      messageBorder: "rgba(20, 108, 95, 0.24)",
      pageBg: "#f7fbf9",
      softBg: "rgba(15, 118, 110, 0.08)",
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
        bgcolor: "background.default",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(240px, 320px) minmax(0, 1fr)" },
        minHeight: "100vh",
      }}
    >
      <Box
        component="aside"
        aria-label={t.conversations}
        sx={{
          bgcolor: "#202832",
          color: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          p: { xs: 2.5, md: 3.5 },
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

        <FormControl fullWidth size="small">
          <InputLabel id="language-label" sx={{ color: "#d9e2ea" }}>
            {t.language}
          </InputLabel>
          <Select
            label={t.language}
            labelId="language-label"
            onChange={handleLanguageChange}
            sx={{ color: "#fff" }}
            value={language}
          >
            {(Object.keys(languageLabels) as UiLanguage[]).map((languageCode) => (
              <MenuItem key={languageCode} value={languageCode}>
                {languageLabels[languageCode]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button color="primary" disabled={!isAuthenticated} fullWidth type="button" variant="contained">
          {t.newChat}
        </Button>

        <Paper
          component="section"
          elevation={0}
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "inherit",
            p: 2,
          }}
          variant="outlined"
        >
          {profile ? (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Box>
                <Typography sx={{ color: "#8aa3b5", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                  {t.profile}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{profile.displayName}</Typography>
                <Typography sx={{ color: "#b7c3cf", fontSize: "0.85rem" }}>{profile.onlineStatus}</Typography>
              </Box>
              <Button color="inherit" component={Link} href="/profile" type="button" variant="contained">
                {t.profile}
              </Button>
              <Button color="inherit" component={Link} href="/guilds" type="button" variant="outlined">
                {t.guilds}
              </Button>
              <Button color="inherit" onClick={() => void logout(apiBaseUrl)} type="button" variant="outlined">
                {t.logout}
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Box>
                <Typography sx={{ color: "#8aa3b5", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                  {t.profile}
                </Typography>
                <Typography sx={{ color: "#b7c3cf", fontSize: "0.9rem" }}>{t.conversationRequiresLogin}</Typography>
              </Box>
              <Button color="inherit" component={Link} href="/auth" type="button" variant="contained">
                {t.login}
              </Button>
            </Box>
          )}
        </Paper>

        <List aria-label={t.conversations} disablePadding sx={{ display: "grid", gap: 1.25 }}>
          <ListItemButton
            disabled={!isAuthenticated}
            onClick={() => handleChannelChange({ type: "open" })}
            selected={isAuthenticated && activeChannel.type === "open"}
            sx={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 1,
              color: "inherit",
              display: "grid",
              gap: 0.5,
              "&.Mui-selected": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
              "&.Mui-selected:hover": {
                bgcolor: "rgba(255, 255, 255, 0.12)",
              },
            }}
          >
            <ListItemText
              primary={renderChannelPrimary(t.openChat, { type: "open" })}
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
            sx={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 1,
              color: "inherit",
              display: "grid",
              gap: 0.5,
              "&.Mui-selected": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
              "&.Mui-selected:hover": {
                bgcolor: "rgba(255, 255, 255, 0.12)",
              },
            }}
          >
            <ListItemText
              primary={renderChannelPrimary(t.globalChat, { type: "global" })}
              secondary={isAuthenticated ? t.local : t.conversationRequiresLogin}
              slotProps={{
                primary: { sx: { fontWeight: 700 } },
                secondary: { sx: { color: "#b7c3cf", fontSize: "0.85rem" } },
              }}
            />
          </ListItemButton>

          {guilds.map((guild) => (
            <ListItemButton
              disabled={!isAuthenticated}
              key={guild._id}
              onClick={() => handleChannelChange({ guildId: guild._id, type: "guild" })}
              selected={activeChannel.type === "guild" && activeChannel.guildId === guild._id}
              sx={{
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: 1,
                color: "inherit",
                display: "grid",
                gap: 0.5,
                "&.Mui-selected": {
                  bgcolor: "rgba(255, 255, 255, 0.08)",
                },
                "&.Mui-selected:hover": {
                  bgcolor: "rgba(255, 255, 255, 0.12)",
                },
              }}
            >
              <ListItemText
                primary={renderChannelPrimary(guild.name, { guildId: guild._id, type: "guild" })}
                secondary={t.guilds}
                slotProps={{
                  primary: { sx: { fontWeight: 700 } },
                  secondary: { sx: { color: "#b7c3cf", fontSize: "0.85rem" } },
                }}
              />
            </ListItemButton>
          ))}

          <Typography color="#8aa3b5" sx={{ fontSize: "0.75rem", fontWeight: 700, pt: 1, textTransform: "uppercase" }}>
            {t.onlinePlayers}
          </Typography>

          {onlineUsers.length > 0 ? (
            onlineUsers.map((user) => (
              <ListItemButton
                disabled={!isAuthenticated}
                key={user.accountId}
                onClick={() => startWhisper(user)}
                selected={activeChannel.type === "whisper" && activeChannel.recipientId === user.accountId}
                sx={{
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 1,
                  color: "inherit",
                  display: "grid",
                  gap: 0.5,
                  "&.Mui-selected": {
                    bgcolor: "rgba(255, 255, 255, 0.08)",
                  },
                  "&.Mui-selected:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.12)",
                  },
                }}
              >
                <ListItemText
                  primary={
                    <Box component="span" sx={{ alignItems: "center", display: "flex", gap: 1, justifyContent: "space-between", minWidth: 0 }}>
                      {renderChannelPrimary(user.displayName, {
                        recipientDisplayName: user.displayName,
                        recipientId: user.accountId,
                        type: "whisper",
                      })}
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
            <Typography sx={{ color: "#b7c3cf", fontSize: "0.85rem" }}>{t.noOnlinePlayers}</Typography>
          )}

          <Menu anchorEl={playerMenuAnchor} onClose={handlePlayerMenuClose} open={Boolean(playerMenuAnchor)}>
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

          <ListItemButton
            component="a"
            href="#api"
            sx={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 1,
              color: "inherit",
            }}
          >
            <ListItemText
              primary={t.apiTitle}
              secondary={apiStatus}
              slotProps={{
                primary: { sx: { fontWeight: 700 } },
                secondary: { sx: { color: "#b7c3cf", fontSize: "0.85rem" } },
              }}
            />
          </ListItemButton>
        </List>
      </Box>

      <Box
        component="section"
        id="current"
        aria-label={activeChannelTitle}
        sx={{
          bgcolor: channelAppearance.pageBg,
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr) auto",
          minHeight: { xs: "70vh", md: "100vh" },
          minWidth: 0,
          p: { xs: 2.5, md: 4 },
        }}
      >
        <Box
          component="header"
          sx={{
            bgcolor: channelAppearance.softBg,
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
                      bgcolor: isOwnMessage ? channelAppearance.messageBg : "background.paper",
                      border: 1,
                      borderColor: isOwnMessage ? channelAppearance.messageBorder : "divider",
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
    </Box>
  );
}
