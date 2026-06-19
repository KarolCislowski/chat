"use client";

import { FormEvent, useEffect, useMemo } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useAuthStore } from "../stores/auth-store";
import { useChatStore } from "../stores/chat-store";

export default function Home() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
  const draft = useChatStore((state) => state.draft);
  const health = useChatStore((state) => state.health);
  const healthError = useChatStore((state) => state.healthError);
  const messages = useChatStore((state) => state.messages);
  const addMessage = useChatStore((state) => state.addMessage);
  const loadHealth = useChatStore((state) => state.loadHealth);
  const setDraft = useChatStore((state) => state.setDraft);
  const authError = useAuthStore((state) => state.error);
  const authMode = useAuthStore((state) => state.mode);
  const isAuthLoading = useAuthStore((state) => state.isLoading);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const profile = useAuthStore((state) => state.profile);
  const register = useAuthStore((state) => state.register);
  const setAuthMode = useAuthStore((state) => state.setMode);
  const tokens = useAuthStore((state) => state.tokens);

  useEffect(() => {
    void loadHealth(apiBaseUrl);
  }, [apiBaseUrl, loadHealth]);

  const apiStatus = useMemo(() => {
    if (health?.status === "ok" && health.database === "connected") {
      return "API i MongoDB dzialaja";
    }

    if (health?.status === "ok") {
      return "API dziala, MongoDB nie jest polaczone";
    }

    return "API niedostepne";
  }, [health]);

  const isApiConnected = health?.status === "ok" && health.database === "connected";
  const isAuthenticated = Boolean(profile && tokens?.accessToken);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const text = draft.trim();
    if (!text) {
      return;
    }

    addMessage(text);
  }

  function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

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
        bgcolor: "background.default",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "minmax(240px, 320px) minmax(0, 1fr)" },
        minHeight: "100vh",
      }}
    >
      <Box
        component="aside"
        aria-label="Lista rozmow"
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
            Chat
          </Typography>
          <Typography component="h1" sx={{ fontSize: "2rem", fontWeight: 700, lineHeight: 1.1 }}>
            Rozmowy
          </Typography>
        </Box>

        <Button color="primary" disabled={!isAuthenticated} fullWidth variant="contained">
          Nowa rozmowa
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
                  Profil
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{profile.displayName}</Typography>
                <Typography sx={{ color: "#b7c3cf", fontSize: "0.85rem" }}>{profile.onlineStatus}</Typography>
              </Box>
              <Button color="inherit" onClick={() => void logout(apiBaseUrl)} variant="outlined">
                Wyloguj
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleAuthSubmit} sx={{ display: "grid", gap: 1.5 }}>
              <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: "1fr 1fr" }}>
                <Button
                  color="inherit"
                  onClick={() => setAuthMode("login")}
                  size="small"
                  variant={authMode === "login" ? "contained" : "outlined"}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  onClick={() => setAuthMode("register")}
                  size="small"
                  variant={authMode === "register" ? "contained" : "outlined"}
                >
                  Rejestracja
                </Button>
              </Box>

              {authMode === "register" ? (
                <TextField
                  fullWidth
                  label="Nazwa"
                  name="displayName"
                  required
                  size="small"
                  slotProps={{ inputLabel: { sx: { color: "#d9e2ea" } } }}
                  sx={{ input: { color: "#fff" } }}
                />
              ) : null}

              <TextField
                fullWidth
                label="Email"
                name="email"
                required
                size="small"
                slotProps={{ inputLabel: { sx: { color: "#d9e2ea" } } }}
                sx={{ input: { color: "#fff" } }}
                type="email"
              />
              <TextField
                fullWidth
                label="Haslo"
                name="password"
                required
                size="small"
                slotProps={{ inputLabel: { sx: { color: "#d9e2ea" } } }}
                sx={{ input: { color: "#fff" } }}
                type="password"
              />

              {authError ? (
                <Alert severity="warning" variant="outlined">
                  {authError}
                </Alert>
              ) : null}

              <Button disabled={isAuthLoading} type="submit" variant="contained">
                {authMode === "register" ? "Utworz konto" : "Zaloguj"}
              </Button>
            </Box>
          )}
        </Paper>

        <List aria-label="Aktywne rozmowy" disablePadding sx={{ display: "grid", gap: 1.25 }}>
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
              primary="Development"
              secondary={isAuthenticated ? "lokalnie" : "wymaga logowania"}
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
              primary="API"
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
        aria-label="Aktywna rozmowa"
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
              Workspace
            </Typography>
            <Typography component="h2" sx={{ fontSize: "1.45rem", fontWeight: 700, lineHeight: 1.2 }}>
              Development Chat
            </Typography>
          </Box>

          <Chip
            color={isApiConnected ? "primary" : "warning"}
            label={apiStatus}
            sx={{
              alignSelf: { xs: "flex-start", md: "center" },
              fontWeight: 700,
              maxWidth: "100%",
            }}
            variant="outlined"
          />
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
                const isOwnMessage = message.author === "Ty";

                return (
                  <Paper
                    component="article"
                    elevation={isOwnMessage ? 0 : 3}
                    key={message.id}
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
                      <Typography component="span" sx={{ fontSize: "inherit" }}>
                        {message.author}
                      </Typography>
                      <Typography component="time" sx={{ fontSize: "inherit" }}>
                        {message.time}
                      </Typography>
                    </Box>
                    <Typography sx={{ lineHeight: 1.55 }}>{message.text}</Typography>
                  </Paper>
                );
              })}

              {healthError ? (
                <Alert severity="warning" variant="outlined">
                  Szczegoly polaczenia API: {healthError}
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
                  label="Wiadomosc"
                  name="message"
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Napisz wiadomosc..."
                  value={draft}
                />
                <Button sx={{ minWidth: { sm: 120 } }} type="submit" variant="contained">
                  Wyslij
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
                Zaloguj sie, aby korzystac z chatu
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.55 }}>
                Dostep do rozmow jest dostepny tylko dla uzytkownikow z aktywna sesja JWT. Uzyj formularza logowania lub
                rejestracji w panelu bocznym.
              </Typography>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
}
