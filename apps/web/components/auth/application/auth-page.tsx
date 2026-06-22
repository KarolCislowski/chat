"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect } from "react";
import { Alert, Box, Button, Paper, TextField, Typography } from "@mui/material";
import { PageFrame } from "../../shared/ui/page-frame";
import { useAuthStore } from "../../../stores/auth-store";
import { useLanguageStore } from "../../../stores/language-store";

const panelSx = {
  bgcolor: "rgba(4, 15, 28, 0.82)",
  border: "1px solid rgba(96, 165, 250, 0.18)",
  borderRadius: 1,
  boxShadow: "0 24px 70px rgba(0, 0, 0, 0.34)",
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
    bgcolor: "rgba(2, 8, 18, 0.42)",
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
      <Paper
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
          ...panelSx,
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
          <Box sx={{ display: "grid", gap: 0.45 }}>
            <Typography sx={{ color: "#7dd3fc", fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.3, textTransform: "uppercase" }}>
              {t.chat}
            </Typography>
            <Typography component="h1" sx={{ color: "#f8fbff", fontSize: "1.9rem", fontWeight: 800, lineHeight: 1.1 }}>
              {authMode === "register" ? t.createAccount : t.login}
            </Typography>
          </Box>
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
            <TextField autoComplete="name" disabled={isFormDisabled} fullWidth label={t.displayName} name="displayName" required sx={fieldSx} />
          ) : null}

          <TextField autoComplete="email" disabled={isFormDisabled} fullWidth label={t.email} name="email" required sx={fieldSx} type="email" />
          <TextField
            autoComplete={authMode === "register" ? "new-password" : "current-password"}
            disabled={isFormDisabled}
            fullWidth
            label={t.password}
            name="password"
            required
            sx={fieldSx}
            type="password"
          />

          {authError ? (
            <Alert severity="warning" variant="outlined">
              {authError}
            </Alert>
          ) : null}

          <Button
            disabled={isFormDisabled}
            sx={{ bgcolor: "#1d4ed8", fontWeight: 800, py: 1.15, textTransform: "none", "&:hover": { bgcolor: "#2563eb" } }}
            type="submit"
            variant="contained"
          >
            {authMode === "register" ? t.createAccount : t.login}
          </Button>
          <Button component={Link} href="/" sx={{ color: "#7dd3fc", fontWeight: 800, textTransform: "none" }} type="button" variant="text">
            {t.conversations}
          </Button>
        </Box>
      </Paper>
    </PageFrame>
  );
}
