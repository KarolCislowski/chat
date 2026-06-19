import { create } from "zustand";

export type ApiHealth = {
  status: string;
  database: string;
};

export type Message = {
  id: number;
  author: "Ty" | "System";
  text: string;
  time: string;
};

type ChatState = {
  draft: string;
  health: ApiHealth | null;
  healthError: string | null;
  messages: Message[];
  addMessage: (text: string) => void;
  loadHealth: (apiBaseUrl: string) => Promise<void>;
  setDraft: (draft: string) => void;
};

const initialMessages: Message[] = [
  {
    id: 1,
    author: "System",
    text: "Frontend jest gotowy. Podlacz endpoint wiadomosci w API, gdy model danych bedzie gotowy.",
    time: "teraz",
  },
];

function formatMessageTime() {
  return new Intl.DateTimeFormat("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

export const useChatStore = create<ChatState>((set) => ({
  draft: "",
  health: null,
  healthError: null,
  messages: initialMessages,
  addMessage: (text) =>
    set((state) => ({
      draft: "",
      messages: [
        ...state.messages,
        {
          id: Date.now(),
          author: "Ty",
          text,
          time: formatMessageTime(),
        },
      ],
    })),
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
  setDraft: (draft) => set({ draft }),
}));
