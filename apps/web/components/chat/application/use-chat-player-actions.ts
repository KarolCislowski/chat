"use client";

import { MouseEvent, useState } from "react";
import type { ChatView } from "../../../stores/chat-store";
import type { ChatUser } from "../../../stores/user-store";

/** Dependencies required by player action handlers in the chat sidebar. */
type UseChatPlayerActionsOptions = {
  apiBaseUrl: string;
  getFreshAccessToken: (apiBaseUrl: string) => Promise<string | null>;
  inviteMember: (apiBaseUrl: string, accessToken: string, guildId: string, userId: string) => Promise<void>;
  setActiveChannel: (channel: ChatView) => void;
};

/**
 * Coordinates player menu interactions from the chat sidebar.
 *
 * @param options - API access and state transition callbacks used by menu actions.
 * @returns Menu state and handlers for whisper and guild invite actions.
 */
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
