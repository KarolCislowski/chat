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

export type OnlineStatus = UserProfile["onlineStatus"];

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthResponse = {
  account: UserAccount;
  profile: UserProfile;
  tokens: AuthTokens;
};

type AuthMode = "login" | "register";

export type ProfileUpdateInput = Partial<
  Pick<UserProfile, "avatarUrl" | "displayName" | "language" | "onlineStatus" | "statusMessage">
>;

type AuthState = {
  account: UserAccount | null;
  error: string | null;
  hasHydrated: boolean;
  isLoading: boolean;
  mode: AuthMode;
  profile: UserProfile | null;
  tokens: AuthTokens | null;
  getFreshAccessToken: (apiBaseUrl: string) => Promise<string | null>;
  login: (apiBaseUrl: string, email: string, password: string) => Promise<void>;
  logout: (apiBaseUrl: string) => Promise<void>;
  register: (apiBaseUrl: string, email: string, password: string, displayName: string) => Promise<void>;
  setHasHydrated: (hasHydrated: boolean) => void;
  setMode: (mode: AuthMode) => void;
  updateLanguagePreference: (apiBaseUrl: string, language: UiLanguage) => Promise<void>;
  updateProfile: (apiBaseUrl: string, profileUpdate: ProfileUpdateInput) => Promise<boolean>;
};

async function getErrorMessage(response: Response) {
  const errorPayload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = Array.isArray(errorPayload?.message) ? errorPayload.message.join(", ") : errorPayload?.message;

  return message ?? `Request failed with ${response.status}`;
}

async function requestAuth(apiBaseUrl: string, path: string, body: unknown): Promise<AuthResponse> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    body: JSON.stringify(body),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return response.json() as Promise<AuthResponse>;
}

function getTokenExpiration(accessToken: string) {
  const [, payload] = accessToken.split(".");

  if (!payload) {
    return null;
  }

  try {
    const decodedPayload = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return typeof decodedPayload.exp === "number" ? decodedPayload.exp * 1000 : null;
  } catch {
    return null;
  }
}

function shouldRefreshAccessToken(accessToken: string) {
  const expiresAt = getTokenExpiration(accessToken);

  if (!expiresAt) {
    return true;
  }

  return expiresAt - Date.now() < 30_000;
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
      getFreshAccessToken: async (apiBaseUrl) => {
        const tokens = get().tokens;

        if (!tokens) {
          return null;
        }

        if (!shouldRefreshAccessToken(tokens.accessToken)) {
          return tokens.accessToken;
        }

        try {
          const response = await requestAuth(apiBaseUrl, "/auth/refresh", { refreshToken: tokens.refreshToken });
          set({
            account: response.account,
            error: null,
            profile: response.profile,
            tokens: response.tokens,
          });
          return response.tokens.accessToken;
        } catch (error) {
          set({
            account: null,
            error: error instanceof Error ? error.message : "Session refresh failed",
            profile: null,
            tokens: null,
          });
          return null;
        }
      },
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
        await get().updateProfile(apiBaseUrl, { language });
      },
      updateProfile: async (apiBaseUrl, profileUpdate) => {
        const accessToken = get().tokens?.accessToken;

        if (!accessToken) {
          set({ error: "Profile update requires login." });
          return false;
        }

        set({ error: null, isLoading: true });

        try {
          const response = await fetch(`${apiBaseUrl}/users/me/profile`, {
            body: JSON.stringify(profileUpdate),
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            method: "PATCH",
          });

          if (!response.ok) {
            throw new Error(await getErrorMessage(response));
          }

          const profile = (await response.json()) as UserProfile;
          set({ error: null, isLoading: false, profile });
          return true;
        } catch (error) {
          set({ error: error instanceof Error ? error.message : "Profile update failed", isLoading: false });
          return false;
        }
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
