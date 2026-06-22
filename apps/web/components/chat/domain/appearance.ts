import { getGuildThemeAccent } from "../../../lib/guild-flags";
import { ChatChannel, ChatView } from "../../../stores/chat-store";
import { Guild } from "../../../stores/guild-store";

export type ChannelAppearance = {
  accent: string;
  badgeBg: string;
  badgeColor: string;
  label: string;
  messageBg: string;
  messageBorder: string;
  pageBg: string;
  softBg: string;
};

export type ComposeAppearance = {
  accent: string;
  badgeColor: string;
  messageBorder: string;
};

export function hexToRgba(hexColor: string, alpha: number) {
  const normalizedHex = hexColor.replace("#", "");
  const red = parseInt(normalizedHex.slice(0, 2), 16);
  const green = parseInt(normalizedHex.slice(2, 4), 16);
  const blue = parseInt(normalizedHex.slice(4, 6), 16);

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

export function getChannelAppearance(channel: ChatView, activeGuild: Guild | null, labels: { globalChat: string; guilds: string; openChat: string; whisper: string }): ChannelAppearance {
  if (channel.type === "open") {
    return {
      accent: "#60a5fa",
      badgeBg: "rgba(96, 165, 250, 0.16)",
      badgeColor: "#bfdbfe",
      label: labels.openChat,
      messageBg: "rgba(96, 165, 250, 0.13)",
      messageBorder: "rgba(96, 165, 250, 0.34)",
      pageBg: "rgba(4, 15, 28, 0.72)",
      softBg: "rgba(96, 165, 250, 0.08)",
    };
  }

  if (channel.type === "guild") {
    const accent = getGuildThemeAccent(activeGuild?.themeColor);

    return {
      accent,
      badgeBg: hexToRgba(accent, 0.16),
      badgeColor: accent,
      label: labels.guilds,
      messageBg: hexToRgba(accent, 0.13),
      messageBorder: hexToRgba(accent, 0.36),
      pageBg: "rgba(12, 17, 26, 0.78)",
      softBg: hexToRgba(accent, 0.09),
    };
  }

  if (channel.type === "whisper") {
    return {
      accent: "#7dd3fc",
      badgeBg: "rgba(125, 211, 252, 0.15)",
      badgeColor: "#bae6fd",
      label: labels.whisper,
      messageBg: "rgba(125, 211, 252, 0.12)",
      messageBorder: "rgba(125, 211, 252, 0.32)",
      pageBg: "rgba(4, 18, 32, 0.78)",
      softBg: "rgba(125, 211, 252, 0.08)",
    };
  }

  return {
    accent: "#4ade80",
    badgeBg: "rgba(74, 222, 128, 0.14)",
    badgeColor: "#bbf7d0",
    label: labels.globalChat,
    messageBg: "rgba(74, 222, 128, 0.11)",
    messageBorder: "rgba(74, 222, 128, 0.3)",
    pageBg: "rgba(3, 22, 20, 0.72)",
    softBg: "rgba(74, 222, 128, 0.07)",
  };
}

export function getComposeAppearance(channel: ChatChannel, composeGuild: Guild | null): ComposeAppearance {
  if (channel.type === "guild") {
    const accent = getGuildThemeAccent(composeGuild?.themeColor);

    return {
      accent,
      badgeColor: accent,
      messageBorder: hexToRgba(accent, 0.32),
    };
  }

  if (channel.type === "whisper") {
    return {
      accent: "#2563eb",
      badgeColor: "#1d4ed8",
      messageBorder: "rgba(37, 99, 235, 0.28)",
    };
  }

  return {
    accent: "#0f766e",
    badgeColor: "#0f5f59",
    messageBorder: "rgba(20, 108, 95, 0.24)",
  };
}
