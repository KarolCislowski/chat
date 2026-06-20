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
