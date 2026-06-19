"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { languageLabels, UiLanguage } from "../../i18n/translations";
import { OnlineStatus, useAuthStore } from "../../stores/auth-store";
import { useLanguageStore } from "../../stores/language-store";

const onlineStatusOptions: OnlineStatus[] = ["online", "away", "busy", "offline"];

export default function ProfilePage() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  const account = useAuthStore((state) => state.account);
  const authError = useAuthStore((state) => state.error);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const profile = useAuthStore((state) => state.profile);
  const tokens = useAuthStore((state) => state.tokens);
  const updateProfile = useAuthStore((state) => state.updateProfile);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.t);
  const isAuthenticated = Boolean(profile && tokens?.accessToken);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [language, setLocalLanguage] = useState<UiLanguage>("en");
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>("offline");
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setAvatarUrl(profile.avatarUrl ?? "");
    setDisplayName(profile.displayName);
    setLocalLanguage(profile.language);
    setOnlineStatus(profile.onlineStatus);
    setStatusMessage(profile.statusMessage);
  }, [profile]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasHydrated || !profile) {
      return;
    }

    setSaved(false);

    const didUpdate = await updateProfile(apiBaseUrl, {
      avatarUrl: avatarUrl.trim() || null,
      displayName: displayName.trim(),
      language,
      onlineStatus,
      statusMessage: statusMessage.trim(),
    });

    if (didUpdate) {
      setLanguage(language);
      setSaved(true);
    }
  }

  function handleLanguageChange(event: SelectChangeEvent<UiLanguage>) {
    setSaved(false);
    setLocalLanguage(event.target.value as UiLanguage);
  }

  function handleStatusChange(event: SelectChangeEvent<OnlineStatus>) {
    setSaved(false);
    setOnlineStatus(event.target.value as OnlineStatus);
  }

  const isFormDisabled = !hasHydrated || !profile || isLoading;
  const avatarInitial = displayName.trim().charAt(0).toUpperCase() || "?";

  return (
    <Box
      component="main"
      sx={{
        bgcolor: "background.default",
        display: "grid",
        minHeight: "100vh",
        p: { xs: 2.5, md: 4 },
      }}
    >
      <Paper
        component="section"
        sx={{
          alignSelf: "center",
          display: "grid",
          gap: 3,
          justifySelf: "center",
          maxWidth: 760,
          p: { xs: 2.5, sm: 3.5 },
          width: "100%",
        }}
        variant="outlined"
      >
        <Box sx={{ alignItems: { xs: "flex-start", sm: "center" }, display: "flex", gap: 2 }}>
          <Avatar src={avatarUrl || undefined} sx={{ bgcolor: "primary.main", height: 64, width: 64 }}>
            {avatarInitial}
          </Avatar>
          <Box sx={{ display: "grid", gap: 0.5 }}>
            <Typography color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
              {t.profile}
            </Typography>
            <Typography component="h1" sx={{ fontSize: "1.8rem", fontWeight: 700, lineHeight: 1.15 }}>
              {displayName || t.profile}
            </Typography>
            <Typography color="text.secondary" sx={{ lineHeight: 1.45 }}>
              {t.profileDetails}
            </Typography>
          </Box>
        </Box>

        {account ? (
          <Box
            sx={{
              border: 1,
              borderColor: "divider",
              borderRadius: 1,
              display: "grid",
              gap: 0.5,
              p: 2,
            }}
          >
            <Typography color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
              {t.email}
            </Typography>
            <Typography sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>{account.email}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>
              {account.role}
            </Typography>
          </Box>
        ) : null}

        <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
          <TextField
            disabled={isFormDisabled}
            fullWidth
            label={t.displayName}
            onChange={(event) => {
              setSaved(false);
              setDisplayName(event.target.value);
            }}
            required
            slotProps={{ htmlInput: { maxLength: 80 } }}
            value={displayName}
          />

          <TextField
            disabled={isFormDisabled}
            fullWidth
            label={t.avatarUrl}
            onChange={(event) => {
              setSaved(false);
              setAvatarUrl(event.target.value);
            }}
            type="url"
            value={avatarUrl}
          />

          <TextField
            disabled={isFormDisabled}
            fullWidth
            label={t.statusMessage}
            multiline
            onChange={(event) => {
              setSaved(false);
              setStatusMessage(event.target.value);
            }}
            rows={3}
            slotProps={{ htmlInput: { maxLength: 160 } }}
            value={statusMessage}
          />

          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" } }}>
            <FormControl fullWidth>
              <InputLabel id="profile-status-label">{t.onlineStatus}</InputLabel>
              <Select
                disabled={isFormDisabled}
                label={t.onlineStatus}
                labelId="profile-status-label"
                onChange={handleStatusChange}
                value={onlineStatus}
              >
                {onlineStatusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {t[status]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel id="profile-language-label">{t.language}</InputLabel>
              <Select
                disabled={isFormDisabled}
                label={t.language}
                labelId="profile-language-label"
                onChange={handleLanguageChange}
                value={language}
              >
                {(Object.keys(languageLabels) as UiLanguage[]).map((languageCode) => (
                  <MenuItem key={languageCode} value={languageCode}>
                    {languageLabels[languageCode]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {authError ? (
            <Alert severity="warning" variant="outlined">
              {authError}
            </Alert>
          ) : null}

          {saved ? (
            <Alert severity="success" variant="outlined">
              {t.profileUpdated}
            </Alert>
          ) : null}

          <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.25 }}>
            <Button disabled={isFormDisabled} type="submit" variant="contained">
              {isLoading ? t.saving : t.saveProfile}
            </Button>
            <Button component={Link} href="/" type="button" variant="outlined">
              {t.backToChat}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
