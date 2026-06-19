"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo } from "react";
import {
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { languageLabels, UiLanguage } from "../i18n/translations";
import { useAuthStore } from "../stores/auth-store";
import { useChatStore } from "../stores/chat-store";
import { useLanguageStore } from "../stores/language-store";

export default function Home() {
  const router = useRouter();
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  const draft = useChatStore((state) => state.draft);
  const connectionError = useChatStore((state) => state.connectionError);
  const connectionStatus = useChatStore((state) => state.connectionStatus);
  const health = useChatStore((state) => state.health);
  const healthError = useChatStore((state) => state.healthError);
  const messages = useChatStore((state) => state.messages);
  const connectRealtime = useChatStore((state) => state.connectRealtime);
  const disconnectRealtime = useChatStore((state) => state.disconnectRealtime);
  const loadGlobalMessages = useChatStore((state) => state.loadGlobalMessages);
  const loadHealth = useChatStore((state) => state.loadHealth);
  const sendGlobalMessage = useChatStore((state) => state.sendGlobalMessage);
  const setDraft = useChatStore((state) => state.setDraft);
  const account = useAuthStore((state) => state.account);
  const getFreshAccessToken = useAuthStore((state) => state.getFreshAccessToken);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const logout = useAuthStore((state) => state.logout);
  const profile = useAuthStore((state) => state.profile);
  const tokens = useAuthStore((state) => state.tokens);
  const updateLanguagePreference = useAuthStore((state) => state.updateLanguagePreference);
  const language = useLanguageStore((state) => state.language);
  const setLanguage = useLanguageStore((state) => state.setLanguage);
  const t = useLanguageStore((state) => state.t);

  useEffect(() => {
    void loadHealth(apiBaseUrl);
  }, [apiBaseUrl, loadHealth]);

  useEffect(() => {
    if (profile?.language && profile.language !== language) {
      setLanguage(profile.language);
    }
  }, [language, profile?.language, setLanguage]);

  const apiStatus = useMemo(() => {
    if (health?.status === "ok" && health.database === "connected") {
      return t.apiConnected;
    }

    if (health?.status === "ok") {
      return t.apiNoDatabase;
    }

    return t.apiDisconnected;
  }, [health, t]);

  const isApiConnected = health?.status === "ok" && health.database === "connected";
  const isAuthenticated = Boolean(profile && tokens?.accessToken);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [hasHydrated, isAuthenticated, router]);

  useEffect(() => {
    let isCancelled = false;

    if (!isAuthenticated || !tokens?.accessToken) {
      disconnectRealtime();
      return;
    }

    async function startChat() {
      const accessToken = await getFreshAccessToken(apiBaseUrl);

      if (isCancelled || !accessToken) {
        disconnectRealtime();
        return;
      }

      void loadGlobalMessages(apiBaseUrl, accessToken);
      connectRealtime(apiBaseUrl, accessToken);
    }

    void startChat();

    return () => {
      isCancelled = true;
      disconnectRealtime();
    };
  }, [apiBaseUrl, connectRealtime, disconnectRealtime, getFreshAccessToken, isAuthenticated, loadGlobalMessages, tokens?.accessToken]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (!text) {
      return;
    }

    sendGlobalMessage(text);
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
      component="main"
      sx={{
        bgcolor: "background.default",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(240px, 320px) minmax(0, 1fr)" },
        minHeight: "100vh",
      }}
    >
      <Box
        component="aside"
        aria-label={t.conversations}
        sx={{
          bgcolor: "#202832",
          color: "#f8fafc",
          display: "flex",
          flexDirection: "column",
          gap: 3,
          p: { xs: 2.5, md: 3.5 },
        }}
      >
        <Box>
          <Typography color="#8aa3b5" sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
            {t.chat}
          </Typography>
          <Typography component="h1" sx={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.1 }}>
            {t.conversations}
          </Typography>
        </Box>

        <FormControl fullWidth size="small">
          <InputLabel id="language-label" sx={{ color: "#d9e2ea" }}>
            {t.language}
          </InputLabel>
          <Select
            label={t.language}
            labelId="language-label"
            onChange={handleLanguageChange}
            sx={{ color: "#fff" }}
            value={language}
          >
            {(Object.keys(languageLabels) as UiLanguage[]).map((languageCode) => (
              <MenuItem key={languageCode} value={languageCode}>
                {languageLabels[languageCode]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button color="primary" disabled={!isAuthenticated} fullWidth type="button" variant="contained">
          {t.newChat}
        </Button>

        <Paper
          component="section"
          elevation={0}
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            color: "inherit",
            p: 2,
          }}
          variant="outlined"
        >
          {profile ? (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Box>
                <Typography sx={{ color: "#8aa3b5", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                  {t.profile}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{profile.displayName}</Typography>
                <Typography sx={{ color: "#b7c3cf", fontSize: "0.85rem" }}>{profile.onlineStatus}</Typography>
              </Box>
              <Button color="inherit" component={Link} href="/profile" type="button" variant="contained">
                {t.profile}
              </Button>
              <Button color="inherit" onClick={() => void logout(apiBaseUrl)} type="button" variant="outlined">
                {t.logout}
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: "grid", gap: 1.5 }}>
              <Box>
                <Typography sx={{ color: "#8aa3b5", fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
                  {t.profile}
                </Typography>
                <Typography sx={{ color: "#b7c3cf", fontSize: "0.9rem" }}>{t.conversationRequiresLogin}</Typography>
              </Box>
              <Button color="inherit" component={Link} href="/auth" type="button" variant="contained">
                {t.login}
              </Button>
            </Box>
          )}
        </Paper>

        <List aria-label={t.conversations} disablePadding sx={{ display: "grid", gap: 1.25 }}>
          <ListItemButton
            component="a"
            disabled={!isAuthenticated}
            href="#current"
            selected={isAuthenticated}
            sx={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 1,
              color: "inherit",
              display: "grid",
              gap: 0.5,
              "&.Mui-selected": {
                bgcolor: "rgba(255, 255, 255, 0.08)",
              },
              "&.Mui-selected:hover": {
                bgcolor: "rgba(255, 255, 255, 0.12)",
              },
            }}
          >
            <ListItemText
              primary={t.globalChat}
              secondary={isAuthenticated ? t.local : t.conversationRequiresLogin}
              slotProps={{
                primary: { sx: { fontWeight: 700 } },
                secondary: { sx: { color: "#b7c3cf", fontSize: "0.85rem" } },
              }}
            />
          </ListItemButton>

          <ListItemButton
            component="a"
            href="#api"
            sx={{
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: 1,
              color: "inherit",
            }}
          >
            <ListItemText
              primary={t.apiTitle}
              secondary={apiStatus}
              slotProps={{
                primary: { sx: { fontWeight: 700 } },
                secondary: { sx: { color: "#b7c3cf", fontSize: "0.85rem" } },
              }}
            />
          </ListItemButton>
        </List>
      </Box>

      <Box
        component="section"
        id="current"
        aria-label={t.globalChat}
        sx={{
          display: "grid",
          gridTemplateRows: "auto minmax(0, 1fr) auto",
          minHeight: { xs: "70vh", md: "100vh" },
          minWidth: 0,
          p: { xs: 2.5, md: 4 },
        }}
      >
        <Box
          component="header"
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2.5,
            justifyContent: "space-between",
            pb: 3,
          }}
        >
          <Box>
            <Typography color="text.secondary" sx={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase" }}>
              {t.workspace}
            </Typography>
            <Typography component="h2" sx={{ fontSize: "1.45rem", fontWeight: 700, lineHeight: 1.2 }}>
              {t.globalChat}
            </Typography>
          </Box>

          <Box sx={{ alignItems: { xs: "flex-start", md: "center" }, display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              color={connectionStatus === "connected" ? "primary" : "warning"}
              label={connectionStatus}
              sx={{ fontWeight: 700, maxWidth: "100%" }}
              variant="outlined"
            />
            <Chip
              color={isApiConnected ? "primary" : "warning"}
              label={apiStatus}
              sx={{ fontWeight: 700, maxWidth: "100%" }}
              variant="outlined"
            />
          </Box>
        </Box>

        {isAuthenticated ? (
          <>
            <Box
              aria-live="polite"
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.75,
                minHeight: 0,
                overflowY: "auto",
                py: 3.5,
              }}
            >
              {messages.map((message) => {
                const isOwnMessage = message.senderId === account?.id;
                const author = isOwnMessage ? profile?.displayName ?? t.profile : message.sender?.displayName ?? message.senderId;
                const authorStatus = message.sender?.onlineStatus ?? (isOwnMessage ? profile?.onlineStatus : undefined);
                const messageTime = new Intl.DateTimeFormat(language, {
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(message.createdAt));

                return (
                  <Paper
                    component="article"
                    elevation={isOwnMessage ? 0 : 3}
                    key={message._id}
                    sx={{
                      alignSelf: isOwnMessage ? "flex-end" : "flex-start",
                      bgcolor: isOwnMessage ? "#eef8f5" : "background.paper",
                      border: 1,
                      borderColor: isOwnMessage ? "rgba(20, 108, 95, 0.24)" : "divider",
                      maxWidth: 680,
                      p: 2,
                      width: "min(680px, 100%)",
                    }}
                    variant="outlined"
                  >
                    <Box
                      sx={{
                        color: "text.secondary",
                        display: "flex",
                        fontSize: "0.82rem",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Box component="span" sx={{ alignItems: "center", display: "inline-flex", gap: 0.75, minWidth: 0 }}>
                        <Box
                          component="span"
                          sx={{
                            bgcolor: authorStatus === "online" ? "primary.main" : "text.disabled",
                            borderRadius: "50%",
                            flex: "0 0 auto",
                            height: 8,
                            width: 8,
                          }}
                        />
                        <Typography component="span" sx={{ fontSize: "inherit", overflowWrap: "anywhere" }}>
                          {author}
                        </Typography>
                      </Box>
                      <Typography component="time" sx={{ fontSize: "inherit" }}>
                        {messageTime}
                      </Typography>
                    </Box>
                    <Typography sx={{ lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{message.content}</Typography>
                  </Paper>
                );
              })}

              {connectionError ? (
                <Alert severity="warning" variant="outlined">
                  {connectionError}
                </Alert>
              ) : null}

              {healthError ? (
                <Alert severity="warning" variant="outlined">
                  {healthError}
                </Alert>
              ) : null}
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
              <Divider sx={{ mb: 2.5 }} />
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1.25,
                }}
              >
                <TextField
                  fullWidth
                  id="message"
                  label={t.message}
                  name="message"
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={t.typeMessage}
                  value={draft}
                />
                <Button disabled={connectionStatus !== "connected"} sx={{ minWidth: { sm: 120 } }} type="submit" variant="contained">
                  {t.send}
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <Box
            sx={{
              alignItems: "center",
              display: "flex",
              justifyContent: "center",
              minHeight: 0,
              py: 3.5,
            }}
          >
            <Paper
              sx={{
                maxWidth: 520,
                p: 3,
                textAlign: "center",
                width: "100%",
              }}
              variant="outlined"
            >
              <Typography component="h3" sx={{ fontSize: "1.35rem", fontWeight: 700, mb: 1 }}>
                {t.chatLockedTitle}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.55 }}>
                {t.chatLockedBody}
              </Typography>
              <Button component={Link} href="/auth" sx={{ mt: 2.5 }} variant="contained">
                {t.login}
              </Button>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
}
