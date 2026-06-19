import { create } from "zustand";
import { io, Socket } from "socket.io-client";

export type ApiHealth = {
  status: string;
  database: string;
};

export type ChatConnectionStatus = "connected" | "connecting" | "disconnected";

export type Message = {
  _id: string;
  senderId: string;
  sender: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
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

type ChatState = {
  connectionError: string | null;
  connectionStatus: ChatConnectionStatus;
  draft: string;
  health: ApiHealth | null;
  healthError: string | null;
  messages: Message[];
  connectRealtime: (apiBaseUrl: string, accessToken: string) => void;
  disconnectRealtime: () => void;
  loadGlobalMessages: (apiBaseUrl: string, accessToken: string) => Promise<void>;
  loadHealth: (apiBaseUrl: string) => Promise<void>;
  sendGlobalMessage: (content: string) => void;
  setDraft: (draft: string) => void;
};

let socket: Socket | null = null;

function upsertMessage(messages: Message[], message: Message) {
  if (messages.some((existingMessage) => existingMessage._id === message._id)) {
    return messages;
  }

  return [...messages, message].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
}

async function getErrorMessage(response: Response) {
  const errorPayload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = Array.isArray(errorPayload?.message) ? errorPayload.message.join(", ") : errorPayload?.message;

  return message ?? `Request failed with ${response.status}`;
}

export const useChatStore = create<ChatState>((set, get) => ({
  connectionError: null,
  connectionStatus: "disconnected",
  draft: "",
  health: null,
  healthError: null,
  messages: [],
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
      set((state) => ({
        messages: upsertMessage(state.messages, message),
      }));
    });
  },
  disconnectRealtime: () => {
    socket?.disconnect();
    socket = null;
    set({ connectionError: null, connectionStatus: "disconnected", draft: "", messages: [] });
  },
  loadGlobalMessages: async (apiBaseUrl, accessToken) => {
    try {
      const response = await fetch(`${apiBaseUrl}/messages/global`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const messages = (await response.json()) as Message[];
      set({ connectionError: null, messages });
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
  sendGlobalMessage: (content) => {
    const text = content.trim();

    if (!text || !socket?.connected) {
      if (text) {
        set({ connectionError: "Chat socket is not connected." });
      }
      return;
    }

    socket.emit("message:create", { content: text });
    set({ connectionError: null, draft: "" });
  },
  setDraft: (draft) => set({ draft }),
}));
