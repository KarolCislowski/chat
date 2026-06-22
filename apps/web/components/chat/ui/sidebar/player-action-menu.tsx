"use client";

import Link from "next/link";
import { Menu, MenuItem } from "@mui/material";
import type { Guild } from "../../../../stores/guild-store";
import type { ChatUser } from "../../../../stores/user-store";

/** Props for the contextual menu opened from player rows. */
type PlayerActionMenuProps = {
  /** Element used by MUI to position the menu. */
  anchorEl: HTMLElement | null;
  /** Guilds where the current user can invite the selected player. */
  manageableGuilds: Guild[];
  /** Closes the player menu. */
  onClose: () => void;
  /**
   * Invites the selected player to a guild.
   *
   * @param guildId - Guild selected from the menu.
   * @returns Nothing.
   */
  onInviteSelectedPlayer: (guildId: string) => void;
  /**
   * Starts a whisper chat with the selected player.
   *
   * @param user - Player selected from the menu.
   * @returns Nothing.
   */
  onStartWhisper: (user: ChatUser) => void;
  /** Player currently targeted by the menu. */
  selectedPlayer: ChatUser | null;
  /** Translation dictionary used for menu labels. */
  t: Record<string, string>;
};

export function PlayerActionMenu({
  anchorEl,
  manageableGuilds,
  onClose,
  onInviteSelectedPlayer,
  onStartWhisper,
  selectedPlayer,
  t,
}: PlayerActionMenuProps) {
  return (
    <Menu
      anchorEl={anchorEl}
      onClose={onClose}
      open={Boolean(anchorEl)}
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
      {selectedPlayer ? (
        <MenuItem component={Link} href={`/profile/${selectedPlayer.accountId}`} onClick={onClose}>
          {t.profile}
        </MenuItem>
      ) : null}
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
  );
}
