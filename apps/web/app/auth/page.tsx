"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect } from "react";
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material";
import { useAuthStore } from "../../stores/auth-store";
import { useLanguageStore } from "../../stores/language-store";

export default function AuthPage() {
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
    <Box
      component="main"
      sx={{
        alignItems: "center",
        bgcolor: "background.default",
        display: "grid",
        minHeight: "100vh",
        p: { xs: 2.5, md: 4 },
      }}
    >
      <Paper
        component="section"
        sx={{
          display: "grid",
          gap: 2.5,
          justifySelf: "center",
          maxWidth: 440,
          p: { xs: 2.5, sm: 3.5 },
          width: "100%",
        }}
        variant="outlined"
      >
        <Box sx={{ display: "grid", gap: 0.75 }}>
          <Typography color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
            {t.chat}
          </Typography>
          <Typography component="h1" sx={{ fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.15 }}>
            {authMode === "register" ? t.createAccount : t.login}
          </Typography>
        </Box>

        <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "1fr 1fr" }}>
          <Button
            disabled={!hasHydrated}
            onClick={() => setAuthMode("login")}
            type="button"
            variant={authMode === "login" ? "contained" : "outlined"}
          >
            {t.login}
          </Button>
          <Button
            disabled={!hasHydrated}
            onClick={() => setAuthMode("register")}
            type="button"
            variant={authMode === "register" ? "contained" : "outlined"}
          >
            {t.register}
          </Button>
        </Box>

        <Box component="form" method="post" onSubmit={handleAuthSubmit} sx={{ display: "grid", gap: 1.5 }}>
          {authMode === "register" ? (
            <TextField autoComplete="name" disabled={isFormDisabled} fullWidth label={t.displayName} name="displayName" required />
          ) : null}

          <TextField autoComplete="email" disabled={isFormDisabled} fullWidth label={t.email} name="email" required type="email" />
          <TextField
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

          <Button disabled={isFormDisabled} type="submit" variant="contained">
            {authMode === "register" ? t.createAccount : t.login}
          </Button>
          <Button component={Link} href="/" type="button" variant="text">
            {t.conversations}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
