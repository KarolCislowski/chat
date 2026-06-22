import type { ApiHealth, ChatChannel, ChatView, Message } from "../../stores/chat-store";
import type { Guild } from "../../stores/guild-store";
import type { ChatUser } from "../../stores/user-store";

export function getApiStatusLabel(health: ApiHealth | null, t: Record<string, string>) {
  if (health?.status === "ok" && health.database === "connected") {
    return t.apiConnected;
  }

  if (health?.status === "ok") {
    return t.apiNoDatabase;
  }

  return t.apiDisconnected;
}

export function isApiHealthy(health: ApiHealth | null) {
  return health?.status === "ok" && health.database === "connected";
}

export function getActiveGuild(activeChannel: ChatView, guilds: Guild[]) {
  return activeChannel.type === "guild" ? guilds.find((guild) => guild._id === activeChannel.guildId) ?? null : null;
}

export function getComposeGuild(composeChannel: ChatChannel, guilds: Guild[]) {
  return composeChannel.type === "guild" ? guilds.find((guild) => guild._id === composeChannel.guildId) ?? null : null;
}

export function getActiveChannelTitle(activeChannel: ChatView, activeGuild: Guild | null, t: Record<string, string>) {
  if (activeChannel.type === "open") {
    return t.openChat;
  }

  if (activeChannel.type === "whisper") {
    return activeChannel.recipientDisplayName;
  }

  return activeGuild?.name ?? t.globalChat;
}

export function getActiveWhisperUser(activeChannel: ChatView, users: ChatUser[]) {
  return activeChannel.type === "whisper" ? users.find((user) => user.accountId === activeChannel.recipientId) ?? null : null;
}

export function getManageableGuilds(guilds: Guild[]) {
  return guilds.filter((guild) => ["owner", "officer"].includes(guild.membership.role ?? ""));
}

export function getOnlineUsers(users: ChatUser[]) {
  return users.filter((user) => user.onlineStatus !== "offline");
}

export function getComposeChannelFromKey(channelKey: string, guilds: Guild[], users: ChatUser[]): ChatChannel | null {
  if (channelKey === "global") {
    return { type: "global" };
  }

  if (channelKey.startsWith("guild:")) {
    const guildId = channelKey.replace("guild:", "");
    const guild = guilds.find((guild) => guild._id === guildId);

    return guild ? { guildId: guild._id, type: "guild" } : null;
  }

  if (channelKey.startsWith("whisper:")) {
    const recipientId = channelKey.replace("whisper:", "");
    const user = users.find((user) => user.accountId === recipientId);

    return user
      ? {
          recipientDisplayName: user.displayName,
          recipientId: user.accountId,
          type: "whisper",
        }
      : null;
  }

  return null;
}

export function getMessageChannelLabel(message: Message, guilds: Guild[], t: Record<string, string>) {
  if (message.channelType === "global") {
    return t.globalChat;
  }

  if (message.channelType === "guild") {
    return guilds.find((guild) => guild._id === message.guildId)?.name ?? t.guilds;
  }

  return t.whisper;
}
