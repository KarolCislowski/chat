import { MouseEvent } from "react";
import { Avatar, Box, Chip, IconButton, Paper, TextField, Typography } from "@mui/material";
import { resolveAvatarPath } from "../../../lib/avatar-options";
import { ChatUser } from "../../../stores/user-store";

/** Props for the online player list and API status side panel. */
type OnlinePlayersPanelProps = {
  /** Localized API status text. */
  apiStatus: string;
  /** Whether the API health check reports a usable connection. */
  isApiConnected: boolean;
  /**
   * Opens the action menu for a player.
   *
   * @param event - Button click event used as the menu anchor.
   * @param user - Player selected by the user.
   * @returns Nothing.
   */
  onPlayerMenuOpen: (event: MouseEvent<HTMLButtonElement>, user: ChatUser) => void;
  /** Users currently shown as online. */
  onlineUsers: ChatUser[];
  /** Translation dictionary used for labels and empty states. */
  t: Record<string, string>;
};

export function OnlinePlayersPanel({ apiStatus, isApiConnected, onPlayerMenuOpen, onlineUsers, t }: OnlinePlayersPanelProps) {
  return (
    <Box
      component="aside"
      aria-label={t.onlinePlayers}
      sx={{
        bgcolor: "rgba(3, 10, 20, 0.62)",
        color: "#e5edf7",
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        gridColumn: { xs: "1", lg: "3" },
        minHeight: 0,
        overflowY: "auto",
        p: { xs: 2.5, md: 3 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          bgcolor: "rgba(5, 17, 31, 0.76)",
          border: "1px solid rgba(96, 165, 250, 0.16)",
          color: "inherit",
          p: 2.25,
        }}
        variant="outlined"
      >
        <Box sx={{ alignItems: "center", display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Typography sx={{ color: "#c7d5e6", fontSize: "0.78rem", fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>
            {t.onlinePlayers} - {onlineUsers.length}
          </Typography>
        </Box>

        <TextField
          disabled
          fullWidth
          placeholder={t.searchFriends}
          size="small"
          sx={{
            mb: 2,
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(2, 8, 18, 0.58)",
              color: "#90a4ba",
            },
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: "rgba(148, 163, 184, 0.18)",
            },
          }}
        />

        <Box sx={{ display: "grid", gap: 1.2 }}>
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user) => (
              <Box
                key={user.accountId}
                sx={{
                  alignItems: "center",
                  borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
                  display: "grid",
                  gap: 1.25,
                  gridTemplateColumns: "40px minmax(0, 1fr) 32px",
                  pb: 1.15,
                }}
              >
                <Box sx={{ position: "relative" }}>
                  <Avatar
                    src={resolveAvatarPath(user.avatarUrl)}
                    sx={{
                      bgcolor: "#132337",
                      border: "1px solid rgba(96, 165, 250, 0.35)",
                      height: 40,
                      width: 40,
                    }}
                  />
                  <Box
                    sx={{
                      bgcolor: user.onlineStatus === "online" ? "#22c55e" : user.onlineStatus === "busy" ? "#f59e0b" : "#60a5fa",
                      border: "2px solid #06111e",
                      borderRadius: "50%",
                      bottom: 0,
                      height: 12,
                      position: "absolute",
                      right: 0,
                      width: 12,
                    }}
                  />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 800, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.displayName}</Typography>
                  <Typography sx={{ color: user.onlineStatus === "online" ? "#78d88f" : "#f0b35f", fontSize: "0.82rem" }}>
                    {user.onlineStatus}
                  </Typography>
                </Box>
                <IconButton
                  aria-label={`Open actions menu for ${user.displayName}`}
                  color="inherit"
                  onClick={(event) => onPlayerMenuOpen(event, user)}
                  size="small"
                  sx={{ color: "#f0b35f" }}
                  type="button"
                >
                  <Box aria-hidden component="span">
                    ...
                  </Box>
                </IconButton>
              </Box>
            ))
          ) : (
            <Typography sx={{ color: "#8ca3ba", fontSize: "0.9rem" }}>{t.noOnlinePlayers}</Typography>
          )}
        </Box>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          bgcolor: "rgba(5, 17, 31, 0.58)",
          border: "1px solid rgba(96, 165, 250, 0.14)",
          color: "inherit",
          p: 2.25,
        }}
        variant="outlined"
      >
        <Typography sx={{ color: "#c7d5e6", fontSize: "0.78rem", fontWeight: 800, letterSpacing: 1.4, mb: 1.5, textTransform: "uppercase" }}>
          {t.apiTitle}
        </Typography>
        <Chip
          label={apiStatus}
          size="small"
          sx={{
            bgcolor: isApiConnected ? "rgba(34, 197, 94, 0.14)" : "rgba(245, 158, 11, 0.14)",
            color: isApiConnected ? "#86efac" : "#fcd34d",
            fontWeight: 700,
          }}
        />
      </Paper>
    </Box>
  );
}
