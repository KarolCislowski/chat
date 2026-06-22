"use client";

import { Menu, MenuItem } from "@mui/material";
import type { Guild } from "../../../../stores/guild-store";
import type { ChatUser } from "../../../../stores/user-store";

type PlayerActionMenuProps = {
  anchorEl: HTMLElement | null;
  manageableGuilds: Guild[];
  onClose: () => void;
  onInviteSelectedPlayer: (guildId: string) => void;
  onStartWhisper: (user: ChatUser) => void;
  selectedPlayer: ChatUser | null;
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
