"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SelectChangeEvent } from "@mui/material";
import { getChannelAppearance, getComposeAppearance } from "../lib/chat/appearance";
import { useAuthStore } from "../stores/auth-store";
import { Message, useChatStore } from "../stores/chat-store";
import { useGuildStore } from "../stores/guild-store";
import { useLanguageStore } from "../stores/language-store";
import { ChatUser, useUserStore } from "../stores/user-store";

export function useChatPage() {
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

  const isAuthenticated = Boolean(profile && tokens?.accessToken);

  useEffect(() => {
    void loadHealth(apiBaseUrl);
  }, [apiBaseUrl, loadHealth]);

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

  return {
    account,
    activeChannel,
    activeChannelTitle,
    activeGuild,
    activeWhisperUser,
    apiStatus,
    channelAppearance,
    composeAppearance,
    composeChannel,
    connectionError,
    connectionStatus,
    draft,
    getMessageChannelLabel,
    guildError,
    guilds,
    handleComposeChannelChange,
    handleInviteSelectedPlayer: inviteSelectedPlayer,
    handlePlayerMenuClose,
    handlePlayerMenuOpen,
    handleSubmit,
    healthError,
    isApiConnected,
    isAuthenticated,
    language,
    manageableGuilds,
    messages,
    onlineUsers,
    playerMenuAnchor,
    profile,
    selectedPlayer,
    setActiveChannel,
    setDraft,
    startWhisper,
    t,
    unreadByChannel,
    users,
    usersError,
  };
}
