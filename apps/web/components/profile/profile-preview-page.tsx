"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Alert, Avatar, Box, Button, Chip, Paper, Typography } from "@mui/material";
import { resolveAvatarPath } from "../../lib/avatar-options";
import { OnlineStatus, useAuthStore } from "../../stores/auth-store";
import { useLanguageStore } from "../../stores/language-store";
import { PageFrame } from "../layout/page-frame";

type PublicProfile = {
  id: string;
  accountId: string;
  displayName: string;
  avatarUrl: string | null;
  statusMessage: string;
  onlineStatus: OnlineStatus;
  language: "en" | "sv" | "pl";
};

const panelSx = {
  bgcolor: "rgba(4, 15, 28, 0.78)",
  border: "1px solid rgba(96, 165, 250, 0.18)",
  borderRadius: 1,
  boxShadow: "0 22px 60px rgba(0, 0, 0, 0.28)",
  color: "#e5edf7",
};

async function getErrorMessage(response: Response) {
  const errorPayload = (await response.json().catch(() => null)) as { message?: string | string[] } | null;
  const message = Array.isArray(errorPayload?.message) ? errorPayload.message.join(", ") : errorPayload?.message;

  return message ?? `Request failed with ${response.status}`;
}

type ProfilePreviewPageProps = {
  accountId: string;
};

export function ProfilePreviewPage({ accountId }: ProfilePreviewPageProps) {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  const account = useAuthStore((state) => state.account);
  const getFreshAccessToken = useAuthStore((state) => state.getFreshAccessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const ownProfile = useAuthStore((state) => state.profile);
  const tokens = useAuthStore((state) => state.tokens);
  const t = useLanguageStore((state) => state.t);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const isAuthenticated = Boolean(ownProfile && tokens?.accessToken);
  const isOwnProfile = account?.id === accountId;
  const shownProfile = isOwnProfile && ownProfile ? { ...ownProfile, id: ownProfile.id, accountId } : profile;
  const avatarPath = resolveAvatarPath(shownProfile?.avatarUrl);
  const onlineStatus = shownProfile?.onlineStatus ?? "offline";

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated || isOwnProfile) {
      return;
    }

    let isCancelled = false;

    async function loadProfile() {
      const accessToken = await getFreshAccessToken(apiBaseUrl);

      if (!accessToken || isCancelled) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${apiBaseUrl}/users/${accountId}`, {
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(await getErrorMessage(response));
        }

        setProfile((await response.json()) as PublicProfile);
      } catch (requestError) {
        setError(requestError instanceof Error ? requestError.message : "Profile unavailable");
      } finally {
        setIsLoading(false);
      }
    }

    void loadProfile();

    return () => {
      isCancelled = true;
    };
  }, [accountId, apiBaseUrl, getFreshAccessToken, isAuthenticated, isOwnProfile]);

  return (
    <PageFrame>
      <Box
        component="section"
        sx={{
          alignSelf: "stretch",
          display: "grid",
          gap: 3,
          gridTemplateColumns: { xs: "1fr", lg: "minmax(320px, 0.78fr) minmax(0, 1.22fr)" },
          justifySelf: "center",
          maxWidth: 1280,
          minHeight: { lg: "100%" },
          width: "100%",
        }}
      >
        <Paper
          sx={{
            ...panelSx,
            alignContent: "center",
            background:
              "linear-gradient(180deg, rgba(8, 24, 39, 0.94), rgba(4, 15, 28, 0.82)), radial-gradient(circle at 50% 12%, rgba(240, 179, 95, 0.2), transparent 34%)",
            display: "grid",
            gap: 3,
            overflow: "hidden",
            p: { xs: 2.5, md: 4 },
          }}
        >
          <Box sx={{ display: "grid", gap: 2.5, justifyItems: "center", textAlign: "center" }}>
            <Avatar
              src={avatarPath}
              sx={{
                bgcolor: "#132337",
                border: "2px solid rgba(240, 179, 95, 0.84)",
                boxShadow: "0 0 0 8px rgba(96, 165, 250, 0.1), 0 30px 70px rgba(0, 0, 0, 0.36)",
                height: { xs: 184, md: 256 },
                width: { xs: 184, md: 256 },
              }}
            />

            <Box sx={{ display: "grid", gap: 0.75, justifyItems: "center" }}>
              <Typography sx={{ color: "#7dd3fc", fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>
                {t.profile}
              </Typography>
              <Typography component="h1" sx={{ color: "#f8fbff", fontSize: { xs: "2rem", md: "2.65rem" }, fontWeight: 900, lineHeight: 1.05 }}>
                {shownProfile?.displayName ?? t.profile}
              </Typography>
              <Typography sx={{ color: onlineStatus === "online" ? "#78d88f" : onlineStatus === "busy" ? "#f0b35f" : "#9badbf", fontWeight: 800 }}>
                {t[onlineStatus]}
              </Typography>
            </Box>

            {shownProfile?.statusMessage ? (
              <Typography sx={{ color: "#c7d5e6", lineHeight: 1.55, maxWidth: 420 }}>{shownProfile.statusMessage}</Typography>
            ) : null}

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, justifyContent: "center" }}>
              <Button
                component={Link}
                href="/"
                sx={{ borderColor: "rgba(96, 165, 250, 0.35)", color: "#bfdbfe", fontWeight: 800, textTransform: "none" }}
                variant="outlined"
              >
                {t.backToChat}
              </Button>
              {isOwnProfile ? (
                <Button component={Link} href="/profile" sx={{ bgcolor: "#1d4ed8", fontWeight: 800, textTransform: "none", "&:hover": { bgcolor: "#2563eb" } }} variant="contained">
                  {t.editProfile}
                </Button>
              ) : null}
            </Box>
          </Box>
        </Paper>

        <Paper sx={{ ...panelSx, alignContent: "start", display: "grid", gap: 2, p: { xs: 2.5, md: 4 } }}>
          <Typography sx={{ color: "#f0b35f", fontSize: "1.05rem", fontWeight: 900, letterSpacing: 0.4 }}>{t.profile}</Typography>
          {error ? (
            <Alert severity="warning" variant="outlined">
              {error}
            </Alert>
          ) : null}
          {shownProfile ? (
            <Box sx={{ display: "grid", gap: 1.25 }}>
              <Box sx={{ bgcolor: "rgba(2, 8, 18, 0.32)", border: "1px solid rgba(96, 165, 250, 0.14)", borderRadius: 1, p: 2 }}>
                <Typography sx={{ color: "#7dd3fc", fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.1, textTransform: "uppercase" }}>
                  {t.displayName}
                </Typography>
                <Typography sx={{ fontWeight: 800, mt: 0.35 }}>{shownProfile.displayName}</Typography>
              </Box>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                <Chip label={t[onlineStatus]} sx={{ bgcolor: "rgba(96, 165, 250, 0.14)", color: "#bfdbfe", fontWeight: 800 }} />
                <Chip label={shownProfile.language.toUpperCase()} sx={{ borderColor: "rgba(240, 179, 95, 0.42)", color: "#ffd9a3", fontWeight: 800 }} variant="outlined" />
              </Box>
            </Box>
          ) : isLoading ? (
            <Typography sx={{ color: "#8ca3ba" }}>{t.saving}</Typography>
          ) : null}
        </Paper>
      </Box>
    </PageFrame>
  );
}
