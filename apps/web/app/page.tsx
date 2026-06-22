"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { Box, Button, Paper, SelectChangeEvent, Typography } from "@mui/material";
import { ChannelHero } from "../components/chat/channel-hero";
import { ChatSidebar } from "../components/chat/chat-sidebar";
import { MessageComposer } from "../components/chat/message-composer";
import { MessageList } from "../components/chat/message-list";
import { OnlinePlayersPanel } from "../components/chat/online-players-panel";
import { getChannelAppearance, getComposeAppearance, hexToRgba } from "../lib/chat/appearance";
import { useAuthStore } from "../stores/auth-store";
import { getChatChannelKey, Message, useChatStore } from "../stores/chat-store";
import { useGuildStore } from "../stores/guild-store";
import { useLanguageStore } from "../stores/language-store";
import { ChatUser, useUserStore } from "../stores/user-store";

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
  const [playerMenuAnchor, setPlayerMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<ChatUser | null>(null);

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
  const activeGuild = activeChannel.type === "guild" ? guilds.find((guild) => guild._id === activeChannel.guildId) ?? null : null;
  const composeGuild = composeChannel.type === "guild" ? guilds.find((guild) => guild._id === composeChannel.guildId) ?? null : null;
  const activeChannelTitle =
    activeChannel.type === "open" ? t.openChat : activeChannel.type === "whisper" ? activeChannel.recipientDisplayName : activeGuild?.name ?? t.globalChat;
  const activeWhisperUser = activeChannel.type === "whisper" ? users.find((user) => user.accountId === activeChannel.recipientId) ?? null : null;
  const channelAppearance = useMemo(
    () =>
      getChannelAppearance(activeChannel, activeGuild, {
        globalChat: t.globalChat,
        guilds: t.guilds,
        openChat: t.openChat,
        whisper: t.whisper,
      }),
    [activeChannel, activeGuild, t.globalChat, t.guilds, t.openChat, t.whisper],
  );
  const composeAppearance = useMemo(() => getComposeAppearance(composeChannel, composeGuild), [composeChannel, composeGuild]);
  const manageableGuilds = useMemo(() => guilds.filter((guild) => ["owner", "officer"].includes(guild.membership.role ?? "")), [guilds]);
  const onlineUsers = useMemo(() => users.filter((user) => user.onlineStatus !== "offline"), [users]);

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

  function getMessageChannelLabel(message: Message) {
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
    setActiveChannel({
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
      <ChatSidebar
        activeChannel={activeChannel}
        guilds={guilds}
        isAuthenticated={isAuthenticated}
        manageableGuilds={manageableGuilds}
        onChannelChange={setActiveChannel}
        onInviteSelectedPlayer={(guildId) => void inviteSelectedPlayer(guildId)}
        onPlayerMenuClose={handlePlayerMenuClose}
        onPlayerMenuOpen={handlePlayerMenuOpen}
        onStartWhisper={startWhisper}
        playerMenuAnchor={playerMenuAnchor}
        selectedPlayer={selectedPlayer}
        t={t}
        unreadByChannel={unreadByChannel}
        users={users}
      />

      <Box
        component="section"
        id="current"
        aria-label={activeChannelTitle}
        sx={{
          "--scrollbar-thumb": hexToRgba(channelAppearance.accent, 0.52),
          "--scrollbar-thumb-hover": hexToRgba(channelAppearance.accent, 0.76),
          "--scrollbar-track": "rgba(2, 8, 18, 0.42)",
          bgcolor: channelAppearance.pageBg,
          borderLeft: "1px solid rgba(96, 165, 250, 0.08)",
          borderRight: { lg: "1px solid rgba(96, 165, 250, 0.08)" },
          display: "grid",
          gridColumn: { xs: "1", lg: "2" },
          gridTemplateRows: "auto minmax(0, 1fr) auto",
          minHeight: 0,
          minWidth: 0,
          p: { xs: 2.5, md: 4 },
          rowGap: 2.25,
        }}
      >
        <ChannelHero
          activeChannel={activeChannel}
          activeChannelTitle={activeChannelTitle}
          activeGuild={activeGuild}
          activeWhisperUser={activeWhisperUser}
          appearance={channelAppearance}
          t={t}
        />

        {isAuthenticated ? (
          <>
            <MessageList
              account={account}
              activeChannel={activeChannel}
              appearance={channelAppearance}
              connectionError={connectionError}
              getMessageChannelLabel={getMessageChannelLabel}
              guildError={guildError}
              healthError={healthError}
              language={language}
              messages={messages}
              profile={profile}
              t={t}
              usersError={usersError}
            />

            <MessageComposer
              activeChannelType={activeChannel.type}
              appearance={composeAppearance}
              composeChannel={composeChannel}
              connectionStatus={connectionStatus}
              draft={draft}
              guilds={guilds}
              onComposeChannelChange={handleComposeChannelChange}
              onDraftChange={setDraft}
              onSubmit={handleSubmit}
              t={t}
              users={users}
            />
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

      <OnlinePlayersPanel apiStatus={apiStatus} isApiConnected={isApiConnected} onPlayerMenuOpen={handlePlayerMenuOpen} onlineUsers={onlineUsers} t={t} />
    </Box>
  );
}
