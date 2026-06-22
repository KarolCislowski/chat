"use client";

import { FormEvent, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { SelectChangeEvent } from "@mui/material";
import { getChannelAppearance, getComposeAppearance } from "../lib/chat/appearance";
import {
  getActiveChannelTitle,
  getActiveGuild,
  getActiveWhisperUser,
  getApiStatusLabel,
  getComposeChannelFromKey,
  getComposeGuild,
  getManageableGuilds,
  getMessageChannelLabel,
  getOnlineUsers,
  isApiHealthy,
} from "../lib/chat/page-state";
import { useAuthStore } from "../stores/auth-store";
import { useChatStore } from "../stores/chat-store";
import type { Message } from "../stores/chat-store";
import { useGuildStore } from "../stores/guild-store";
import { useLanguageStore } from "../stores/language-store";
import { useUserStore } from "../stores/user-store";
import { useChatPlayerActions } from "./use-chat-player-actions";

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
  const playerActions = useChatPlayerActions({
    apiBaseUrl,
    getFreshAccessToken,
    inviteMember,
    setActiveChannel,
  });

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

  const apiStatus = useMemo(() => getApiStatusLabel(health, t), [health, t]);
  const isApiConnected = isApiHealthy(health);
  const activeGuild = useMemo(() => getActiveGuild(activeChannel, guilds), [activeChannel, guilds]);
  const composeGuild = useMemo(() => getComposeGuild(composeChannel, guilds), [composeChannel, guilds]);
  const activeChannelTitle = useMemo(() => getActiveChannelTitle(activeChannel, activeGuild, t), [activeChannel, activeGuild, t]);
  const activeWhisperUser = useMemo(() => getActiveWhisperUser(activeChannel, users), [activeChannel, users]);
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
  const manageableGuilds = useMemo(() => getManageableGuilds(guilds), [guilds]);
  const onlineUsers = useMemo(() => getOnlineUsers(users), [users]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (!text) {
      return;
    }

    sendMessage(text);
  }

  function handleComposeChannelChange(event: SelectChangeEvent<string>) {
    const channel = getComposeChannelFromKey(event.target.value, guilds, users);

    if (channel) {
      setComposeChannel(channel);
    }
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
    getMessageChannelLabel: (message: Message) => getMessageChannelLabel(message, guilds, t),
    guildError,
    guilds,
    handleComposeChannelChange,
    handleInviteSelectedPlayer: playerActions.handleInviteSelectedPlayer,
    handlePlayerMenuClose: playerActions.handlePlayerMenuClose,
    handlePlayerMenuOpen: playerActions.handlePlayerMenuOpen,
    handleSubmit,
    healthError,
    isApiConnected,
    isAuthenticated,
    language,
    manageableGuilds,
    messages,
    onlineUsers,
    playerMenuAnchor: playerActions.playerMenuAnchor,
    profile,
    selectedPlayer: playerActions.selectedPlayer,
    setActiveChannel,
    setDraft,
    startWhisper: playerActions.startWhisper,
    t,
    unreadByChannel,
    users,
    usersError,
  };
}
