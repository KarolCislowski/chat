import type { ApiHealth, ChatChannel, ChatView, Message } from "../../../stores/chat-store";
import type { Guild } from "../../../stores/guild-store";
import type { ChatUser } from "../../../stores/user-store";

/**
 * Formats API health into a localized status label.
 *
 * @param health - Health response loaded from the API.
 * @param t - Translation dictionary used for visible labels.
 * @returns Localized status text for the current API state.
 */
export function getApiStatusLabel(health: ApiHealth | null, t: Record<string, string>) {
  if (health?.status === "ok" && health.database === "connected") {
    return t.apiConnected;
  }

  if (health?.status === "ok") {
    return t.apiNoDatabase;
  }

  return t.apiDisconnected;
}

/**
 * Checks whether the API and database are both reachable.
 *
 * @param health - Health response loaded from the API.
 * @returns True when the API is healthy and the database is connected.
 */
export function isApiHealthy(health: ApiHealth | null) {
  return health?.status === "ok" && health.database === "connected";
}

/**
 * Resolves the guild represented by the currently active chat view.
 *
 * @param activeChannel - Active chat view.
 * @param guilds - Guilds available to the current user.
 * @returns The active guild, or null when the active channel is not a guild.
 */
export function getActiveGuild(activeChannel: ChatView, guilds: Guild[]) {
  return activeChannel.type === "guild" ? guilds.find((guild) => guild._id === activeChannel.guildId) ?? null : null;
}

/**
 * Resolves the guild that will receive the next composed message.
 *
 * @param composeChannel - Current message destination.
 * @param guilds - Guilds available to the current user.
 * @returns The compose guild, or null when composing outside guild chat.
 */
export function getComposeGuild(composeChannel: ChatChannel, guilds: Guild[]) {
  return composeChannel.type === "guild" ? guilds.find((guild) => guild._id === composeChannel.guildId) ?? null : null;
}

/**
 * Builds the title shown for the active chat view.
 *
 * @param activeChannel - Active chat view.
 * @param activeGuild - Guild resolved for guild channels.
 * @param t - Translation dictionary used for fallback labels.
 * @returns Human-readable channel title.
 */
export function getActiveChannelTitle(activeChannel: ChatView, activeGuild: Guild | null, t: Record<string, string>) {
  if (activeChannel.type === "open") {
    return t.openChat;
  }

  if (activeChannel.type === "whisper") {
    return activeChannel.recipientDisplayName;
  }

  return activeGuild?.name ?? t.globalChat;
}

/**
 * Finds the user represented by the active whisper channel.
 *
 * @param activeChannel - Active chat view.
 * @param users - Cached user list.
 * @returns Whisper recipient user, or null for non-whisper channels.
 */
export function getActiveWhisperUser(activeChannel: ChatView, users: ChatUser[]) {
  return activeChannel.type === "whisper" ? users.find((user) => user.accountId === activeChannel.recipientId) ?? null : null;
}

/**
 * Filters guilds where the current user can perform management actions.
 *
 * @param guilds - Guilds available to the current user.
 * @returns Guilds where the user is an owner or officer.
 */
export function getManageableGuilds(guilds: Guild[]) {
  return guilds.filter((guild) => ["owner", "officer"].includes(guild.membership.role ?? ""));
}

/**
 * Filters the user list to currently visible online players.
 *
 * @param users - Cached user list.
 * @returns Users whose presence is not offline.
 */
export function getOnlineUsers(users: ChatUser[]) {
  return users.filter((user) => user.onlineStatus !== "offline");
}

/**
 * Converts a select value back into a concrete compose channel.
 *
 * @param channelKey - Stable channel key from the compose select.
 * @param guilds - Guilds available to the current user.
 * @param users - Cached user list used for whisper labels.
 * @returns Matching compose channel, or null when the key is stale.
 */
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

/**
 * Formats the channel badge shown beside messages in the open chat view.
 *
 * @param message - Message to label.
 * @param guilds - Guilds used to resolve guild names.
 * @param t - Translation dictionary used for fallback labels.
 * @returns Human-readable channel label.
 */
export function getMessageChannelLabel(message: Message, guilds: Guild[], t: Record<string, string>) {
  if (message.channelType === "global") {
    return t.globalChat;
  }

  if (message.channelType === "guild") {
    return guilds.find((guild) => guild._id === message.guildId)?.name ?? t.guilds;
  }

  return t.whisper;
}
