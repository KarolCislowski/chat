"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Tooltip,
  Typography,
} from "@mui/material";
import { PageFrame } from "../../shared/ui/page-frame";
import { PortalPanel } from "../../shared/ui/portal-panel";
import { PortalTextField } from "../../shared/ui/portal-text-field";
import { SectionHeader } from "../../shared/ui/section-header";
import { portalFieldSx, portalOutlinedButtonSx, portalPanelSx, portalPrimaryButtonSx } from "../../shared/domain/portal-theme";
import { languageLabels, UiLanguage } from "../../../i18n/translations";
import { avatarOptions, defaultAvatar, resolveAvatarPath } from "../../../lib/avatar-options";
import { OnlineStatus, useAuthStore } from "../../../stores/auth-store";
import { useLanguageStore } from "../../../stores/language-store";

const onlineStatusOptions: OnlineStatus[] = ["online", "away", "busy", "offline"];

/**
 * Renders the editable profile screen for the signed-in user.
 *
 * @returns Profile form with separated avatar selection and preference controls.
 */
export function ProfilePage() {
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
  const [selectedAvatar, setSelectedAvatar] = useState<string>(defaultAvatar);
  const [displayName, setDisplayName] = useState("");
  const [language, setLocalLanguage] = useState<UiLanguage>("en");
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatus>("offline");
  const [saved, setSaved] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [pendingAvatar, setPendingAvatar] = useState<string>(defaultAvatar);
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

    setSelectedAvatar(resolveAvatarPath(profile.avatarUrl));
    setPendingAvatar(resolveAvatarPath(profile.avatarUrl));
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

  function handleAvatarDialogOpen() {
    setPendingAvatar(selectedAvatar);
    setIsAvatarDialogOpen(true);
  }

  function handleAvatarDialogClose() {
    setIsAvatarDialogOpen(false);
    setPendingAvatar(selectedAvatar);
  }

  async function handleAvatarSave() {
    if (!hasHydrated || !profile) {
      return;
    }

    setSaved(false);

    const didUpdate = await updateProfile(apiBaseUrl, {
      avatarUrl: pendingAvatar,
    });

    if (didUpdate) {
      setSelectedAvatar(pendingAvatar);
      setSaved(true);
      setIsAvatarDialogOpen(false);
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
        <PortalPanel
          sx={{
            alignContent: "center",
            background:
              "linear-gradient(180deg, rgba(8, 24, 39, 0.94), rgba(4, 15, 28, 0.82)), radial-gradient(circle at 50% 12%, rgba(240, 179, 95, 0.2), transparent 34%)",
            display: "grid",
            gap: 3,
            overflow: "hidden",
            p: { xs: 2.5, md: 4 },
            position: "relative",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gap: 2.5,
              justifyItems: "center",
              textAlign: "center",
              zIndex: 1,
            }}
          >
            <Avatar
              src={selectedAvatar}
              sx={{
                bgcolor: "#132337",
                border: "2px solid rgba(240, 179, 95, 0.84)",
                boxShadow: "0 0 0 8px rgba(96, 165, 250, 0.1), 0 30px 70px rgba(0, 0, 0, 0.36)",
                height: { xs: 184, md: 256 },
                width: { xs: 184, md: 256 },
              }}
            />

            <Button
              disabled={isFormDisabled}
              onClick={handleAvatarDialogOpen}
              sx={{ borderColor: "rgba(240, 179, 95, 0.42)", color: "#ffd9a3", fontWeight: 800, textTransform: "none" }}
              type="button"
              variant="outlined"
            >
              {t.changeAvatar}
            </Button>

            <Box sx={{ display: "grid", gap: 0.75, justifyItems: "center" }}>
              <Typography sx={{ color: "#7dd3fc", fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>
                {t.profile}
              </Typography>
              <Typography component="h1" sx={{ color: "#f8fbff", fontSize: { xs: "2rem", md: "2.65rem" }, fontWeight: 900, lineHeight: 1.05 }}>
                {displayName || t.profile}
              </Typography>
              <Typography sx={{ color: onlineStatus === "online" ? "#78d88f" : onlineStatus === "busy" ? "#f0b35f" : "#9badbf", fontWeight: 800 }}>
                {t[onlineStatus]}
              </Typography>
            </Box>

            {statusMessage ? (
              <Typography sx={{ color: "#c7d5e6", lineHeight: 1.55, maxWidth: 420 }}>{statusMessage}</Typography>
            ) : (
              <Typography sx={{ color: "#8ca3ba", lineHeight: 1.55, maxWidth: 420 }}>{t.profileDetails}</Typography>
            )}
          </Box>

          {account ? (
            <Box
              sx={{
                bgcolor: "rgba(2, 8, 18, 0.32)",
                border: "1px solid rgba(96, 165, 250, 0.16)",
                borderRadius: 1,
                display: "grid",
                gap: 0.5,
                p: 2,
                zIndex: 1,
              }}
            >
              <Typography sx={{ color: "#7dd3fc", fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.1, textTransform: "uppercase" }}>
                {t.email}
              </Typography>
              <Typography sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>{account.email}</Typography>
              <Typography sx={{ color: "#8ca3ba", fontSize: "0.85rem" }}>{account.role}</Typography>
            </Box>
          ) : null}
        </PortalPanel>

        <PortalPanel
          component="form"
          onSubmit={handleSubmit}
          sx={{
            alignContent: "start",
            display: "grid",
            gap: 2.25,
            p: { xs: 2.5, md: 3.5 },
          }}
        >
          <SectionHeader eyebrow={t.profileDetails} title={t.saveProfile} />

          <PortalTextField
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

          <PortalTextField
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
            <FormControl fullWidth sx={portalFieldSx}>
              <InputLabel id="profile-status-label">{t.onlineStatus}</InputLabel>
              <Select
                MenuProps={{ slotProps: { paper: { sx: { bgcolor: "#081827", color: "#e5edf7" } } } }}
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

            <FormControl fullWidth sx={portalFieldSx}>
              <InputLabel id="profile-language-label">{t.language}</InputLabel>
              <Select
                MenuProps={{ slotProps: { paper: { sx: { bgcolor: "#081827", color: "#e5edf7" } } } }}
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
            <Button
              disabled={isFormDisabled}
              sx={portalPrimaryButtonSx}
              type="submit"
              variant="contained"
            >
              {isLoading ? t.saving : t.saveProfile}
            </Button>
            <Button
              component={Link}
              href="/"
              sx={portalOutlinedButtonSx}
              type="button"
              variant="outlined"
            >
              {t.backToChat}
            </Button>
          </Box>
        </PortalPanel>
      </Box>

      <Dialog
        fullWidth
        maxWidth="md"
        onClose={handleAvatarDialogClose}
        open={isAvatarDialogOpen}
        slotProps={{
          paper: {
            sx: {
              ...portalPanelSx,
              bgcolor: "#06111e",
              background:
                "linear-gradient(145deg, rgba(4, 15, 28, 0.98), rgba(8, 24, 39, 0.9)), radial-gradient(circle at 82% 0%, rgba(240, 179, 95, 0.14), transparent 34%)",
            },
          },
        }}
      >
        <DialogTitle sx={{ color: "#f8fbff", fontWeight: 900 }}>{t.changeAvatar}</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2 }}>
          <Box sx={{ alignItems: "center", display: "flex", gap: 2 }}>
            <Avatar
              src={pendingAvatar}
              sx={{
                bgcolor: "#132337",
                border: "1px solid rgba(240, 179, 95, 0.72)",
                height: 96,
                width: 96,
              }}
            />
            <Box>
              <Typography sx={{ color: "#7dd3fc", fontSize: "0.75rem", fontWeight: 800, letterSpacing: 1.2, textTransform: "uppercase" }}>
                {t.avatarUrl}
              </Typography>
              <Typography sx={{ color: "#9badbf", mt: 0.5 }}>{displayName || t.profile}</Typography>
            </Box>
          </Box>

          <Box
            sx={{
              bgcolor: "rgba(2, 8, 18, 0.34)",
              border: "1px solid rgba(96, 165, 250, 0.16)",
              borderRadius: 1,
              display: "grid",
              gap: 1,
              gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))",
              maxHeight: { xs: 360, md: 460 },
              overflowY: "auto",
              p: 1.25,
            }}
          >
            {avatarOptions.map((avatarPath, index) => {
              const isSelected = avatarPath === pendingAvatar;
              const avatarLabel = `Select avatar ${index + 1}`;

              return (
                <Tooltip
                  arrow
                  key={avatarPath}
                  placement="top"
                  slotProps={{
                    tooltip: {
                      sx: {
                        bgcolor: "#06111e",
                        border: "1px solid rgba(96, 165, 250, 0.34)",
                        boxShadow: "0 18px 42px rgba(0, 0, 0, 0.42)",
                        p: 1,
                      },
                    },
                  }}
                  title={
                    <Avatar
                      src={avatarPath}
                      sx={{
                        bgcolor: "#132337",
                        borderRadius: 1,
                        height: 180,
                        width: 180,
                      }}
                      variant="rounded"
                    />
                  }
                >
                  <span>
                    <Button
                      aria-label={avatarLabel}
                      aria-pressed={isSelected}
                      disabled={isFormDisabled}
                      onClick={() => {
                        setSaved(false);
                        setPendingAvatar(avatarPath);
                      }}
                      sx={{
                        border: "1px solid",
                        borderColor: isSelected ? "rgba(240, 179, 95, 0.88)" : "rgba(96, 165, 250, 0.14)",
                        borderRadius: 1,
                        boxShadow: isSelected ? "0 0 0 2px rgba(240, 179, 95, 0.16)" : "none",
                        minWidth: 0,
                        p: 0.55,
                        width: "100%",
                        "&:hover": {
                          bgcolor: "rgba(96, 165, 250, 0.12)",
                          borderColor: isSelected ? "rgba(240, 179, 95, 0.88)" : "rgba(96, 165, 250, 0.42)",
                        },
                      }}
                      type="button"
                    >
                      <Avatar
                        src={avatarPath}
                        sx={{
                          bgcolor: "#132337",
                          borderRadius: 1,
                          height: 58,
                          width: 58,
                        }}
                        variant="rounded"
                      />
                    </Button>
                  </span>
                </Tooltip>
              );
            })}
          </Box>
        </DialogContent>
        <DialogActions sx={{ gap: 1, p: 3, pt: 1 }}>
          <Button
            onClick={handleAvatarDialogClose}
            sx={portalOutlinedButtonSx}
            type="button"
            variant="outlined"
          >
            {t.cancel}
          </Button>
          <Button
            disabled={isFormDisabled || pendingAvatar === selectedAvatar}
            onClick={() => void handleAvatarSave()}
            sx={portalPrimaryButtonSx}
            type="button"
            variant="contained"
          >
            {isLoading ? t.saving : t.saveAvatar}
          </Button>
        </DialogActions>
      </Dialog>
    </PageFrame>
  );
}
