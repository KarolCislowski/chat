"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, MouseEvent, useEffect, useState } from "react";
import { Avatar, Box, Button, Chip, FormControl, Menu, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { languageLabels, UiLanguage } from "../../i18n/translations";
import { resolveAvatarPath } from "../../lib/avatar-options";
import { useAuthStore } from "../../stores/auth-store";
import { useChatStore } from "../../stores/chat-store";
import { useGuildStore } from "../../stores/guild-store";
import { useLanguageStore } from "../../stores/language-store";
import { useUserStore } from "../../stores/user-store";

const languageFlags: Record<UiLanguage, string> = {
  en: "🇬🇧",
  pl: "🇵🇱",
  sv: "🇸🇪",
};

export function AppShell({ children }: { children: ReactNode }) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  const pathname = usePathname();
  const connectRealtime = useChatStore((state) => state.connectRealtime);
  const connectionStatus = useChatStore((state) => state.connectionStatus);
  const disconnectRealtime = useChatStore((state) => state.disconnectRealtime);
  const setChatViewVisible = useChatStore((state) => state.setChatViewVisible);
  const setCurrentAccountId = useChatStore((state) => state.setCurrentAccountId);
  const unreadByChannel = useChatStore((state) => state.unreadByChannel);
  const account = useAuthStore((state) => state.account);
  const getFreshAccessToken = useAuthStore((state) => state.getFreshAccessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const profile = useAuthStore((state) => state.profile);
  const tokens = useAuthStore((state) => state.tokens);
  const updateLanguagePreference = useAuthStore((state) => state.updateLanguagePreference);
  const loadGuilds = useGuildStore((state) => state.loadGuilds);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.t);
  const loadUsers = useUserStore((state) => state.loadUsers);
  const isAuthenticated = Boolean(profile && tokens?.accessToken);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<HTMLElement | null>(null);
  const activeNavKey = pathname === "/guilds" ? "guild" : pathname === "/profile" ? "profile" : "social";
  const unreadMessageCount = Object.values(unreadByChannel).reduce((total, count) => total + count, 0);
  const showSocialUnread = activeNavKey !== "social" && unreadMessageCount > 0;
  const avatarPath = resolveAvatarPath(profile?.avatarUrl);

  useEffect(() => {
    if (profile?.language && profile.language !== language) {
      setLanguage(profile.language);
    }
  }, [language, profile?.language, setLanguage]);

  useEffect(() => {
    setChatViewVisible(pathname === "/");
  }, [pathname, setChatViewVisible]);

  useEffect(() => {
    setCurrentAccountId(account?.id ?? null);
  }, [account?.id, setCurrentAccountId]);

  useEffect(() => {
    let isCancelled = false;

    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated || !tokens?.accessToken) {
      disconnectRealtime();
      return;
    }

    async function startRealtime() {
      const accessToken = await getFreshAccessToken(apiBaseUrl);

      if (isCancelled || !accessToken) {
        disconnectRealtime();
        return;
      }

      void loadGuilds(apiBaseUrl, accessToken);
      void loadUsers(apiBaseUrl, accessToken);
      connectRealtime(apiBaseUrl, accessToken);
    }

    void startRealtime();

    return () => {
      isCancelled = true;
    };
  }, [
    apiBaseUrl,
    connectRealtime,
    disconnectRealtime,
    getFreshAccessToken,
    hasHydrated,
    isAuthenticated,
    loadGuilds,
    loadUsers,
    tokens?.accessToken,
  ]);

  function handleAccountMenuOpen(event: MouseEvent<HTMLButtonElement>) {
    setAccountMenuAnchor(event.currentTarget);
  }

  function handleAccountMenuClose() {
    setAccountMenuAnchor(null);
  }

  function handleLanguageChange(event: SelectChangeEvent<UiLanguage>) {
    const nextLanguage = event.target.value as UiLanguage;
    setLanguage(nextLanguage);

    if (isAuthenticated) {
      void updateLanguagePreference(apiBaseUrl, nextLanguage);
    }
  }

  return (
    <Box
      sx={{
        background:
          "radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.22), transparent 34%), linear-gradient(135deg, #04101d 0%, #071827 52%, #020812 100%)",
        color: "#e5edf7",
        display: "grid",
        gridTemplateRows: { xs: "auto minmax(0, 1fr)", lg: "92px minmax(0, 1fr)" },
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <Box
        component="header"
        sx={{
          alignItems: "center",
          backdropFilter: "blur(18px)",
          bgcolor: "rgba(3, 10, 20, 0.76)",
          borderBottom: "1px solid rgba(96, 165, 250, 0.18)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "280px minmax(0, 1fr) auto" },
          minHeight: 92,
          px: { xs: 2.5, md: 4 },
        }}
      >
        <Box sx={{ alignItems: "center", display: "flex", gap: 2 }}>
          <Box
            component="img"
            alt="Dworven Shaft"
            src="/assets/imgs/logo.png"
            sx={{
              display: "block",
              flex: "0 0 auto",
              height: 56,
              objectFit: "contain",
              width: 56,
            }}
          />
          <Box>
            <Typography sx={{ fontSize: "1.35rem", fontWeight: 800, letterSpacing: 1.4, lineHeight: 1 }}>
              Dworven Shaft
            </Typography>
            <Typography sx={{ color: "#8ca3ba", fontSize: "0.78rem", letterSpacing: 2, mt: 0.4 }}>
              {t.socialHub}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: { xs: "none", md: "flex" }, justifyContent: "center", minHeight: 92 }}>
          {[
            { href: null, key: "play", label: t.play },
            { href: "/", key: "social", label: t.social },
            { href: "/profile", key: "profile", label: t.profile },
            { href: "/guilds", key: "guild", label: t.guilds },
            { href: null, key: "shop", label: t.shop },
          ].map((item) => (
            <Box
              component={item.href ? Link : "span"}
              href={item.href ?? undefined}
              key={item.key}
              sx={{
                alignItems: "center",
                borderBottom: item.key === activeNavKey ? "2px solid #60a5fa" : "2px solid transparent",
                boxShadow: item.key === activeNavKey ? "inset 0 -18px 24px rgba(96, 165, 250, 0.16)" : "none",
                color: item.key === activeNavKey ? "#f8fbff" : "#9badbf",
                display: "flex",
                fontWeight: 700,
                gap: 1,
                letterSpacing: 1.3,
                px: 3,
                position: "relative",
                textDecoration: "none",
                textTransform: "uppercase",
              }}
            >
              {item.label}
              {item.key === "social" && showSocialUnread ? (
                <Box
                  component="span"
                  sx={{
                    bgcolor: "#60a5fa",
                    border: "1px solid rgba(191, 219, 254, 0.75)",
                    borderRadius: "50%",
                    boxShadow: "0 0 12px rgba(96, 165, 250, 0.8)",
                    height: 8,
                    width: 8,
                  }}
                />
              ) : null}
            </Box>
          ))}
        </Box>

        <Box sx={{ alignItems: "center", display: "flex", gap: 2, justifyContent: { xs: "flex-start", md: "flex-end" }, py: { xs: 2, md: 0 } }}>
          <FormControl size="small" sx={{ minWidth: 82 }}>
            <Select
              aria-label={t.language}
              onChange={handleLanguageChange}
              renderValue={(value) => {
                const languageCode = value as UiLanguage;
                return `${languageFlags[languageCode]} ${languageCode.toUpperCase()}`;
              }}
              sx={{
                bgcolor: "rgba(2, 8, 18, 0.32)",
                color: "#c7d5e6",
                fontSize: "0.82rem",
                fontWeight: 800,
                height: 36,
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(148, 163, 184, 0.18)",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(96, 165, 250, 0.36)",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(96, 165, 250, 0.64)",
                },
              }}
              value={language}
            >
              {(Object.keys(languageLabels) as UiLanguage[]).map((languageCode) => (
                <MenuItem key={languageCode} value={languageCode}>
                  {languageFlags[languageCode]} {languageCode.toUpperCase()}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Chip label={connectionStatus} size="small" sx={{ bgcolor: "rgba(96, 165, 250, 0.16)", color: "#bfdbfe", fontWeight: 700 }} />
          {isAuthenticated ? (
            <>
              <Button
                aria-controls={accountMenuAnchor ? "account-menu" : undefined}
                aria-haspopup="true"
                onClick={handleAccountMenuOpen}
                sx={{
                  borderRadius: 1,
                  color: "#e5edf7",
                  gap: 1.25,
                  justifyContent: "flex-start",
                  px: 1,
                  py: 0.75,
                  textTransform: "none",
                }}
                type="button"
              >
                <Avatar
                  src={avatarPath}
                  sx={{
                    bgcolor: "#132337",
                    border: "1px solid rgba(96, 165, 250, 0.35)",
                    height: 44,
                    width: 44,
                  }}
                />
                <Box sx={{ textAlign: "left" }}>
                  <Typography sx={{ fontWeight: 800, lineHeight: 1 }}>{profile?.displayName ?? "Player"}</Typography>
                  <Typography sx={{ color: "#78d88f", fontSize: "0.8rem" }}>{profile?.onlineStatus ?? "offline"}</Typography>
                </Box>
              </Button>
              <Menu
                anchorEl={accountMenuAnchor}
                id="account-menu"
                onClose={handleAccountMenuClose}
                open={Boolean(accountMenuAnchor)}
                slotProps={{
                  paper: {
                    sx: {
                      bgcolor: "#081827",
                      border: "1px solid rgba(96, 165, 250, 0.22)",
                      color: "#e5edf7",
                      minWidth: 180,
                    },
                  },
                }}
              >
                <MenuItem component={Link} href="/profile" onClick={handleAccountMenuClose}>
                  {t.profile}
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    handleAccountMenuClose();
                    void logout(apiBaseUrl);
                  }}
                >
                  {t.logout}
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Button component={Link} href="/auth" size="small" sx={{ color: "#bfdbfe", borderColor: "rgba(96, 165, 250, 0.28)" }} variant="outlined">
              {t.login}
            </Button>
          )}
        </Box>
      </Box>

      <Box sx={{ minHeight: 0, overflow: "auto" }}>{children}</Box>
    </Box>
  );
}
