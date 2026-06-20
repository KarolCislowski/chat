import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useUserStore } from "./user-store";

export type ApiHealth = {
  status: string;
  database: string;
};

export type ChatConnectionStatus = "connected" | "connecting" | "disconnected";
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
export type ChatView = ChatChannel | { type: "open" };
export type OnlineStatus = "offline" | "online" | "away" | "busy";

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

type PresenceChangedEvent = {
  accountId: string;
  onlineStatus: OnlineStatus;
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
  unreadByChannel: Record<string, number>;
  connectRealtime: (apiBaseUrl: string, accessToken: string) => void;
  disconnectRealtime: () => void;
  loadHealth: (apiBaseUrl: string) => Promise<void>;
  loadMessages: (apiBaseUrl: string, accessToken: string) => Promise<void>;
  sendMessage: (content: string) => void;
  setActiveChannel: (channel: ChatView) => void;
  setChatViewVisible: (isVisible: boolean) => void;
  setComposeChannel: (channel: ChatChannel) => void;
  setCurrentAccountId: (accountId: string | null) => void;
  setDraft: (draft: string) => void;
};

let socket: Socket | null = null;

function upsertMessage(messages: Message[], message: Message) {
  if (messages.some((existingMessage) => existingMessage._id === message._id)) {
    return messages;
  }

  return [...messages, message].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
}

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

async function getErrorMessage(response: Response) {
  const errorPayload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = Array.isArray(errorPayload?.message) ? errorPayload.message.join(", ") : errorPayload?.message;

  return message ?? `Request failed with ${response.status}`;
}

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
      useUserStore.getState().updateUserPresence(presence.accountId, presence.onlineStatus);

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
      }));
    });
  },
  disconnectRealtime: () => {
    socket?.disconnect();
    socket = null;
    set({ connectionError: null, connectionStatus: "disconnected", draft: "", messages: [], unreadByChannel: {} });
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
    set({ connectionError: null, draft: "" });
  },
  setActiveChannel: (channel) =>
    set((state) => ({
      activeChannel: channel,
      composeChannel: channel.type === "open" ? state.composeChannel : channel,
      connectionError: null,
      draft: "",
      messages: [],
      unreadByChannel: clearUnread(state.unreadByChannel, channel),
    })),
  setChatViewVisible: (isVisible) =>
    set((state) => ({
      isChatViewVisible: isVisible,
      unreadByChannel: isVisible ? clearUnread(state.unreadByChannel, state.activeChannel) : state.unreadByChannel,
    })),
  setComposeChannel: (channel) => set({ composeChannel: channel }),
  setCurrentAccountId: (accountId) => set({ currentAccountId: accountId }),
  setDraft: (draft) => set({ draft }),
}));
