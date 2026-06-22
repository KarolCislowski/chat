"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, MenuItem, Paper, Select, Typography } from "@mui/material";
import { resolveAvatarPath } from "../../../lib/avatar-options";
import { getGuildThemeAccent, resolveGuildBackgroundUrl, resolveGuildEmblemUrl } from "../../../lib/guild-flags";
import type { GuildThemeColor } from "../../../lib/guild-flags";
import { useAuthStore } from "../../../stores/auth-store";
import { useGuildStore } from "../../../stores/guild-store";
import type { Guild, GuildRole } from "../../../stores/guild-store";
import { useLanguageStore } from "../../../stores/language-store";
import { PageFrame } from "../../shared/ui/page-frame";
import { GuildAppearancePicker } from "../ui/guild-appearance-picker";
import { GuildBackgroundPicker } from "../ui/guild-background-picker";

/** Member profile entry displayed in guild details management. */
type GuildMemberProfile = {
  userId: string;
  role: GuildRole;
  joinedAt: string;
  user: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
    onlineStatus: "offline" | "online" | "away" | "busy";
    statusMessage: string;
  } | null;
};

/** Detailed guild payload including member profiles for owner management. */
type GuildDetails = Guild & {
  memberProfiles: GuildMemberProfile[];
};

const panelSx = {
  bgcolor: "rgba(4, 15, 28, 0.78)",
  border: "1px solid rgba(96, 165, 250, 0.16)",
  borderRadius: 1,
  boxShadow: "0 18px 46px rgba(0, 0, 0, 0.24)",
  color: "#e5edf7",
};

function authHeaders(accessToken: string) {
  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

async function getErrorMessage(response: Response) {
  const errorPayload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = Array.isArray(errorPayload?.message) ? errorPayload.message.join(", ") : errorPayload?.message;

  return message ?? `Request failed with ${response.status}`;
}

type GuildDetailsPageProps = {
  /** Guild ID read from the guild details route. */
  guildId: string;
};

/**
 * Renders the guild details and management page.
 *
 * @param props - Route-level guild details props.
 * @param props.guildId - Guild ID to load and manage.
 * @returns Guild details page with members and appearance controls.
 */
export function GuildDetailsPage({ guildId }: GuildDetailsPageProps) {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  const account = useAuthStore((state) => state.account);
  const getFreshAccessToken = useAuthStore((state) => state.getFreshAccessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const profile = useAuthStore((state) => state.profile);
  const tokens = useAuthStore((state) => state.tokens);
  const syncGuild = useGuildStore((state) => state.syncGuild);
  const t = useLanguageStore((state) => state.t);
  const [error, setError] = useState<string | null>(null);
  const [guild, setGuild] = useState<GuildDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const isAuthenticated = Boolean(profile && tokens?.accessToken);
  const isOwner = guild?.membership.role === "owner";
  const accent = getGuildThemeAccent(guild?.themeColor);
  const backgroundUrl = resolveGuildBackgroundUrl(guild?.backgroundUrl);
  const emblemUrl = resolveGuildEmblemUrl(guild?.emblemUrl, guild?.themeColor);

  const sortedMembers = useMemo(() => {
    const roleWeight: Record<GuildRole, number> = { owner: 0, officer: 1, member: 2 };

    return [...(guild?.memberProfiles ?? [])].sort((left, right) => roleWeight[left.role] - roleWeight[right.role]);
  }, [guild?.memberProfiles]);
  const roleLabels: Record<GuildRole, string> = {
    member: t.memberRole,
    officer: t.officerRole,
    owner: t.ownerRole,
  };

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    let isCancelled = false;

    async function loadGuildDetails() {
      const accessToken = await getFreshAccessToken(apiBaseUrl);

      if (!accessToken || isCancelled) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/guilds/${guildId}`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        const guildDetails = (await response.json()) as GuildDetails;
        setGuild(guildDetails);
        syncGuild(guildDetails);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : t.guildDetailsUnavailable);
      } finally {
        setIsLoading(false);
      }
    }

    void loadGuildDetails();

    return () => {
      isCancelled = true;
    };
  }, [apiBaseUrl, getFreshAccessToken, guildId, isAuthenticated, syncGuild, t.guildDetailsUnavailable]);

  async function mutateGuild(path: string, init: RequestInit) {
    const accessToken = await getFreshAccessToken(apiBaseUrl);

    if (!accessToken) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        ...init,
        headers: authHeaders(accessToken),
      });

      if (!response.ok) {
        throw new Error(await getErrorMessage(response));
      }

      const guildDetails = (await response.json()) as GuildDetails;
      setGuild(guildDetails);
      syncGuild(guildDetails);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : t.guildUpdateFailed);
    } finally {
      setIsLoading(false);
    }
  }

  function updateAppearance(nextThemeColor: GuildThemeColor, nextEmblemUrl: string, nextBackgroundUrl: string) {
    void mutateGuild(`/guilds/${guildId}/appearance`, {
      body: JSON.stringify({ backgroundUrl: nextBackgroundUrl, emblemUrl: nextEmblemUrl, themeColor: nextThemeColor }),
      method: "PATCH",
    });
  }

  function updateMemberRole(userId: string, role: Exclude<GuildRole, "owner">) {
    void mutateGuild(`/guilds/${guildId}/members/${userId}/role`, {
      body: JSON.stringify({ role }),
      method: "PATCH",
    });
  }

  function removeMember(userId: string) {
    void mutateGuild(`/guilds/${guildId}/members/${userId}`, {
      method: "DELETE",
    });
  }

  return (
    <PageFrame>
      <Box sx={{ alignSelf: "start", display: "grid", gap: 3, justifySelf: "center", maxWidth: 1180, width: "100%" }}>
        <Button
          component={Link}
          href="/guilds"
          sx={{ color: "#bfdbfe", fontWeight: 800, justifySelf: "start", textTransform: "none" }}
          type="button"
        >
          {t.backToGuilds}
        </Button>

        {error ? (
          <Alert severity="warning" variant="outlined">
            {error}
          </Alert>
        ) : null}

        {guild ? (
          <>
            <Paper
              sx={{
                ...panelSx,
                alignItems: "center",
                background: `linear-gradient(90deg, rgba(3, 10, 20, 0.92), rgba(3, 10, 20, 0.44)), url(${backgroundUrl})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                display: "grid",
                gap: { xs: 2, md: 3 },
                gridTemplateColumns: { xs: "82px minmax(0, 1fr)", md: "128px minmax(0, 1fr) auto" },
                minHeight: { xs: 220, md: 300 },
                overflow: "hidden",
                p: { xs: 2.5, md: 4 },
              }}
            >
              <Box component="img" alt="" src={emblemUrl} sx={{ filter: "drop-shadow(0 18px 24px rgba(0, 0, 0, 0.58))", height: { xs: 170, md: 240 }, objectFit: "contain", width: { xs: 76, md: 120 } }} />
              <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ color: accent, fontSize: "0.75rem", fontWeight: 900, letterSpacing: 1.5, textTransform: "uppercase" }}>
                  {t.guildDetails}
                </Typography>
                <Typography component="h1" sx={{ color: "#f8fbff", fontSize: { xs: "2rem", md: "3rem" }, fontWeight: 900, lineHeight: 1.05, mt: 0.5, overflowWrap: "anywhere" }}>
                  {guild.name}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
                  <Chip label={`/${guild.slug}`} size="small" sx={{ bgcolor: "rgba(2, 8, 18, 0.42)", color: "#bfdbfe", fontWeight: 800 }} />
                  <Chip label={`${guild.members.length} ${t.members}`} size="small" sx={{ bgcolor: `${accent}26`, color: "#f8fbff", fontWeight: 800 }} />
                  <Chip label={guild.membership.role ? roleLabels[guild.membership.role] : t.offline} size="small" sx={{ borderColor: `${accent}88`, color: accent, fontWeight: 800 }} variant="outlined" />
                </Box>
              </Box>
              <Button
                component={Link}
                href="/"
                sx={{ borderColor: `${accent}88`, color: "#f8fbff", display: { xs: "none", md: "inline-flex" }, fontWeight: 800, textTransform: "none" }}
                variant="outlined"
              >
                {t.backToChat}
              </Button>
            </Paper>

            <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.15fr) minmax(360px, 0.85fr)" } }}>
              <Paper sx={{ ...panelSx, display: "grid", gap: 1.5, p: 2.5 }}>
                <Typography component="h2" sx={{ color: "#f0b35f", fontSize: "1.05rem", fontWeight: 900, letterSpacing: 0.4 }}>
                  {t.memberManagement}
                </Typography>

                {sortedMembers.map((member) => {
                  const isCurrentUser = member.userId === account?.id;
                  const canManageMember = isOwner && member.role !== "owner" && !isCurrentUser;

                  return (
                    <Box
                      key={member.userId}
                      sx={{
                        alignItems: { xs: "flex-start", md: "center" },
                        bgcolor: "rgba(2, 8, 18, 0.32)",
                        border: "1px solid rgba(96, 165, 250, 0.12)",
                        borderRadius: 1,
                        display: "grid",
                        gap: 1.5,
                        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) auto" },
                        p: 1.5,
                      }}
                    >
                      <Box sx={{ alignItems: "center", display: "flex", gap: 1.25, minWidth: 0 }}>
                        <Avatar src={resolveAvatarPath(member.user?.avatarUrl)} sx={{ bgcolor: "#132337", height: 52, width: 52 }} />
                        <Box sx={{ minWidth: 0 }}>
                          <Typography sx={{ color: "#f8fbff", fontWeight: 900, overflowWrap: "anywhere" }}>
                            {member.user?.displayName ?? member.userId}
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 0.55 }}>
                            <Chip label={roleLabels[member.role]} size="small" sx={{ bgcolor: `${accent}20`, color: "#bfdbfe", fontWeight: 800 }} />
                            <Chip label={member.user?.onlineStatus ?? t.offline} size="small" sx={{ bgcolor: "rgba(96, 165, 250, 0.12)", color: "#9badbf", fontWeight: 700 }} />
                          </Box>
                        </Box>
                      </Box>

                      {canManageMember ? (
                        <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 1, justifyContent: { md: "flex-end" } }}>
                          <Select
                            disabled={isLoading}
                            inputProps={{
                              "aria-label": `Role for ${member.user?.displayName ?? member.userId}`,
                            }}
                            onChange={(event) => updateMemberRole(member.userId, event.target.value as Exclude<GuildRole, "owner">)}
                            size="small"
                            sx={{
                              color: "#e5edf7",
                              minWidth: 132,
                              "& .MuiOutlinedInput-notchedOutline": { borderColor: "rgba(96, 165, 250, 0.24)" },
                              "& .MuiSvgIcon-root": { color: "#9badbf" },
                            }}
                            value={member.role === "owner" ? "member" : member.role}
                          >
                            <MenuItem value="member">{t.memberRole}</MenuItem>
                            <MenuItem value="officer">{t.officerRole}</MenuItem>
                          </Select>
                          <Button
                            color="warning"
                            disabled={isLoading}
                            onClick={() => removeMember(member.userId)}
                            sx={{ fontWeight: 800, textTransform: "none" }}
                            type="button"
                            variant="outlined"
                          >
                            {t.removeMember}
                          </Button>
                        </Box>
                      ) : null}
                    </Box>
                  );
                })}
              </Paper>

              <Paper sx={{ ...panelSx, alignContent: "start", display: "grid", gap: 1.5, p: 2.5 }}>
                <Typography component="h2" sx={{ color: "#f0b35f", fontSize: "1.05rem", fontWeight: 900, letterSpacing: 0.4 }}>
                  {t.guildAppearance}
                </Typography>
                {isOwner ? (
                  <>
                    <GuildAppearancePicker
                      disabled={isLoading}
                      emblemUrl={emblemUrl}
                      maxHeight={170}
                      onChange={(nextThemeColor, nextEmblemUrl) => updateAppearance(nextThemeColor, nextEmblemUrl, backgroundUrl)}
                      themeColor={guild.themeColor}
                    />
                    <Typography sx={{ color: "#7dd3fc", fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
                      {t.guildBackground}
                    </Typography>
                    <GuildBackgroundPicker
                      backgroundUrl={backgroundUrl}
                      disabled={isLoading}
                      minColumnWidth={112}
                      onChange={(nextBackgroundUrl) => updateAppearance(guild.themeColor, emblemUrl, nextBackgroundUrl)}
                    />
                  </>
                ) : (
                  <Typography sx={{ color: "#8ca3ba" }}>{t.ownerOnly}</Typography>
                )}
              </Paper>
            </Box>
          </>
        ) : !isLoading ? (
          <Paper sx={{ ...panelSx, p: 2.5 }}>
            <Typography sx={{ color: "#8ca3ba" }}>{t.guildDetails}</Typography>
          </Paper>
        ) : null}
      </Box>
    </PageFrame>
  );
}
