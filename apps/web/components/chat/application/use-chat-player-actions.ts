"use client";

import { MouseEvent, useCallback, useState } from "react";
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

  /**
   * Opens the contextual action menu for a selected player.
   *
   * The callback is memoized so sidebar rows and the online player panel can
   * keep stable props between unrelated chat updates.
   *
   * @param event - Button click event used as the MUI menu anchor.
   * @param user - Player represented by the clicked action button.
   * @returns Nothing.
   */
  const handlePlayerMenuOpen = useCallback(function handlePlayerMenuOpen(event: MouseEvent<HTMLButtonElement>, user: ChatUser) {
    event.stopPropagation();
    setSelectedPlayer(user);
    setPlayerMenuAnchor(event.currentTarget);
  }, []);

  /**
   * Closes the player action menu and clears the selected player.
   *
   * The callback is memoized because it is shared by the sidebar menu and
   * whisper-start flow.
   *
   * @returns Nothing.
   */
  const handlePlayerMenuClose = useCallback(function handlePlayerMenuClose() {
    setPlayerMenuAnchor(null);
    setSelectedPlayer(null);
  }, []);

  /**
   * Switches the active chat view to a whisper conversation with a player.
   *
   * The callback is memoized so player rows can remain memoized while the
   * surrounding chat page updates.
   *
   * @param user - Player who should become the whisper recipient.
   * @returns Nothing.
   */
  const startWhisper = useCallback(
    function startWhisper(user: ChatUser) {
      setActiveChannel({
        recipientDisplayName: user.displayName,
        recipientId: user.accountId,
        type: "whisper",
      });
      handlePlayerMenuClose();
    },
    [handlePlayerMenuClose, setActiveChannel],
  );

  /**
   * Invites the currently selected player to a manageable guild.
   *
   * The callback is memoized for the player action menu and refreshes only
   * when authentication, selected player, or invite dependencies change.
   *
   * @param guildId - Guild selected from the player action menu.
   * @returns A promise that resolves after the invite attempt completes.
   */
  const inviteSelectedPlayer = useCallback(
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
    },
    [apiBaseUrl, getFreshAccessToken, handlePlayerMenuClose, inviteMember, selectedPlayer],
  );

  return {
    handleInviteSelectedPlayer: inviteSelectedPlayer,
    handlePlayerMenuClose,
    handlePlayerMenuOpen,
    playerMenuAnchor,
    selectedPlayer,
    startWhisper,
  };
}
