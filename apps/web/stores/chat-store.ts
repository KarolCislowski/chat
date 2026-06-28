import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "./user-store";

/** API health response used to report backend and database availability. */
export type ApiHealth = {
  status: string;
  database: string;
};

/** Describes the current Socket.IO lifecycle state used by the chat UI. */
export type ChatConnectionStatus = "connected" | "connecting" | "disconnected";

/** Identifies a concrete destination that can receive newly composed messages. */
export type ChatChannel =
  | {
      type: "global";
    }
  | {
      guildId: string;
      type: "guild";
    }
  | {
      recipientDisplayName: string;
      recipientId: string;
      type: "whisper";
    };

/** Identifies the channel currently rendered by the message list. */
export type ChatView = ChatChannel | { type: "open" };

/** Presence state broadcast by the realtime gateway for each account. */
export type OnlineStatus = "offline" | "online" | "away" | "busy";

/** Message payload returned by the API and broadcast over the chat websocket. */
export type Message = {
  _id: string;
  senderId: string;
  sender: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    onlineStatus: OnlineStatus;
  } | null;
  channelType: "global" | "guild" | "whisper";
  guildId: string | null;
  recipientId: string | null;
  conversationId: string | null;
  content: string;
  createdAt: string;
  editedAt: string | null;
  deletedAt: string | null;
};

/** Transient UI-only event rendered in the chat timeline for presence changes. */
export type SystemNotice = {
  _id: string;
  accountId: string;
  createdAt: string;
  displayName: string;
  type: "login" | "logout";
};

/** UI-only typing indicator shown for an active chat destination. */
export type TypingIndicator = {
  accountId: string;
  displayName: string;
  updatedAt: string;
};

type PresenceChangedEvent = {
  accountId: string;
  onlineStatus: OnlineStatus;
};

type TypingChangedEvent = {
  accountId: string;
  channelType: "global" | "guild" | "whisper";
  guildId: string | null;
  isTyping: boolean;
  recipientId: string | null;
};

type ChatState = {
  activeChannel: ChatView;
  composeChannel: ChatChannel;
  connectionError: string | null;
  connectionStatus: ChatConnectionStatus;
  currentAccountId: string | null;
  draft: string;
  health: ApiHealth | null;
  healthError: string | null;
  isChatViewVisible: boolean;
  messages: Message[];
  systemNotices: SystemNotice[];
  typingByChannel: Record<string, TypingIndicator[]>;
  unreadByChannel: Record<string, number>;
  /**
   * Opens the websocket connection for authenticated chat events.
   *
   * @param apiBaseUrl - Base URL of the API server.
   * @param accessToken - JWT access token used by the websocket handshake.
   * @returns Nothing; connection state is written into the store.
   */
  connectRealtime: (apiBaseUrl: string, accessToken: string) => void;
  /**
   * Closes the websocket connection and clears transient chat state.
   *
   * @returns Nothing.
   */
  disconnectRealtime: () => void;
  /**
   * Loads API health details displayed by the shell and diagnostics UI.
   *
   * @param apiBaseUrl - Base URL of the API server.
   * @returns A promise that resolves after the store is updated.
   */
  loadHealth: (apiBaseUrl: string) => Promise<void>;
  /**
   * Loads messages for the active channel and clears unread state for it.
   *
   * @param apiBaseUrl - Base URL of the API server.
   * @param accessToken - JWT access token used for the request.
   * @returns A promise that resolves after messages or an error are stored.
   */
  loadMessages: (apiBaseUrl: string, accessToken: string) => Promise<void>;
  /**
   * Sends a message to the current compose channel through the websocket.
   *
   * @param content - Raw composer text; empty or whitespace-only values are ignored.
   * @returns Nothing.
   */
  sendMessage: (content: string) => void;
  /**
   * Changes the displayed channel and resets channel-specific transient state.
   *
   * @param channel - Channel view that should become active.
   * @returns Nothing.
   */
  setActiveChannel: (channel: ChatView) => void;
  setChatViewVisible: (isVisible: boolean) => void;
  setComposeChannel: (channel: ChatChannel) => void;
  setCurrentAccountId: (accountId: string | null) => void;
  setDraft: (draft: string) => void;
};

let socket: Socket | null = null;
let typingStopTimer: ReturnType<typeof setTimeout> | null = null;
let activeTypingChannelKey: string | null = null;
const typingExpiryTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Adds a message to a sorted list unless it has already been received.
 *
 * @param messages - Existing messages for the active channel.
 * @param message - Newly loaded or realtime message.
 * @returns A chronological message list with no duplicate IDs.
 */
function upsertMessage(messages: Message[], message: Message) {
  if (messages.some((existingMessage) => existingMessage._id === message._id)) {
    return messages;
  }

  return [...messages, message].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
}

/**
 * Checks whether a message belongs in the currently rendered channel view.
 *
 * @param message - Message returned by the API or websocket.
 * @param channel - Chat view currently displayed by the UI.
 * @returns True when the message should be visible in the provided channel.
 */
function isMessageForChannel(message: Message, channel: ChatView) {
  if (channel.type === "open") {
    return true;
  }

  if (channel.type === "global") {
    return message.channelType === "global";
  }

  if (channel.type === "whisper") {
    return message.channelType === "whisper" && (message.senderId === channel.recipientId || message.recipientId === channel.recipientId);
  }

  return message.channelType === "guild" && message.guildId === channel.guildId;
}

/**
 * Builds the stable key used for unread counters and compose select values.
 *
 * @param channel - Chat channel or aggregate open view.
 * @returns A stable string key for the channel.
 */
export function getChatChannelKey(channel: ChatView) {
  if (channel.type === "open") {
    return "open";
  }

  if (channel.type === "global") {
    return "global";
  }

  if (channel.type === "guild") {
    return `guild:${channel.guildId}`;
  }

  return `whisper:${channel.recipientId}`;
}

/**
 * Converts a concrete channel into the websocket typing payload shape.
 *
 * @param channel - Compose destination being typed into.
 * @returns Socket payload fields for the typing event.
 */
function getTypingPayload(channel: ChatChannel) {
  return channel.type === "global"
    ? { channelType: "global" as const }
    : channel.type === "guild"
      ? { channelType: "guild" as const, guildId: channel.guildId }
      : { channelType: "whisper" as const, recipientId: channel.recipientId };
}

/**
 * Resolves the local channel key for an inbound typing event.
 *
 * @param event - Typing event received from the websocket.
 * @param currentAccountId - Current signed-in account ID, if known.
 * @returns Channel key affected by the event, or null when incomplete.
 */
function getTypingChannelKey(event: TypingChangedEvent, currentAccountId: string | null) {
  if (event.channelType === "global") {
    return "global";
  }

  if (event.channelType === "guild") {
    return event.guildId ? `guild:${event.guildId}` : null;
  }

  if (event.channelType === "whisper") {
    return event.accountId === currentAccountId ? (event.recipientId ? `whisper:${event.recipientId}` : null) : `whisper:${event.accountId}`;
  }

  return null;
}

/**
 * Resolves the unread-counter key for a message from the current user's perspective.
 *
 * @param message - Message that may increment unread state.
 * @param currentAccountId - Account ID of the signed-in user, if known.
 * @returns The channel key to increment, or null when the message is incomplete.
 */
function getMessageChannelKey(message: Message, currentAccountId: string | null) {
  if (message.channelType === "global") {
    return "global";
  }

  if (message.channelType === "guild" && message.guildId) {
    return `guild:${message.guildId}`;
  }

  if (message.channelType === "whisper") {
    const otherParticipantId = message.senderId === currentAccountId ? message.recipientId : message.senderId;
    return otherParticipantId ? `whisper:${otherParticipantId}` : null;
  }

  return null;
}

/**
 * Clears unread counters for a channel view.
 *
 * @param unreadByChannel - Current unread counter map.
 * @param channel - Channel that has just been opened or viewed.
 * @returns A new unread map when anything changed, otherwise the original map.
 */
function clearUnread(unreadByChannel: Record<string, number>, channel: ChatView) {
  if (channel.type === "open") {
    return {};
  }

  const channelKey = getChatChannelKey(channel);

  if (!unreadByChannel[channelKey]) {
    return unreadByChannel;
  }

  const nextUnreadByChannel = { ...unreadByChannel };
  delete nextUnreadByChannel[channelKey];
  return nextUnreadByChannel;
}

/**
 * Adds a transient presence notice while suppressing noisy reconnect flicker.
 *
 * @param notices - Existing UI-only system notices.
 * @param notice - Notice candidate derived from a presence event.
 * @returns Updated notice list capped to a small recent history.
 */
function upsertSystemNotice(notices: SystemNotice[], notice: SystemNotice) {
  const lastNoticeForAccount = [...notices].reverse().find((existingNotice) => existingNotice.accountId === notice.accountId);

  if (lastNoticeForAccount) {
    const elapsedMs = new Date(notice.createdAt).getTime() - new Date(lastNoticeForAccount.createdAt).getTime();

    if (lastNoticeForAccount.type !== notice.type && elapsedMs < 10_000) {
      return notices.filter((existingNotice) => existingNotice._id !== lastNoticeForAccount._id);
    }

    if (lastNoticeForAccount.type === notice.type && elapsedMs < 30_000) {
      return notices;
    }
  }

  return [...notices, notice].slice(-25);
}

/**
 * Removes one account from the typing indicator list for a channel.
 *
 * @param typingByChannel - Current typing indicators keyed by channel.
 * @param channelKey - Channel whose typing indicator should change.
 * @param accountId - Account to remove.
 * @returns Updated typing map.
 */
function removeTypingIndicator(typingByChannel: Record<string, TypingIndicator[]>, channelKey: string, accountId: string) {
  const remainingIndicators = (typingByChannel[channelKey] ?? []).filter((indicator) => indicator.accountId !== accountId);

  if (remainingIndicators.length === 0) {
    const nextTypingByChannel = { ...typingByChannel };
    delete nextTypingByChannel[channelKey];
    return nextTypingByChannel;
  }

  return {
    ...typingByChannel,
    [channelKey]: remainingIndicators,
  };
}

/**
 * Stores or refreshes one account's typing indicator for a channel.
 *
 * @param typingByChannel - Current typing indicators keyed by channel.
 * @param channelKey - Channel where typing is happening.
 * @param indicator - Indicator payload to add or refresh.
 * @returns Updated typing map.
 */
function upsertTypingIndicator(typingByChannel: Record<string, TypingIndicator[]>, channelKey: string, indicator: TypingIndicator) {
  const indicators = typingByChannel[channelKey] ?? [];
  const nextIndicators = [indicator, ...indicators.filter((existingIndicator) => existingIndicator.accountId !== indicator.accountId)].slice(0, 4);

  return {
    ...typingByChannel,
    [channelKey]: nextIndicators,
  };
}

/**
 * Emits a typing-state event for the active socket when connected.
 *
 * @param channel - Channel whose typing state changed.
 * @param isTyping - Whether the user is actively typing.
 * @returns Nothing.
 */
function emitTypingState(channel: ChatChannel, isTyping: boolean) {
  if (!socket?.connected) {
    return;
  }

  socket.emit("typing:changed", {
    ...getTypingPayload(channel),
    isTyping,
  });
}

/**
 * Schedules a delayed typing-stop event after local composer inactivity.
 *
 * @param channel - Channel currently being typed into.
 * @returns Nothing.
 */
function scheduleTypingStop(channel: ChatChannel) {
  if (typingStopTimer) {
    clearTimeout(typingStopTimer);
  }

  typingStopTimer = setTimeout(() => {
    emitTypingState(channel, false);
    activeTypingChannelKey = null;
    typingStopTimer = null;
  }, 1800);
}

/**
 * Clears all pending typing timers and optionally notifies the last channel.
 *
 * @param channel - Channel that should receive a final stop event, if any.
 * @returns Nothing.
 */
function clearLocalTyping(channel?: ChatChannel) {
  if (typingStopTimer) {
    clearTimeout(typingStopTimer);
    typingStopTimer = null;
  }

  if (channel && activeTypingChannelKey) {
    emitTypingState(channel, false);
  }

  activeTypingChannelKey = null;
}

async function getErrorMessage(response: Response) {
  const errorPayload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = Array.isArray(errorPayload?.message) ? errorPayload.message.join(", ") : errorPayload?.message;

  return message ?? `Request failed with ${response.status}`;
}

/** Zustand store that owns chat websocket state, messages, composer state, and unread counters. */
export const useChatStore = create<ChatState>((set, get) => ({
  activeChannel: { type: "open" },
  composeChannel: { type: "global" },
  connectionError: null,
  connectionStatus: "disconnected",
  currentAccountId: null,
  draft: "",
  health: null,
  healthError: null,
  isChatViewVisible: false,
  messages: [],
  systemNotices: [],
  typingByChannel: {},
  unreadByChannel: {},
  connectRealtime: (apiBaseUrl, accessToken) => {
    if (socket?.connected) {
      return;
    }

    socket?.disconnect();
    set({ connectionError: null, connectionStatus: "connecting" });

    socket = io(`${apiBaseUrl}/chat`, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      set({ connectionError: null, connectionStatus: "connected" });
    });

    socket.on("disconnect", () => {
      set({ connectionStatus: "disconnected" });
    });

    socket.on("connect_error", (error) => {
      set({ connectionError: error.message, connectionStatus: "disconnected" });
    });

    socket.on("chat:error", (payload: { message?: string }) => {
      set({ connectionError: payload.message ?? "Chat connection error." });
    });

    socket.on("message:created", (message: Message) => {
      set((state) => {
        const isActiveChannelMessage = isMessageForChannel(message, state.activeChannel);
        const messageChannelKey = getMessageChannelKey(message, state.currentAccountId);
        const shouldIncrementUnread =
          Boolean(messageChannelKey) && (!state.isChatViewVisible || !isActiveChannelMessage) && message.senderId !== state.currentAccountId;

        return {
          messages: isActiveChannelMessage ? upsertMessage(state.messages, message) : state.messages,
          unreadByChannel:
            shouldIncrementUnread && messageChannelKey
              ? {
                  ...state.unreadByChannel,
                  [messageChannelKey]: (state.unreadByChannel[messageChannelKey] ?? 0) + 1,
                }
              : state.unreadByChannel,
        };
      });
    });

    socket.on("presence:changed", (presence: PresenceChangedEvent) => {
      const userStore = useUserStore.getState();
      const user = userStore.users.find((cachedUser) => cachedUser.accountId === presence.accountId);

      userStore.updateUserPresence(presence.accountId, presence.onlineStatus);

      set((state) => ({
        messages: state.messages.map((message) =>
          message.senderId === presence.accountId && message.sender
            ? {
                ...message,
                sender: {
                  ...message.sender,
                  onlineStatus: presence.onlineStatus,
                },
              }
            : message,
        ),
        systemNotices:
          presence.accountId === state.currentAccountId || (presence.onlineStatus !== "online" && presence.onlineStatus !== "offline")
            ? state.systemNotices
            : upsertSystemNotice(state.systemNotices, {
                _id: `presence:${presence.accountId}:${presence.onlineStatus}:${Date.now()}`,
                accountId: presence.accountId,
                createdAt: new Date().toISOString(),
                displayName: user?.displayName ?? presence.accountId,
                type: presence.onlineStatus === "online" ? "login" : "logout",
              }),
      }));
    });

    socket.on("typing:changed", (typingEvent: TypingChangedEvent) => {
      set((state) => {
        if (typingEvent.accountId === state.currentAccountId) {
          return state;
        }

        const channelKey = getTypingChannelKey(typingEvent, state.currentAccountId);

        if (!channelKey) {
          return state;
        }

        const timerKey = `${channelKey}:${typingEvent.accountId}`;
        const existingTimer = typingExpiryTimers.get(timerKey);

        if (existingTimer) {
          clearTimeout(existingTimer);
          typingExpiryTimers.delete(timerKey);
        }

        if (!typingEvent.isTyping) {
          return {
            typingByChannel: removeTypingIndicator(state.typingByChannel, channelKey, typingEvent.accountId),
          };
        }

        const user = useUserStore.getState().users.find((cachedUser) => cachedUser.accountId === typingEvent.accountId);
        const expiryTimer = setTimeout(() => {
          useChatStore.setState((currentState) => ({
            typingByChannel: removeTypingIndicator(currentState.typingByChannel, channelKey, typingEvent.accountId),
          }));
          typingExpiryTimers.delete(timerKey);
        }, 3500);

        typingExpiryTimers.set(timerKey, expiryTimer);

        return {
          typingByChannel: upsertTypingIndicator(state.typingByChannel, channelKey, {
            accountId: typingEvent.accountId,
            displayName: user?.displayName ?? typingEvent.accountId,
            updatedAt: new Date().toISOString(),
          }),
        };
      });
    });
  },
  disconnectRealtime: () => {
    clearLocalTyping();
    typingExpiryTimers.forEach((timer) => clearTimeout(timer));
    typingExpiryTimers.clear();
    socket?.disconnect();
    socket = null;
    set({ connectionError: null, connectionStatus: "disconnected", draft: "", messages: [], systemNotices: [], typingByChannel: {}, unreadByChannel: {} });
  },
  loadMessages: async (apiBaseUrl, accessToken) => {
    const channel = get().activeChannel;
    const path =
      channel.type === "open"
        ? "/messages/open"
        : channel.type === "global"
        ? "/messages/global"
        : channel.type === "guild"
          ? `/messages/guild/${channel.guildId}`
          : `/messages/whisper/${channel.recipientId}`;

    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const messages = (await response.json()) as Message[];
      set((state) => ({ connectionError: null, messages, unreadByChannel: clearUnread(state.unreadByChannel, channel) }));
    } catch (error) {
      set({ connectionError: error instanceof Error ? error.message : "Messages unavailable" });
    }
  },
  loadHealth: async (apiBaseUrl) => {
    try {
      const response = await fetch(`${apiBaseUrl}/health`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const health = (await response.json()) as ApiHealth;

      set({
        health,
        healthError: null,
      });
    } catch (error) {
      set({
        health: null,
        healthError: error instanceof Error ? error.message : "API unavailable",
      });
    }
  },
  sendMessage: (content) => {
    const text = content.trim();
    const channel = get().composeChannel;

    if (!text || !socket?.connected) {
      if (text) {
        set({ connectionError: "Chat socket is not connected." });
      }
      return;
    }

    socket.emit(
      "message:create",
      channel.type === "global"
        ? { channelType: "global", content: text }
        : channel.type === "guild"
          ? { channelType: "guild", content: text, guildId: channel.guildId }
          : { channelType: "whisper", content: text, recipientId: channel.recipientId },
    );
    clearLocalTyping(channel);
    set({ connectionError: null, draft: "" });
  },
  setActiveChannel: (channel) =>
    set((state) => {
      clearLocalTyping(state.composeChannel);

      return {
        activeChannel: channel,
        composeChannel: channel.type === "open" ? state.composeChannel : channel,
        connectionError: null,
        draft: "",
        messages: [],
        systemNotices: channel.type === "open" || channel.type === "global" ? state.systemNotices : [],
        unreadByChannel: clearUnread(state.unreadByChannel, channel),
      };
    }),
  setChatViewVisible: (isVisible) =>
    set((state) => ({
      isChatViewVisible: isVisible,
      unreadByChannel: isVisible ? clearUnread(state.unreadByChannel, state.activeChannel) : state.unreadByChannel,
    })),
  setComposeChannel: (channel) =>
    set((state) => {
      clearLocalTyping(state.composeChannel);

      return { composeChannel: channel };
    }),
  setCurrentAccountId: (accountId) => set({ currentAccountId: accountId }),
  setDraft: (draft) => {
    const channel = get().composeChannel;
    const channelKey = getChatChannelKey(channel);

    if (draft.trim()) {
      if (activeTypingChannelKey !== channelKey) {
        if (activeTypingChannelKey) {
          clearLocalTyping(channel);
        }

        emitTypingState(channel, true);
        activeTypingChannelKey = channelKey;
      }

      scheduleTypingStop(channel);
    } else {
      clearLocalTyping(channel);
    }

    set({ draft });
  },
}));
