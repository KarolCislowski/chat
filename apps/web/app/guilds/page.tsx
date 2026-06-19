"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect } from "react";
import { Alert, Box, Button, Chip, Paper, TextField, Typography } from "@mui/material";
import { useAuthStore } from "../../stores/auth-store";
import { Guild, useGuildStore } from "../../stores/guild-store";
import { useLanguageStore } from "../../stores/language-store";

function canManageGuild(guild: Guild) {
  return guild.membership.role === "owner" || guild.membership.role === "officer";
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
  const name = useGuildStore((state) => state.name);
  const requestJoin = useGuildStore((state) => state.requestJoin);
  const setName = useGuildStore((state) => state.setName);
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

  return (
    <Box component="main" sx={{ bgcolor: "background.default", display: "grid", minHeight: "100vh", p: { xs: 2.5, md: 4 } }}>
      <Box sx={{ alignSelf: "start", display: "grid", gap: 3, justifySelf: "center", maxWidth: 1040, width: "100%" }}>
        <Box sx={{ alignItems: { xs: "flex-start", sm: "center" }, display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Box>
            <Typography color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
              {t.guilds}
            </Typography>
            <Typography component="h1" sx={{ fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.15 }}>
              {t.myGuilds}
            </Typography>
          </Box>
          <Button component={Link} href="/" type="button" variant="outlined">
            {t.backToChat}
          </Button>
        </Box>

        <Paper component="form" onSubmit={handleCreateGuild} sx={{ display: "grid", gap: 1.5, p: 2.5 }} variant="outlined">
          <Typography component="h2" sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
            {t.createGuild}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.25 }}>
            <TextField disabled={isLoading} fullWidth label={t.guildName} onChange={(event) => setName(event.target.value)} required value={name} />
            <Button disabled={isLoading || guilds.length >= 3} sx={{ minWidth: { sm: 160 } }} type="submit" variant="contained">
              {t.createGuild}
            </Button>
          </Box>
          <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
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
            <Typography component="h2" sx={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {t.myGuilds}
            </Typography>

            {guilds.map((guild) => {
              const joinRequests = joinRequestsByGuildId[guild._id] ?? [];

              return (
                <Paper key={guild._id} sx={{ display: "grid", gap: 1.5, p: 2.5 }} variant="outlined">
                  <Box sx={{ alignItems: { xs: "flex-start", sm: "center" }, display: "flex", gap: 1.25, justifyContent: "space-between" }}>
                    <Box>
                      <Typography component="h3" sx={{ fontSize: "1.15rem", fontWeight: 700 }}>
                        {guild.name}
                      </Typography>
                      <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                        /{guild.slug}
                      </Typography>
                    </Box>
                    <Chip label={guild.membership.role} variant="outlined" />
                  </Box>

                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    <Chip label={`${guild.members.length} ${t.members}`} />
                    {canManageGuild(guild) ? <Chip color="primary" label={`${joinRequests.length} ${t.joinRequests}`} variant="outlined" /> : null}
                  </Box>

                  {canManageGuild(guild) && joinRequests.length > 0 ? (
                    <Box sx={{ display: "grid", gap: 1 }}>
                      {joinRequests.map((request) => (
                        <Box
                          key={request._id}
                          sx={{
                            alignItems: "center",
                            border: 1,
                            borderColor: "divider",
                            borderRadius: 1,
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
                            type="button"
                            variant="contained"
                          >
                            {t.accept}
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  ) : null}
                </Paper>
              );
            })}

            {!isLoading && guilds.length === 0 ? (
              <Paper sx={{ p: 2.5, textAlign: "center" }} variant="outlined">
                <Typography color="text.secondary">{t.noGuilds}</Typography>
              </Paper>
            ) : null}
          </Box>

          <Box sx={{ display: "grid", gap: 1.5, alignContent: "start" }}>
            <Typography component="h2" sx={{ fontSize: "1.2rem", fontWeight: 700 }}>
              {t.availableGuilds}
            </Typography>

            {availableGuilds.map((guild) => (
              <Paper key={guild._id} sx={{ display: "grid", gap: 1.5, p: 2.5 }} variant="outlined">
                <Box>
                  <Typography component="h3" sx={{ fontSize: "1.15rem", fontWeight: 700 }}>
                    {guild.name}
                  </Typography>
                  <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                    /{guild.slug}
                  </Typography>
                </Box>
                <Box sx={{ alignItems: "center", display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "space-between" }}>
                  <Chip label={`${guild.members.length} ${t.members}`} />
                  {guild.joinRequestStatus === "pending" ? (
                    <Chip color="primary" label={t.requestPending} variant="outlined" />
                  ) : (
                    <Button disabled={isLoading || guilds.length >= 3} onClick={() => void handleRequestJoin(guild._id)} type="button" variant="contained">
                      {t.requestToJoin}
                    </Button>
                  )}
                </Box>
              </Paper>
            ))}

            {!isLoading && availableGuilds.length === 0 ? (
              <Paper sx={{ p: 2.5, textAlign: "center" }} variant="outlined">
                <Typography color="text.secondary">{t.noAvailableGuilds}</Typography>
              </Paper>
            ) : null}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
