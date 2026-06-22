import { FormEvent } from "react";
import { Box, Button, Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";
import { ComposeAppearance } from "../domain/appearance";
import { ChatChannel, getChatChannelKey } from "../../../stores/chat-store";
import { Guild } from "../../../stores/guild-store";
import { ChatUser } from "../../../stores/user-store";

/** Props required to render and submit the chat message composer. */
type MessageComposerProps = {
  /** Active view type; the open view exposes the destination selector. */
  activeChannelType: "open" | "global" | "guild" | "whisper";
  /** Visual tokens for the currently selected compose destination. */
  appearance: ComposeAppearance;
  /** Concrete destination receiving the next message. */
  composeChannel: ChatChannel;
  /** Realtime connection state used to enable or disable sending. */
  connectionStatus: string;
  /** Current unsent composer text. */
  draft: string;
  /** Guild destinations available to the current user. */
  guilds: Guild[];
  /**
   * Handles selecting a different message destination in the open view.
   *
   * @param event - MUI select change event containing the channel key.
   * @returns Nothing.
   */
  onComposeChannelChange: (event: SelectChangeEvent<string>) => void;
  /**
   * Writes the latest draft value to the owning state.
   *
   * @param draft - New composer text.
   * @returns Nothing.
   */
  onDraftChange: (draft: string) => void;
  /**
   * Submits the composer form.
   *
   * @param event - Form submit event from the composer form.
   * @returns Nothing.
   */
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  /** Translation dictionary used for labels and placeholders. */
  t: Record<string, string>;
  /** Whisper destinations available to the current user. */
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
            border: "1px solid transparent",
            color: "#03131f",
            fontWeight: 900,
            minWidth: { sm: 120 },
            "&:hover": {
              bgcolor: appearance.badgeColor,
            },
            "&.Mui-disabled": {
              bgcolor: "rgba(8, 24, 39, 0.72)",
              borderColor: appearance.messageBorder,
              color: "rgba(229, 237, 247, 0.54)",
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
