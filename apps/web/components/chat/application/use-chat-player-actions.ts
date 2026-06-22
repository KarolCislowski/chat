"use client";

import { MouseEvent, useState } from "react";
import type { ChatView } from "../../../stores/chat-store";
import type { ChatUser } from "../../../stores/user-store";

type UseChatPlayerActionsOptions = {
  apiBaseUrl: string;
  getFreshAccessToken: (apiBaseUrl: string) => Promise<string | null>;
  inviteMember: (apiBaseUrl: string, accessToken: string, guildId: string, userId: string) => Promise<void>;
  setActiveChannel: (channel: ChatView) => void;
};

export function useChatPlayerActions({ apiBaseUrl, getFreshAccessToken, inviteMember, setActiveChannel }: UseChatPlayerActionsOptions) {
  const [playerMenuAnchor, setPlayerMenuAnchor] = useState<HTMLElement | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<ChatUser | null>(null);

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
    handleInviteSelectedPlayer: inviteSelectedPlayer,
    handlePlayerMenuClose,
    handlePlayerMenuOpen,
    playerMenuAnchor,
    selectedPlayer,
    startWhisper,
  };
}
