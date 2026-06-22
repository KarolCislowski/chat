"use client";

import { Box } from "@mui/material";
import { resolveGuildEmblemUrl } from "../../../lib/guild-flags";
import type { Guild } from "../../../stores/guild-store";

/** Props for rendering a guild emblem with the correct vertical banner ratio. */
type GuildEmblemProps = {
  /** Guild appearance fields needed to resolve the emblem image. */
  guild: Pick<Guild, "emblemUrl" | "name" | "themeColor">;
  /** Base emblem size used to derive banner width and height. */
  size?: number;
};

export function GuildEmblem({ guild, size = 42 }: GuildEmblemProps) {
  return (
    <Box
      component="img"
      alt={guild.name}
      src={resolveGuildEmblemUrl(guild.emblemUrl, guild.themeColor)}
      sx={{
        flex: "0 0 auto",
        filter: "drop-shadow(0 8px 12px rgba(0, 0, 0, 0.45))",
        height: size * 1.35,
        objectFit: "contain",
        width: size * 0.9,
      }}
    />
  );
}
