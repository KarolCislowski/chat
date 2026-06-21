"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect } from "react";
import { Alert, Box, Button, Chip, Paper, TextField, Typography } from "@mui/material";
import { PageFrame } from "../../components/layout/page-frame";
import {
  getGuildFlagSet,
  getGuildThemeAccent,
  guildBackgroundOptions,
  guildFlagSets,
  GuildThemeColor,
  resolveGuildBackgroundUrl,
  resolveGuildEmblemUrl,
} from "../../lib/guild-flags";
import { useAuthStore } from "../../stores/auth-store";
import { Guild, useGuildStore } from "../../stores/guild-store";
import { useLanguageStore } from "../../stores/language-store";

function canManageGuild(guild: Guild) {
  return guild.membership.role === "owner" || guild.membership.role === "officer";
}

const panelSx = {
  bgcolor: "rgba(4, 15, 28, 0.78)",
  border: "1px solid rgba(96, 165, 250, 0.16)",
  borderRadius: 1,
  boxShadow: "0 18px 46px rgba(0, 0, 0, 0.24)",
  color: "#e5edf7",
};

const fieldSx = {
  "& .MuiInputBase-input": {
    color: "#e5edf7",
  },
  "& .MuiInputLabel-root": {
    color: "#8ca3ba",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#60a5fa",
  },
  "& .MuiOutlinedInput-root": {
    bgcolor: "rgba(2, 8, 18, 0.38)",
    "& fieldset": {
      borderColor: "rgba(148, 163, 184, 0.2)",
    },
    "&:hover fieldset": {
      borderColor: "rgba(96, 165, 250, 0.42)",
    },
    "&.Mui-focused fieldset": {
      borderColor: "rgba(96, 165, 250, 0.72)",
    },
  },
};

function GuildEmblem({ guild, size = 42 }: { guild: Pick<Guild, "emblemUrl" | "name" | "themeColor">; size?: number }) {
  const accent = getGuildThemeAccent(guild.themeColor);

  return (
    <Box
      component="img"
      alt={guild.name}
      src={resolveGuildEmblemUrl(guild.emblemUrl, guild.themeColor)}
      sx={{
        border: `1px solid ${accent}88`,
        flex: "0 0 auto",
        height: size,
        objectFit: "cover",
        width: size,
      }}
    />
  );
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
              "&:hover": {
                bgcolor: set.accent,
                opacity: 0.86,
              },
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
          maxHeight: 146,
          overflowY: "auto",
          p: 1,
        }}
      >
        {flagSet.paths.map((flagPath) => {
          const isSelected = flagPath === emblemUrl;

          return (
            <Button
              aria-label={flagPath}
              disabled={disabled}
              key={flagPath}
              onClick={() => onChange(flagSet.label, flagPath)}
              sx={{
                border: "1px solid",
                borderColor: isSelected ? `${flagSet.accent}` : "rgba(96, 165, 250, 0.12)",
                borderRadius: 1,
                minWidth: 0,
                p: 0.35,
                "&:hover": {
                  bgcolor: "rgba(96, 165, 250, 0.1)",
                  borderColor: flagSet.accent,
                },
              }}
              type="button"
            >
              <Box component="img" alt="" src={flagPath} sx={{ display: "block", height: 38, objectFit: "cover", width: 38 }} />
            </Button>
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
  return (
    <Box
      sx={{
        bgcolor: "rgba(2, 8, 18, 0.3)",
        border: "1px solid rgba(96, 165, 250, 0.14)",
        borderRadius: 1,
        display: "grid",
        gap: 0.8,
        gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
        p: 1,
      }}
    >
      {guildBackgroundOptions.map((option) => {
        const resolvedBackgroundUrl = resolveGuildBackgroundUrl(backgroundUrl);
        const isSelected = option === resolvedBackgroundUrl;

        return (
          <Button
            aria-label={option}
            disabled={disabled}
            key={option}
            onClick={() => onChange(option)}
            sx={{
              aspectRatio: "16 / 9",
              backgroundImage: `linear-gradient(180deg, rgba(3, 10, 20, 0.08), rgba(3, 10, 20, 0.38)), url(${option})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              border: "1px solid",
              borderColor: isSelected ? "#f8fbff" : "rgba(96, 165, 250, 0.16)",
              borderRadius: 1,
              boxShadow: isSelected ? "0 0 0 2px rgba(96, 165, 250, 0.32)" : "none",
              minWidth: 0,
              overflow: "hidden",
              p: 0,
              "&:hover": {
                borderColor: "#60a5fa",
                filter: "brightness(1.08)",
              },
            }}
            type="button"
          />
        );
      })}
    </Box>
  );
}

export default function GuildsPage() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  const getFreshAccessToken = useAuthStore((state) => state.getFreshAccessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const profile = useAuthStore((state) => state.profile);
  const tokens = useAuthStore((state) => state.tokens);
  const acceptJoinRequest = useGuildStore((state) => state.acceptJoinRequest);
  const availableGuilds = useGuildStore((state) => state.availableGuilds);
  const createGuild = useGuildStore((state) => state.createGuild);
  const error = useGuildStore((state) => state.error);
  const guilds = useGuildStore((state) => state.guilds);
  const isLoading = useGuildStore((state) => state.isLoading);
  const joinRequestsByGuildId = useGuildStore((state) => state.joinRequestsByGuildId);
  const loadAvailableGuilds = useGuildStore((state) => state.loadAvailableGuilds);
  const loadGuilds = useGuildStore((state) => state.loadGuilds);
  const loadJoinRequests = useGuildStore((state) => state.loadJoinRequests);
  const backgroundUrl = useGuildStore((state) => state.backgroundUrl);
  const emblemUrl = useGuildStore((state) => state.emblemUrl);
  const name = useGuildStore((state) => state.name);
  const requestJoin = useGuildStore((state) => state.requestJoin);
  const setBackgroundUrl = useGuildStore((state) => state.setBackgroundUrl);
  const setEmblemUrl = useGuildStore((state) => state.setEmblemUrl);
  const setName = useGuildStore((state) => state.setName);
  const setThemeColor = useGuildStore((state) => state.setThemeColor);
  const themeColor = useGuildStore((state) => state.themeColor);
  const updateGuildAppearance = useGuildStore((state) => state.updateGuildAppearance);
  const t = useLanguageStore((state) => state.t);
  const isAuthenticated = Boolean(profile && tokens?.accessToken);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    async function loadData() {
      const accessToken = await getFreshAccessToken(apiBaseUrl);

      if (!accessToken) {
        return;
      }

      void loadGuilds(apiBaseUrl, accessToken);
      void loadAvailableGuilds(apiBaseUrl, accessToken);
    }

    void loadData();
  }, [apiBaseUrl, getFreshAccessToken, isAuthenticated, loadAvailableGuilds, loadGuilds]);

  useEffect(() => {
    if (!isAuthenticated || guilds.length === 0) {
      return;
    }

    async function loadRequests() {
      const accessToken = await getFreshAccessToken(apiBaseUrl);

      if (!accessToken) {
        return;
      }

      guilds.filter(canManageGuild).forEach((guild) => {
        void loadJoinRequests(apiBaseUrl, accessToken, guild._id);
      });
    }

    void loadRequests();
  }, [apiBaseUrl, getFreshAccessToken, guilds, isAuthenticated, loadJoinRequests]);

  async function handleCreateGuild(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const accessToken = await getFreshAccessToken(apiBaseUrl);

    if (accessToken) {
      await createGuild(apiBaseUrl, accessToken);
      void loadAvailableGuilds(apiBaseUrl, accessToken);
    }
  }

  async function handleRequestJoin(guildId: string) {
    const accessToken = await getFreshAccessToken(apiBaseUrl);

    if (accessToken) {
      void requestJoin(apiBaseUrl, accessToken, guildId);
    }
  }

  async function handleAcceptJoinRequest(guildId: string, requestId: string) {
    const accessToken = await getFreshAccessToken(apiBaseUrl);

    if (accessToken) {
      await acceptJoinRequest(apiBaseUrl, accessToken, guildId, requestId);
      void loadGuilds(apiBaseUrl, accessToken);
      void loadAvailableGuilds(apiBaseUrl, accessToken);
    }
  }

  async function handleUpdateAppearance(guildId: string, nextThemeColor: GuildThemeColor, nextEmblemUrl: string, nextBackgroundUrl: string) {
    const accessToken = await getFreshAccessToken(apiBaseUrl);

    if (accessToken) {
      await updateGuildAppearance(apiBaseUrl, accessToken, guildId, nextThemeColor, nextEmblemUrl, nextBackgroundUrl);
    }
  }

  return (
    <PageFrame>
      <Box sx={{ alignSelf: "start", display: "grid", gap: 3, justifySelf: "center", maxWidth: 1040, width: "100%" }}>
        <Box
          sx={{
            ...panelSx,
            alignItems: { xs: "flex-start", sm: "center" },
            background:
              "linear-gradient(90deg, rgba(8, 24, 39, 0.94), rgba(8, 24, 39, 0.68)), radial-gradient(circle at 82% 10%, rgba(240, 179, 95, 0.18), transparent 30%)",
            display: "flex",
            gap: 2,
            justifyContent: "space-between",
            p: { xs: 2.5, md: 3 },
          }}
        >
          <Box>
            <Typography sx={{ color: "#7dd3fc", fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>
              {t.guilds}
            </Typography>
            <Typography component="h1" sx={{ color: "#f8fbff", fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.1, mt: 0.5 }}>
              {t.myGuilds}
            </Typography>
            <Typography sx={{ color: "#9badbf", mt: 0.75 }}>{t.guildLimit}</Typography>
          </Box>
          <Button
            component={Link}
            href="/"
            sx={{ borderColor: "rgba(96, 165, 250, 0.35)", color: "#bfdbfe", fontWeight: 800, textTransform: "none" }}
            type="button"
            variant="outlined"
          >
            {t.backToChat}
          </Button>
        </Box>

        <Paper component="form" onSubmit={handleCreateGuild} sx={{ ...panelSx, display: "grid", gap: 1.5, p: 2.5 }}>
          <Typography component="h2" sx={{ color: "#f0b35f", fontSize: "1.05rem", fontWeight: 800, letterSpacing: 0.4 }}>
            {t.createGuild}
          </Typography>
          <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 320px" } }}>
            <TextField disabled={isLoading} fullWidth label={t.guildName} onChange={(event) => setName(event.target.value)} required sx={fieldSx} value={name} />
            <Box
              sx={{
                alignItems: "center",
                backgroundImage: `linear-gradient(90deg, rgba(3, 10, 20, 0.82), rgba(3, 10, 20, 0.42)), url(${resolveGuildBackgroundUrl(backgroundUrl)})`,
                backgroundPosition: "center",
                backgroundSize: "cover",
                border: "1px solid rgba(96, 165, 250, 0.16)",
                borderRadius: 1,
                display: "flex",
                gap: 1.25,
                minHeight: 72,
                p: 1,
              }}
            >
              <Box component="img" alt="" src={resolveGuildEmblemUrl(emblemUrl, themeColor)} sx={{ height: 62, objectFit: "contain", width: 42 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ color: "#7dd3fc", fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
                  {t.guildAppearance}
                </Typography>
                <Typography sx={{ color: "#8ca3ba", fontSize: "0.85rem" }}>{themeColor}</Typography>
              </Box>
            </Box>
          </Box>
          <GuildAppearancePicker
            disabled={isLoading}
            emblemUrl={emblemUrl}
            onChange={(nextThemeColor, nextEmblemUrl) => {
              setThemeColor(nextThemeColor, nextEmblemUrl);
              setEmblemUrl(nextEmblemUrl);
            }}
            themeColor={themeColor}
          />
          <Box sx={{ display: "grid", gap: 1 }}>
            <Typography sx={{ color: "#7dd3fc", fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
              {t.guildBackground}
            </Typography>
            <GuildBackgroundPicker backgroundUrl={backgroundUrl} disabled={isLoading} onChange={setBackgroundUrl} />
          </Box>
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              disabled={isLoading || guilds.length >= 3}
              sx={{ bgcolor: "#1d4ed8", fontWeight: 800, minWidth: { sm: 160 }, textTransform: "none", "&:hover": { bgcolor: "#2563eb" } }}
              type="submit"
              variant="contained"
            >
              {t.createGuild}
            </Button>
          </Box>
          <Typography sx={{ color: "#8ca3ba", fontSize: "0.85rem" }}>
            {t.guildLimit}
          </Typography>
        </Paper>

        {error ? (
          <Alert severity="warning" variant="outlined">
            {error}
          </Alert>
        ) : null}

        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "1fr 1fr" } }}>
          <Box sx={{ display: "grid", gap: 1.5, alignContent: "start" }}>
            <Typography component="h2" sx={{ color: "#c7d5e6", fontSize: "0.9rem", fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase" }}>
              {t.myGuilds}
            </Typography>

            {guilds.map((guild) => {
              const joinRequests = joinRequestsByGuildId[guild._id] ?? [];
              const guildBackgroundUrl = resolveGuildBackgroundUrl(guild.backgroundUrl);

              return (
                <Paper
                  key={guild._id}
                  sx={{
                    ...panelSx,
                    background: `linear-gradient(90deg, rgba(3, 18, 34, 0.96), rgba(4, 15, 28, 0.82)), url(${guildBackgroundUrl})`,
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    display: "grid",
                    gap: 1.5,
                    p: 2,
                  }}
                >
                  <Box sx={{ alignItems: { xs: "flex-start", sm: "center" }, display: "flex", gap: 1.25, justifyContent: "space-between" }}>
                    <Box sx={{ alignItems: "center", display: "flex", gap: 1.35, minWidth: 0 }}>
                      <GuildEmblem guild={guild} />
                      <Box sx={{ minWidth: 0 }}>
                        <Typography component="h3" sx={{ color: "#f8fbff", fontSize: "1.05rem", fontWeight: 800 }}>
                          {guild.name}
                        </Typography>
                        <Typography sx={{ color: "#8ca3ba", fontSize: "0.82rem" }}>/{guild.slug}</Typography>
                      </Box>
                    </Box>
                    <Chip
                      label={guild.membership.role}
                      size="small"
                      sx={{ borderColor: "rgba(96, 165, 250, 0.34)", color: "#bfdbfe", fontWeight: 800 }}
                      variant="outlined"
                    />
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    <Chip label={`${guild.members.length} ${t.members}`} size="small" sx={{ bgcolor: "rgba(96, 165, 250, 0.14)", color: "#bfdbfe", fontWeight: 700 }} />
                    {canManageGuild(guild) ? (
                      <Chip
                        label={`${joinRequests.length} ${t.joinRequests}`}
                        size="small"
                        sx={{ borderColor: "rgba(240, 179, 95, 0.42)", color: "#ffd9a3", fontWeight: 700 }}
                        variant="outlined"
                      />
                    ) : null}
                  </Box>

                  {canManageGuild(guild) && joinRequests.length > 0 ? (
                    <Box sx={{ display: "grid", gap: 1 }}>
                      {joinRequests.map((request) => (
                        <Box
                          key={request._id}
                          sx={{
                            alignItems: "center",
                            border: 1,
                            borderColor: "rgba(96, 165, 250, 0.14)",
                            borderRadius: 1,
                            bgcolor: "rgba(2, 8, 18, 0.28)",
                            display: "flex",
                            gap: 1.25,
                            justifyContent: "space-between",
                            p: 1.25,
                          }}
                        >
                          <Typography sx={{ fontWeight: 700 }}>{request.user?.displayName ?? request.userId}</Typography>
                          <Button
                            disabled={isLoading}
                            onClick={() => void handleAcceptJoinRequest(guild._id, request._id)}
                            size="small"
                            sx={{ fontWeight: 800, textTransform: "none" }}
                            type="button"
                            variant="contained"
                          >
                            {t.accept}
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  ) : null}

                  {canManageGuild(guild) ? (
                    <Box sx={{ display: "grid", gap: 1 }}>
                      <Typography sx={{ color: "#7dd3fc", fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
                        {t.guildAppearance}
                      </Typography>
                      <GuildAppearancePicker
                        disabled={isLoading}
                        emblemUrl={resolveGuildEmblemUrl(guild.emblemUrl, guild.themeColor)}
                        onChange={(nextThemeColor, nextEmblemUrl) => void handleUpdateAppearance(guild._id, nextThemeColor, nextEmblemUrl, guildBackgroundUrl)}
                        themeColor={guild.themeColor}
                      />
                      <Typography sx={{ color: "#7dd3fc", fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1, textTransform: "uppercase" }}>
                        {t.guildBackground}
                      </Typography>
                      <GuildBackgroundPicker
                        backgroundUrl={guildBackgroundUrl}
                        disabled={isLoading}
                        onChange={(nextBackgroundUrl) =>
                          void handleUpdateAppearance(
                            guild._id,
                            guild.themeColor,
                            resolveGuildEmblemUrl(guild.emblemUrl, guild.themeColor),
                            nextBackgroundUrl,
                          )
                        }
                      />
                    </Box>
                  ) : null}
                </Paper>
              );
            })}

            {!isLoading && guilds.length === 0 ? (
              <Paper sx={{ ...panelSx, p: 2.5, textAlign: "center" }}>
                <Typography sx={{ color: "#8ca3ba" }}>{t.noGuilds}</Typography>
              </Paper>
            ) : null}
          </Box>

          <Box sx={{ display: "grid", gap: 1.5, alignContent: "start" }}>
            <Typography component="h2" sx={{ color: "#c7d5e6", fontSize: "0.9rem", fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase" }}>
              {t.availableGuilds}
            </Typography>

            {availableGuilds.map((guild) => (
              <Paper
                key={guild._id}
                sx={{
                  ...panelSx,
                  background: `linear-gradient(90deg, rgba(3, 18, 34, 0.96), rgba(4, 15, 28, 0.82)), url(${resolveGuildBackgroundUrl(guild.backgroundUrl)})`,
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  display: "grid",
                  gap: 1.5,
                  p: 2,
                }}
              >
                <Box sx={{ alignItems: "center", display: "flex", gap: 1.35 }}>
                  <GuildEmblem guild={guild} />
                  <Box>
                    <Typography component="h3" sx={{ color: "#f8fbff", fontSize: "1.05rem", fontWeight: 800 }}>
                      {guild.name}
                    </Typography>
                    <Typography sx={{ color: "#8ca3ba", fontSize: "0.82rem" }}>/{guild.slug}</Typography>
                  </Box>
                </Box>
                <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "space-between" }}>
                  <Chip label={`${guild.members.length} ${t.members}`} size="small" sx={{ bgcolor: "rgba(96, 165, 250, 0.14)", color: "#bfdbfe", fontWeight: 700 }} />
                  {guild.joinRequestStatus === "pending" ? (
                    <Chip label={t.requestPending} size="small" sx={{ borderColor: "rgba(240, 179, 95, 0.42)", color: "#ffd9a3", fontWeight: 800 }} variant="outlined" />
                  ) : (
                    <Button
                      disabled={isLoading || guilds.length >= 3}
                      onClick={() => void handleRequestJoin(guild._id)}
                      sx={{ bgcolor: "#1d4ed8", fontWeight: 800, textTransform: "none", "&:hover": { bgcolor: "#2563eb" } }}
                      type="button"
                      variant="contained"
                    >
                      {t.requestToJoin}
                    </Button>
                  )}
                </Box>
              </Paper>
            ))}

            {!isLoading && availableGuilds.length === 0 ? (
              <Paper sx={{ ...panelSx, p: 2.5, textAlign: "center" }}>
                <Typography sx={{ color: "#8ca3ba" }}>{t.noAvailableGuilds}</Typography>
              </Paper>
            ) : null}
          </Box>
        </Box>
      </Box>
    </PageFrame>
  );
}
