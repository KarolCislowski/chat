import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type UserAccount = {
  id: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
};

export type UserProfile = {
  id: string;
  accountId: string;
  displayName: string;
  avatarUrl: string | null;
  statusMessage: string;
  onlineStatus: "offline" | "online" | "away" | "busy";
};

type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthResponse = {
  account: UserAccount;
  profile: UserProfile;
  tokens: AuthTokens;
};

type AuthMode = "login" | "register";

type AuthState = {
  account: UserAccount | null;
  error: string | null;
  isLoading: boolean;
  mode: AuthMode;
  profile: UserProfile | null;
  tokens: AuthTokens | null;
  login: (apiBaseUrl: string, email: string, password: string) => Promise<void>;
  logout: (apiBaseUrl: string) => Promise<void>;
  register: (apiBaseUrl: string, email: string, password: string, displayName: string) => Promise<void>;
  setMode: (mode: AuthMode) => void;
};

async function requestAuth(apiBaseUrl: string, path: string, body: unknown): Promise<AuthResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
    const message = Array.isArray(errorPayload?.message) ? errorPayload.message.join(", ") : errorPayload?.message;
    throw new Error(message ?? `Request failed with ${response.status}`);
  }

  return response.json() as Promise<AuthResponse>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      account: null,
      error: null,
      isLoading: false,
      mode: "login",
      profile: null,
      tokens: null,
      login: async (apiBaseUrl, email, password) => {
        set({ error: null, isLoading: true });

        try {
          const response = await requestAuth(apiBaseUrl, "/auth/login", { email, password });
          set({
            account: response.account,
            error: null,
            isLoading: false,
            profile: response.profile,
            tokens: response.tokens,
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Login failed", isLoading: false });
        }
      },
      logout: async (apiBaseUrl) => {
        const accessToken = get().tokens?.accessToken;

        if (accessToken) {
          await fetch(`${apiBaseUrl}/auth/logout`, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
          }).catch(() => undefined);
        }

        set({ account: null, error: null, profile: null, tokens: null });
      },
      register: async (apiBaseUrl, email, password, displayName) => {
        set({ error: null, isLoading: true });

        try {
          const response = await requestAuth(apiBaseUrl, "/auth/register", { displayName, email, password });
          set({
            account: response.account,
            error: null,
            isLoading: false,
            profile: response.profile,
            tokens: response.tokens,
          });
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Registration failed", isLoading: false });
        }
      },
      setMode: (mode) => set({ error: null, mode }),
    }),
    {
      name: "chat-auth",
      partialize: (state) => ({
        account: state.account,
        profile: state.profile,
        tokens: state.tokens,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
