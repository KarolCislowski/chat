import { FormEvent } from "react";
import { Box, Button, Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { ComposeAppearance } from "../../lib/chat/appearance";
import { ChatChannel, getChatChannelKey } from "../../stores/chat-store";
import { Guild } from "../../stores/guild-store";
import { ChatUser } from "../../stores/user-store";

type MessageComposerProps = {
  activeChannelType: "open" | "global" | "guild" | "whisper";
  appearance: ComposeAppearance;
  composeChannel: ChatChannel;
  connectionStatus: string;
  draft: string;
  guilds: Guild[];
  onComposeChannelChange: (event: SelectChangeEvent<string>) => void;
  onDraftChange: (draft: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  t: Record<string, string>;
  users: ChatUser[];
};

export function MessageComposer({
  activeChannelType,
  appearance,
  composeChannel,
  connectionStatus,
  draft,
  guilds,
  onComposeChannelChange,
  onDraftChange,
  onSubmit,
  t,
  users,
}: MessageComposerProps) {
  return (
    <Box component="form" onSubmit={onSubmit}>
      <Divider sx={{ borderColor: appearance.messageBorder, mb: 2.5 }} />
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.25,
        }}
      >
        {activeChannelType === "open" ? (
          <FormControl sx={{ minWidth: { sm: 180 } }}>
            <InputLabel id="compose-channel-label" sx={{ color: appearance.accent, "&.Mui-focused": { color: appearance.accent } }}>
              {t.sendTo}
            </InputLabel>
            <Select
              label={t.sendTo}
              labelId="compose-channel-label"
              onChange={onComposeChannelChange}
              sx={{
                color: appearance.accent,
                fontWeight: 700,
                bgcolor: "rgba(2, 8, 18, 0.3)",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: appearance.messageBorder,
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: appearance.accent,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: appearance.accent,
                },
              }}
              value={getChatChannelKey(composeChannel)}
            >
              <MenuItem value="global">{t.globalChat}</MenuItem>
              {guilds.map((guild) => (
                <MenuItem key={guild._id} value={`guild:${guild._id}`}>
                  {guild.name}
                </MenuItem>
              ))}
              {users.map((user) => (
                <MenuItem key={user.accountId} value={`whisper:${user.accountId}`}>
                  {t.whisper}: {user.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : null}
        <TextField
          fullWidth
          id="message"
          label={t.message}
          name="message"
          onChange={(event) => onDraftChange(event.target.value)}
          placeholder={t.typeMessage}
          sx={{
            "& .MuiOutlinedInput-input": {
              color: appearance.accent,
            },
            "& .MuiOutlinedInput-root": {
              bgcolor: "rgba(2, 8, 18, 0.3)",
            },
            "& .MuiOutlinedInput-root fieldset": {
              borderColor: appearance.messageBorder,
            },
            "& .MuiOutlinedInput-root:hover fieldset": {
              borderColor: appearance.accent,
            },
            "& .MuiOutlinedInput-root.Mui-focused fieldset": {
              borderColor: appearance.accent,
            },
            "& .MuiInputLabel-root": {
              color: appearance.accent,
            },
            "& .MuiInputLabel-root.Mui-focused": {
              color: appearance.accent,
            },
          }}
          value={draft}
        />
        <Button
          disabled={connectionStatus !== "connected"}
          sx={{
            bgcolor: appearance.accent,
            minWidth: { sm: 120 },
            "&:hover": {
              bgcolor: appearance.badgeColor,
            },
          }}
          type="submit"
          variant="contained"
        >
          {t.send}
        </Button>
      </Box>
    </Box>
  );
}
