import { create } from "zustand";
import { defaultGuildBackgroundUrl, defaultGuildEmblemUrl, defaultGuildThemeColor, GuildThemeColor } from "../lib/guild-flags";

/** Role assigned to a user inside a guild membership. */
export type GuildRole = "owner" | "officer" | "member";

/** Lifecycle state of a request to join a guild. */
export type JoinRequestStatus = "pending" | "accepted" | "rejected";

/** Guild summary returned by guild list and details endpoints. */
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

/** Pending or historical membership request for a guild. */
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
  /**
   * Approves a pending guild join request.
   *
   * @param apiBaseUrl - Base URL of the API server.
   * @param accessToken - JWT access token of a user allowed to manage requests.
   * @param guildId - Guild that owns the request.
   * @param requestId - Join request to accept.
   * @returns A promise that resolves after request state is updated.
   */
  acceptJoinRequest: (apiBaseUrl: string, accessToken: string, guildId: string, requestId: string) => Promise<void>;
  /**
   * Creates a guild using the draft name and appearance stored in this store.
   *
   * @param apiBaseUrl - Base URL of the API server.
   * @param accessToken - JWT access token of the creating user.
   * @returns A promise that resolves after the guild list is updated.
   */
  createGuild: (apiBaseUrl: string, accessToken: string) => Promise<void>;
  /**
   * Adds a user directly to a guild, used by owner/officer invite actions.
   *
   * @param apiBaseUrl - Base URL of the API server.
   * @param accessToken - JWT access token of a user allowed to invite members.
   * @param guildId - Guild receiving the member.
   * @param userId - Account ID of the invited user.
   * @returns A promise that resolves after guild state is updated.
   */
  inviteMember: (apiBaseUrl: string, accessToken: string, guildId: string, userId: string) => Promise<void>;
  /**
   * Loads guilds that the current user can request to join.
   *
   * @param apiBaseUrl - Base URL of the API server.
   * @param accessToken - JWT access token of the current user.
   * @returns A promise that resolves after available guilds are stored.
   */
  loadAvailableGuilds: (apiBaseUrl: string, accessToken: string) => Promise<void>;
  /**
   * Loads guilds where the current user is already a member.
   *
   * @param apiBaseUrl - Base URL of the API server.
   * @param accessToken - JWT access token of the current user.
   * @returns A promise that resolves after member guilds are stored.
   */
  loadGuilds: (apiBaseUrl: string, accessToken: string) => Promise<void>;
  /**
   * Loads pending join requests for a manageable guild.
   *
   * @param apiBaseUrl - Base URL of the API server.
   * @param accessToken - JWT access token of a user allowed to view requests.
   * @param guildId - Guild whose requests should be loaded.
   * @returns A promise that resolves after request state is stored.
   */
  loadJoinRequests: (apiBaseUrl: string, accessToken: string, guildId: string) => Promise<void>;
  /**
   * Sends a join request for the selected guild.
   *
   * @param apiBaseUrl - Base URL of the API server.
   * @param accessToken - JWT access token of the requesting user.
   * @param guildId - Guild the user wants to join.
   * @returns A promise that resolves after request status is reflected locally.
   */
  requestJoin: (apiBaseUrl: string, accessToken: string, guildId: string) => Promise<void>;
  setBackgroundUrl: (backgroundUrl: string) => void;
  setEmblemUrl: (emblemUrl: string) => void;
  setName: (name: string) => void;
  setThemeColor: (themeColor: GuildThemeColor, emblemUrl: string) => void;
  /**
   * Merges a guild returned by another screen into all local guild collections.
   *
   * @param guild - Fresh guild data from the API.
   * @returns Nothing.
   */
  syncGuild: (guild: Guild) => void;
  /**
   * Persists a guild's visual identity.
   *
   * @param apiBaseUrl - Base URL of the API server.
   * @param accessToken - JWT access token of a user allowed to edit the guild.
   * @param guildId - Guild being updated.
   * @param themeColor - Selected guild theme color.
   * @param emblemUrl - Selected guild emblem URL.
   * @param backgroundUrl - Selected guild hero background URL.
   * @returns A promise that resolves after local guild state is updated.
   */
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

/**
 * Inserts or replaces a guild in a list while keeping newest guilds first.
 *
 * @param guilds - Existing guild list.
 * @param guild - Guild returned by the API.
 * @returns A guild list containing the fresh guild state.
 */
function upsertGuild(guilds: Guild[], guild: Guild) {
  if (guilds.some((existingGuild) => existingGuild._id === guild._id)) {
    return guilds.map((existingGuild) => (existingGuild._id === guild._id ? guild : existingGuild));
  }

  return [guild, ...guilds];
}

/** Zustand store for guild lists, creation drafts, join requests, and appearance updates. */
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
  syncGuild: (guild) =>
    set((state) => ({
      availableGuilds: state.availableGuilds.map((availableGuild) => (availableGuild._id === guild._id ? guild : availableGuild)),
      guilds: upsertGuild(state.guilds, guild),
    })),
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
