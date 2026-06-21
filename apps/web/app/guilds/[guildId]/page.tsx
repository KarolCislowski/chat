"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, MenuItem, Paper, Select, Tooltip, Typography } from "@mui/material";
import { PageFrame } from "../../../components/layout/page-frame";
import { resolveAvatarPath } from "../../../lib/avatar-options";
import {
  getGuildFlagSet,
  getGuildThemeAccent,
  guildBackgroundOptions,
  guildFlagSets,
  GuildThemeColor,
  resolveGuildBackgroundUrl,
  resolveGuildEmblemUrl,
} from "../../../lib/guild-flags";
import { useAuthStore } from "../../../stores/auth-store";
import { Guild, GuildRole } from "../../../stores/guild-store";
import { useLanguageStore } from "../../../stores/language-store";

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

function GuildAppearancePicker({
  disabled,
  emblemUrl,
  onChange,
  themeColor,
}: {
  disabled: boolean;
  emblemUrl: string;
  onChange: (themeColor: GuildThemeColor, emblemUrl: string) => void;
  themeColor: GuildThemeColor;
}) {
  const flagSet = getGuildFlagSet(themeColor);

  return (
    <Box sx={{ display: "grid", gap: 1.25 }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
        {guildFlagSets.map((set) => (
          <Button
            aria-label={set.label}
            disabled={disabled}
            key={set.label}
            onClick={() => onChange(set.label, set.paths[0])}
            sx={{
              bgcolor: set.accent,
              border: "1px solid",
              borderColor: themeColor === set.label ? "#f8fbff" : "rgba(255, 255, 255, 0.22)",
              boxShadow: themeColor === set.label ? `0 0 0 2px ${set.accent}55` : "none",
              height: 24,
              minWidth: 0,
              p: 0,
              width: 34,
              "&:hover": { bgcolor: set.accent, opacity: 0.86 },
            }}
            type="button"
          />
        ))}
      </Box>

      <Box
        sx={{
          bgcolor: "rgba(2, 8, 18, 0.3)",
          border: "1px solid rgba(96, 165, 250, 0.14)",
          borderRadius: 1,
          display: "grid",
          gap: 0.8,
          gridTemplateColumns: "repeat(auto-fill, minmax(42px, 1fr))",
          maxHeight: 170,
          overflowY: "auto",
          p: 1,
        }}
      >
        {flagSet.paths.map((flagPath) => {
          const isSelected = flagPath === emblemUrl;

          return (
            <Tooltip
              key={flagPath}
              placement="top"
              slotProps={{ tooltip: { sx: { bgcolor: "transparent", maxWidth: "none", p: 0 } } }}
              title={
                <Box sx={{ bgcolor: "rgba(2, 8, 18, 0.92)", border: `1px solid ${flagSet.accent}66`, borderRadius: 1, p: 1 }}>
                  <Box component="img" alt="" src={flagPath} sx={{ display: "block", height: 190, objectFit: "contain", width: 128 }} />
                </Box>
              }
            >
              <Box component="span" sx={{ display: "block" }}>
                <Button
                  aria-label={flagPath}
                  disabled={disabled}
                  onClick={() => onChange(flagSet.label, flagPath)}
                  sx={{
                    bgcolor: isSelected ? "rgba(248, 251, 255, 0.08)" : "transparent",
                    border: "1px solid",
                    borderColor: isSelected ? `${flagSet.accent}` : "transparent",
                    borderRadius: 1,
                    minWidth: 0,
                    p: 0.35,
                    width: "100%",
                    "&:hover": { bgcolor: "rgba(96, 165, 250, 0.1)", borderColor: flagSet.accent },
                  }}
                  type="button"
                >
                  <Box component="img" alt="" src={flagPath} sx={{ display: "block", height: 52, objectFit: "contain", width: 34 }} />
                </Button>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}

function GuildBackgroundPicker({
  backgroundUrl,
  disabled,
  onChange,
}: {
  backgroundUrl: string;
  disabled: boolean;
  onChange: (backgroundUrl: string) => void;
}) {
  const resolvedBackgroundUrl = resolveGuildBackgroundUrl(backgroundUrl);

  return (
    <Box
      sx={{
        bgcolor: "rgba(2, 8, 18, 0.3)",
        border: "1px solid rgba(96, 165, 250, 0.14)",
        borderRadius: 1,
        display: "grid",
        gap: 0.8,
        gridTemplateColumns: "repeat(auto-fill, minmax(112px, 1fr))",
        p: 1,
      }}
    >
      {guildBackgroundOptions.map((option) => (
        <Tooltip
          key={option}
          placement="top"
          slotProps={{ tooltip: { sx: { bgcolor: "transparent", maxWidth: "none", p: 0 } } }}
          title={
            <Box sx={{ bgcolor: "rgba(2, 8, 18, 0.92)", border: "1px solid rgba(96, 165, 250, 0.38)", borderRadius: 1, p: 1 }}>
              <Box component="img" alt="" src={option} sx={{ display: "block", height: 180, objectFit: "cover", width: 320 }} />
            </Box>
          }
        >
          <Box component="span" sx={{ display: "block" }}>
            <Button
              aria-label={option}
              disabled={disabled}
              onClick={() => onChange(option)}
              sx={{
                aspectRatio: "16 / 9",
                backgroundImage: `linear-gradient(180deg, rgba(3, 10, 20, 0.08), rgba(3, 10, 20, 0.38)), url(${option})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                border: "1px solid",
                borderColor: option === resolvedBackgroundUrl ? "#f8fbff" : "rgba(96, 165, 250, 0.16)",
                borderRadius: 1,
                boxShadow: option === resolvedBackgroundUrl ? "0 0 0 2px rgba(96, 165, 250, 0.32)" : "none",
                minWidth: 0,
                p: 0,
                width: "100%",
                "&:hover": { borderColor: "#60a5fa", filter: "brightness(1.08)" },
              }}
              type="button"
            />
          </Box>
        </Tooltip>
      ))}
    </Box>
  );
}

export default function GuildDetailsPage() {
  const params = useParams<{ guildId: string }>();
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  const account = useAuthStore((state) => state.account);
  const getFreshAccessToken = useAuthStore((state) => state.getFreshAccessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const profile = useAuthStore((state) => state.profile);
  const tokens = useAuthStore((state) => state.tokens);
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
        const response = await fetch(`${apiBaseUrl}/guilds/${params.guildId}`, {
          cache: "no-store",
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        setGuild((await response.json()) as GuildDetails);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Guild details unavailable");
      } finally {
        setIsLoading(false);
      }
    }

    void loadGuildDetails();

    return () => {
      isCancelled = true;
    };
  }, [apiBaseUrl, getFreshAccessToken, isAuthenticated, params.guildId]);

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

      setGuild((await response.json()) as GuildDetails);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Guild update failed");
    } finally {
      setIsLoading(false);
    }
  }

  function updateAppearance(nextThemeColor: GuildThemeColor, nextEmblemUrl: string, nextBackgroundUrl: string) {
    void mutateGuild(`/guilds/${params.guildId}/appearance`, {
      body: JSON.stringify({ backgroundUrl: nextBackgroundUrl, emblemUrl: nextEmblemUrl, themeColor: nextThemeColor }),
      method: "PATCH",
    });
  }

  function updateMemberRole(userId: string, role: Exclude<GuildRole, "owner">) {
    void mutateGuild(`/guilds/${params.guildId}/members/${userId}/role`, {
      body: JSON.stringify({ role }),
      method: "PATCH",
    });
  }

  function removeMember(userId: string) {
    void mutateGuild(`/guilds/${params.guildId}/members/${userId}`, {
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
                  <Chip label={guild.membership.role} size="small" sx={{ borderColor: `${accent}88`, color: accent, fontWeight: 800 }} variant="outlined" />
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
                            <Chip label={member.role} size="small" sx={{ bgcolor: `${accent}20`, color: "#bfdbfe", fontWeight: 800 }} />
                            <Chip label={member.user?.onlineStatus ?? t.offline} size="small" sx={{ bgcolor: "rgba(96, 165, 250, 0.12)", color: "#9badbf", fontWeight: 700 }} />
                          </Box>
                        </Box>
                      </Box>

                      {canManageMember ? (
                        <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 1, justifyContent: { md: "flex-end" } }}>
                          <Select
                            disabled={isLoading}
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
                            <MenuItem value="member">member</MenuItem>
                            <MenuItem value="officer">officer</MenuItem>
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
                      onChange={(nextThemeColor, nextEmblemUrl) => updateAppearance(nextThemeColor, nextEmblemUrl, backgroundUrl)}
                      themeColor={guild.themeColor}
                    />
                    <Typography sx={{ color: "#7dd3fc", fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
                      {t.guildBackground}
                    </Typography>
                    <GuildBackgroundPicker
                      backgroundUrl={backgroundUrl}
                      disabled={isLoading}
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
