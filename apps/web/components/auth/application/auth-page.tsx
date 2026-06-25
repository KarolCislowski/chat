"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { PageFrame } from "../../shared/ui/page-frame";
import { PortalPanel } from "../../shared/ui/portal-panel";
import { PortalTextField } from "../../shared/ui/portal-text-field";
import { SectionHeader } from "../../shared/ui/section-header";
import { portalPrimaryButtonSx, portalTextButtonSx } from "../../shared/domain/portal-theme";
import { useAuthStore } from "../../../stores/auth-store";
import { useLanguageStore } from "../../../stores/language-store";

/**
 * Renders the login and registration screen.
 *
 * @returns Auth form that redirects authenticated users back to the chat.
 */
export function AuthPage() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  const authError = useAuthStore((state) => state.error);
  const authMode = useAuthStore((state) => state.mode);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const profile = useAuthStore((state) => state.profile);
  const register = useAuthStore((state) => state.register);
  const setAuthMode = useAuthStore((state) => state.setMode);
  const tokens = useAuthStore((state) => state.tokens);
  const t = useLanguageStore((state) => state.t);
  const isAuthenticated = Boolean(profile && tokens?.accessToken);
  const isFormDisabled = !hasHydrated || isAuthLoading;

  useEffect(() => {
    if (hasHydrated && isAuthenticated) {
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (window.location.search) {
      router.replace("/auth");
    }
  }, [router]);

  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasHydrated) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const displayName = String(formData.get("displayName") ?? "");

    if (authMode === "register") {
      void register(apiBaseUrl, email, password, displayName);
      return;
    }

    void login(apiBaseUrl, email, password);
  }

  return (
    <PageFrame>
      <PortalPanel
        component="section"
        sx={{
          alignSelf: "center",
          background:
            "linear-gradient(145deg, rgba(4, 15, 28, 0.95), rgba(8, 24, 39, 0.78)), radial-gradient(circle at 82% 0%, rgba(240, 179, 95, 0.18), transparent 34%)",
          display: "grid",
          gap: 2.75,
          justifySelf: "center",
          maxWidth: 460,
          p: { xs: 2.5, sm: 3.75 },
          width: "100%",
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", gap: 1.6 }}>
          <Box
            component="img"
            alt="Dworven Shaft"
            src="/assets/imgs/logo.png"
            sx={{
              flex: "0 0 auto",
              height: 52,
              objectFit: "contain",
              width: 52,
            }}
          />
          <SectionHeader eyebrow={t.chat} title={authMode === "register" ? t.createAccount : t.login} titleComponent="h1" />
        </Box>

        <Box
          sx={{
            bgcolor: "rgba(2, 8, 18, 0.38)",
            border: "1px solid rgba(96, 165, 250, 0.14)",
            borderRadius: 1,
            display: "grid",
            gap: 0.75,
            gridTemplateColumns: "1fr 1fr",
            p: 0.75,
          }}
        >
          <Button
            disabled={!hasHydrated}
            onClick={() => setAuthMode("login")}
            sx={{
              bgcolor: authMode === "login" ? "rgba(96, 165, 250, 0.2)" : "transparent",
              borderColor: authMode === "login" ? "rgba(96, 165, 250, 0.48)" : "transparent",
              color: authMode === "login" ? "#f8fbff" : "#8ca3ba",
              fontWeight: 800,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(96, 165, 250, 0.16)",
                borderColor: "rgba(96, 165, 250, 0.34)",
              },
            }}
            type="button"
            variant="outlined"
          >
            {t.login}
          </Button>
          <Button
            disabled={!hasHydrated}
            onClick={() => setAuthMode("register")}
            sx={{
              bgcolor: authMode === "register" ? "rgba(96, 165, 250, 0.2)" : "transparent",
              borderColor: authMode === "register" ? "rgba(96, 165, 250, 0.48)" : "transparent",
              color: authMode === "register" ? "#f8fbff" : "#8ca3ba",
              fontWeight: 800,
              textTransform: "none",
              "&:hover": {
                bgcolor: "rgba(96, 165, 250, 0.16)",
                borderColor: "rgba(96, 165, 250, 0.34)",
              },
            }}
            type="button"
            variant="outlined"
          >
            {t.register}
          </Button>
        </Box>

        <Box component="form" method="post" onSubmit={handleAuthSubmit} sx={{ display: "grid", gap: 1.5 }}>
          {authMode === "register" ? (
            <PortalTextField autoComplete="name" disabled={isFormDisabled} fullWidth label={t.displayName} name="displayName" required />
          ) : null}

          <PortalTextField autoComplete="email" disabled={isFormDisabled} fullWidth label={t.email} name="email" required type="email" />
          <PortalTextField
            autoComplete={authMode === "register" ? "new-password" : "current-password"}
            disabled={isFormDisabled}
            fullWidth
            label={t.password}
            name="password"
            required
            type="password"
          />

          {authError ? (
            <Alert severity="warning" variant="outlined">
              {authError}
            </Alert>
          ) : null}

          <Button
            disabled={isFormDisabled}
            sx={[portalPrimaryButtonSx, { py: 1.15 }]}
            type="submit"
            variant="contained"
          >
            {authMode === "register" ? t.createAccount : t.login}
          </Button>
          <Button component={Link} href="/" sx={portalTextButtonSx} type="button" variant="text">
            {t.conversations}
          </Button>
        </Box>
      </PortalPanel>
    </PageFrame>
  );
}
