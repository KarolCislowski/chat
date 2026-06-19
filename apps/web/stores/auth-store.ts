import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { UiLanguage } from "../i18n/translations";

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
  language: UiLanguage;
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
  hasHydrated: boolean;
  isLoading: boolean;
  mode: AuthMode;
  profile: UserProfile | null;
  tokens: AuthTokens | null;
  login: (apiBaseUrl: string, email: string, password: string) => Promise<void>;
  logout: (apiBaseUrl: string) => Promise<void>;
  register: (apiBaseUrl: string, email: string, password: string, displayName: string) => Promise<void>;
  setHasHydrated: (hasHydrated: boolean) => void;
  setMode: (mode: AuthMode) => void;
  updateLanguagePreference: (apiBaseUrl: string, language: UiLanguage) => Promise<void>;
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
      hasHydrated: false,
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
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      setMode: (mode) => set({ error: null, mode }),
      updateLanguagePreference: async (apiBaseUrl, language) => {
        const accessToken = get().tokens?.accessToken;

        set((state) => ({
          profile: state.profile ? { ...state.profile, language } : state.profile,
        }));

        if (!accessToken) {
          return;
        }

        const response = await fetch(`${apiBaseUrl}/users/me/profile`, {
          body: JSON.stringify({ language }),
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          method: "PATCH",
        });

        if (!response.ok) {
          set({ error: `Language preference update failed with ${response.status}` });
          return;
        }

        const profile = (await response.json()) as UserProfile;
        set({ error: null, profile });
      },
    }),
    {
      name: "chat-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
      partialize: (state) => ({
        account: state.account,
        profile: state.profile,
        tokens: state.tokens,
      }),
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
