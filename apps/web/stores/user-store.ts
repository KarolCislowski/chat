import { create } from "zustand";
import type { OnlineStatus } from "./chat-store";

export type ChatUser = {
  id: string;
  accountId: string;
  displayName: string;
  avatarUrl: string | null;
  statusMessage: string;
  onlineStatus: OnlineStatus;
  language: string;
};

type UserState = {
  error: string | null;
  isLoading: boolean;
  users: ChatUser[];
  loadUsers: (apiBaseUrl: string, accessToken: string) => Promise<void>;
  updateUserPresence: (accountId: string, onlineStatus: OnlineStatus) => void;
};

async function getErrorMessage(response: Response) {
  const errorPayload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = Array.isArray(errorPayload?.message) ? errorPayload.message.join(", ") : errorPayload?.message;

  return message ?? `Request failed with ${response.status}`;
}

export const useUserStore = create<UserState>((set) => ({
  error: null,
  isLoading: false,
  users: [],
  loadUsers: async (apiBaseUrl, accessToken) => {
    set({ error: null, isLoading: true });

    try {
      const response = await fetch(`${apiBaseUrl}/users`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const users = (await response.json()) as ChatUser[];
      set({ error: null, isLoading: false, users });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Users unavailable", isLoading: false });
    }
  },
  updateUserPresence: (accountId, onlineStatus) =>
    set((state) => ({
      users: state.users.map((user) => (user.accountId === accountId ? { ...user, onlineStatus } : user)),
    })),
}));
