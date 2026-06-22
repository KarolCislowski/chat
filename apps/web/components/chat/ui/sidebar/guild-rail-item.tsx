"use client";

import { Box, ListItemButton, ListItemText } from "@mui/material";
import { getGuildThemeAccent, resolveGuildEmblemUrl } from "../../../../lib/guild-flags";
import { ChatView } from "../../../../stores/chat-store";
import type { Guild } from "../../../../stores/guild-store";
import { ChannelPrimary, railItemSx } from "./sidebar-rail";

/** Props for one guild channel entry in the sidebar rail. */
type GuildRailItemProps = {
  /** Channel currently displayed in the main chat panel. */
  activeChannel: ChatView;
  /** Whether this item should be disabled for unauthenticated users. */
  disabled: boolean;
  /** Guild represented by this rail item. */
  guild: Guild;
  /**
   * Switches the active channel when the guild is selected.
   *
   * @param channel - Guild channel represented by this item.
   * @returns Nothing.
   */
  onChannelChange: (channel: ChatView) => void;
  /** Unread counters keyed by chat channel. */
  unreadByChannel: Record<string, number>;
};

export function GuildRailItem({ activeChannel, disabled, guild, onChannelChange, unreadByChannel }: GuildRailItemProps) {
  const accent = getGuildThemeAccent(guild.themeColor);
  const channel: ChatView = { guildId: guild._id, type: "guild" };
  const isSelected = activeChannel.type === "guild" && activeChannel.guildId === guild._id;

  return (
    <ListItemButton
      disabled={disabled}
      key={guild._id}
      onClick={() => onChannelChange(channel)}
      selected={isSelected}
      sx={{
        ...railItemSx(isSelected, accent),
        minHeight: 72,
        overflow: "hidden",
        py: 0,
      }}
    >
      <ListItemText
        primary={
          <Box component="span" sx={{ alignItems: "stretch", display: "flex", gap: 1.35, minHeight: 68, minWidth: 0 }}>
            <Box
              component="img"
              alt=""
              src={resolveGuildEmblemUrl(guild.emblemUrl, guild.themeColor)}
              sx={{
                alignSelf: "stretch",
                display: "block",
                flex: "0 0 auto",
                filter: `drop-shadow(0 0 8px ${accent}55)`,
                height: 68,
                objectFit: "contain",
                width: 44,
              }}
            />
            <Box component="span" sx={{ alignItems: "center", display: "flex", flex: "1 1 auto", minWidth: 0 }}>
              <ChannelPrimary
                channel={channel}
                endAdornment={
                  <Box component="span" sx={{ color: "#b7c3cf", flex: "0 0 auto", fontSize: "0.78rem", fontWeight: 700 }}>
                    {guild.members.length}
                  </Box>
                }
                label={guild.name}
                unreadByChannel={unreadByChannel}
              />
            </Box>
          </Box>
        }
        slotProps={{ primary: { sx: { fontWeight: 700 } } }}
      />
    </ListItemButton>
  );
}
