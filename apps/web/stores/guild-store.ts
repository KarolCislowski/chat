import { create } from "zustand";
import { defaultGuildBackgroundUrl, defaultGuildEmblemUrl, defaultGuildThemeColor, GuildThemeColor } from "../lib/guild-flags";

export type GuildRole = "owner" | "officer" | "member";
export type JoinRequestStatus = "pending" | "accepted" | "rejected";

export type Guild = {
  _id: string;
  name: string;
  slug: string;
  ownerId: string;
  members: string[];
  inviteCodes: string[];
  themeColor: GuildThemeColor;
  emblemUrl: string;
  backgroundUrl: string;
  createdAt: string;
  membership: {
    role: GuildRole | null;
  };
  joinRequestStatus?: JoinRequestStatus | null;
};

export type GuildJoinRequest = {
  _id: string;
  guildId: string;
  userId: string;
  status: JoinRequestStatus;
  createdAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
};

type GuildState = {
  availableGuilds: Guild[];
  error: string | null;
  guilds: Guild[];
  isLoading: boolean;
  joinRequestsByGuildId: Record<string, GuildJoinRequest[]>;
  backgroundUrl: string;
  emblemUrl: string;
  name: string;
  themeColor: GuildThemeColor;
  acceptJoinRequest: (apiBaseUrl: string, accessToken: string, guildId: string, requestId: string) => Promise<void>;
  createGuild: (apiBaseUrl: string, accessToken: string) => Promise<void>;
  inviteMember: (apiBaseUrl: string, accessToken: string, guildId: string, userId: string) => Promise<void>;
  loadAvailableGuilds: (apiBaseUrl: string, accessToken: string) => Promise<void>;
  loadGuilds: (apiBaseUrl: string, accessToken: string) => Promise<void>;
  loadJoinRequests: (apiBaseUrl: string, accessToken: string, guildId: string) => Promise<void>;
  requestJoin: (apiBaseUrl: string, accessToken: string, guildId: string) => Promise<void>;
  setBackgroundUrl: (backgroundUrl: string) => void;
  setEmblemUrl: (emblemUrl: string) => void;
  setName: (name: string) => void;
  setThemeColor: (themeColor: GuildThemeColor, emblemUrl: string) => void;
  updateGuildAppearance: (
    apiBaseUrl: string,
    accessToken: string,
    guildId: string,
    themeColor: GuildThemeColor,
    emblemUrl: string,
    backgroundUrl: string,
  ) => Promise<void>;
};

async function getErrorMessage(response: Response) {
  const errorPayload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = Array.isArray(errorPayload?.message) ? errorPayload.message.join(", ") : errorPayload?.message;

  return message ?? `Request failed with ${response.status}`;
}

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

function upsertGuild(guilds: Guild[], guild: Guild) {
  if (guilds.some((existingGuild) => existingGuild._id === guild._id)) {
    return guilds.map((existingGuild) => (existingGuild._id === guild._id ? guild : existingGuild));
  }

  return [guild, ...guilds];
}

export const useGuildStore = create<GuildState>((set, get) => ({
  availableGuilds: [],
  error: null,
  guilds: [],
  isLoading: false,
  joinRequestsByGuildId: {},
  backgroundUrl: defaultGuildBackgroundUrl,
  emblemUrl: defaultGuildEmblemUrl,
  name: "",
  themeColor: defaultGuildThemeColor,
  acceptJoinRequest: async (apiBaseUrl, accessToken, guildId, requestId) => {
    set({ error: null, isLoading: true });

    try {
      const response = await fetch(`${apiBaseUrl}/guilds/${guildId}/join-requests/${requestId}/accept`, {
        headers: authHeaders(accessToken),
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      set((state) => ({
        error: null,
        isLoading: false,
        joinRequestsByGuildId: {
          ...state.joinRequestsByGuildId,
          [guildId]: (state.joinRequestsByGuildId[guildId] ?? []).filter((request) => request._id !== requestId),
        },
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Join request approval failed", isLoading: false });
    }
  },
  createGuild: async (apiBaseUrl, accessToken) => {
    const name = get().name.trim();
    const { backgroundUrl, emblemUrl, themeColor } = get();

    if (!name) {
      return;
    }

    set({ error: null, isLoading: true });

    try {
      const response = await fetch(`${apiBaseUrl}/guilds`, {
        body: JSON.stringify({ backgroundUrl, emblemUrl, name, themeColor }),
        headers: authHeaders(accessToken),
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const guild = (await response.json()) as Guild;
      set((state) => ({
        backgroundUrl: defaultGuildBackgroundUrl,
        emblemUrl: defaultGuildEmblemUrl,
        error: null,
        guilds: upsertGuild(state.guilds, guild),
        isLoading: false,
        name: "",
        themeColor: defaultGuildThemeColor,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Guild creation failed", isLoading: false });
    }
  },
  inviteMember: async (apiBaseUrl, accessToken, guildId, userId) => {
    set({ error: null, isLoading: true });

    try {
      const response = await fetch(`${apiBaseUrl}/guilds/${guildId}/members`, {
        body: JSON.stringify({ userId }),
        headers: authHeaders(accessToken),
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const guild = (await response.json()) as Guild;
      set((state) => ({ error: null, guilds: upsertGuild(state.guilds, guild), isLoading: false }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Guild invitation failed", isLoading: false });
    }
  },
  loadAvailableGuilds: async (apiBaseUrl, accessToken) => {
    try {
      const response = await fetch(`${apiBaseUrl}/guilds/available`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const availableGuilds = (await response.json()) as Guild[];
      set({ availableGuilds, error: null });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Available guilds unavailable" });
    }
  },
  loadGuilds: async (apiBaseUrl, accessToken) => {
    set({ error: null, isLoading: true });

    try {
      const response = await fetch(`${apiBaseUrl}/guilds/mine`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const guilds = (await response.json()) as Guild[];
      set({ error: null, guilds, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Guilds unavailable", isLoading: false });
    }
  },
  loadJoinRequests: async (apiBaseUrl, accessToken, guildId) => {
    try {
      const response = await fetch(`${apiBaseUrl}/guilds/${guildId}/join-requests`, {
        cache: "no-store",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const requests = (await response.json()) as GuildJoinRequest[];
      set((state) => ({
        error: null,
        joinRequestsByGuildId: {
          ...state.joinRequestsByGuildId,
          [guildId]: requests,
        },
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Join requests unavailable" });
    }
  },
  requestJoin: async (apiBaseUrl, accessToken, guildId) => {
    set({ error: null, isLoading: true });

    try {
      const response = await fetch(`${apiBaseUrl}/guilds/${guildId}/join-requests`, {
        headers: authHeaders(accessToken),
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      set((state) => ({
        availableGuilds: state.availableGuilds.map((guild) =>
          guild._id === guildId ? { ...guild, joinRequestStatus: "pending" } : guild,
        ),
        error: null,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Join request failed", isLoading: false });
    }
  },
  setBackgroundUrl: (backgroundUrl) => set({ backgroundUrl }),
  setEmblemUrl: (emblemUrl) => set({ emblemUrl }),
  setName: (name) => set({ name }),
  setThemeColor: (themeColor, emblemUrl) => set({ emblemUrl, themeColor }),
  updateGuildAppearance: async (apiBaseUrl, accessToken, guildId, themeColor, emblemUrl, backgroundUrl) => {
    set({ error: null, isLoading: true });

    try {
      const response = await fetch(`${apiBaseUrl}/guilds/${guildId}/appearance`, {
        body: JSON.stringify({ backgroundUrl, emblemUrl, themeColor }),
        headers: authHeaders(accessToken),
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const guild = (await response.json()) as Guild;
      set((state) => ({
        availableGuilds: state.availableGuilds.map((availableGuild) => (availableGuild._id === guild._id ? guild : availableGuild)),
        error: null,
        guilds: upsertGuild(state.guilds, guild),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : "Guild appearance update failed", isLoading: false });
    }
  },
}));
