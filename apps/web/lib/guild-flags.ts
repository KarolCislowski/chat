export type GuildThemeColor = "black" | "blue" | "green" | "pink" | "purple" | "red" | "white";

type GuildFlagSet = {
  accent: string;
  label: GuildThemeColor;
  paths: string[];
};

const flagSetMeta: Record<GuildThemeColor, { accent: string; first: number; stamp: string }> = {
  black: { accent: "#94a3b8", first: 41, stamp: "16_34_03" },
  blue: { accent: "#60a5fa", first: 121, stamp: "17_08_40" },
  green: { accent: "#4ade80", first: 81, stamp: "16_37_31" },
  pink: { accent: "#f472b6", first: 101, stamp: "16_39_23" },
  purple: { accent: "#a78bfa", first: 21, stamp: "16_31_59" },
  red: { accent: "#f87171", first: 1, stamp: "16_29_41" },
  white: { accent: "#e5edf7", first: 61, stamp: "16_35_16" },
};

export const guildThemeColors = Object.keys(flagSetMeta) as GuildThemeColor[];

export const guildFlagSets: GuildFlagSet[] = guildThemeColors.map((color) => {
  const meta = flagSetMeta[color];

  return {
    accent: meta.accent,
    label: color,
    paths: Array.from({ length: 20 }, (_, index) => {
      const flagNumber = String(meta.first + index).padStart(3, "0");
      const row = Math.floor(index / 5) + 1;
      const column = (index % 5) + 1;

      return `/assets/imgs/flags/${color}/crest_${flagNumber}_${meta.stamp}_r${row}_c${column}.png`;
    }),
  };
});

export const defaultGuildThemeColor: GuildThemeColor = "red";
export const defaultGuildEmblemUrl = guildFlagSets.find((set) => set.label === defaultGuildThemeColor)?.paths[0] ?? "";
export const guildBackgroundOptions = [
  "/assets/imgs/gbg/01_radiant_alpine_castle.png",
  "/assets/imgs/gbg/02_volcanic_dark_fortress.png",
  "/assets/imgs/gbg/03_elven_forest_palace.png",
  "/assets/imgs/gbg/04_lava_cavern_citadel.png",
  "/assets/imgs/gbg/05_dragon_statue_mountain_citadel.png",
  "/assets/imgs/gbg/06_sunbeam_imperial_castle.png",
  "/assets/imgs/gbg/07_arcane_mage_citadel.png",
  "/assets/imgs/gbg/08_forest_outpost.png",
  "/assets/imgs/gbg/09_tropical_harbor.png",
  "/assets/imgs/gbg/10_frozen_ice_fortress.png",
  "/assets/imgs/gbg/11_desert_palace_city.png",
  "/assets/imgs/gbg/12_jungle_temple_ruins.png",
] as const;
export const defaultGuildBackgroundUrl = guildBackgroundOptions[0];

export function getGuildFlagSet(color: string | null | undefined) {
  return guildFlagSets.find((set) => set.label === color) ?? guildFlagSets.find((set) => set.label === defaultGuildThemeColor) ?? guildFlagSets[0];
}

export function getGuildThemeAccent(color: string | null | undefined) {
  return getGuildFlagSet(color).accent;
}

export function resolveGuildEmblemUrl(emblemUrl: string | null | undefined, themeColor: string | null | undefined) {
  const flagSet = getGuildFlagSet(themeColor);

  return emblemUrl && flagSet.paths.includes(emblemUrl) ? emblemUrl : flagSet.paths[0];
}

export function resolveGuildBackgroundUrl(backgroundUrl: string | null | undefined) {
  return backgroundUrl && guildBackgroundOptions.includes(backgroundUrl as (typeof guildBackgroundOptions)[number]) ? backgroundUrl : defaultGuildBackgroundUrl;
}
