import Link from "next/link";
import { Box, Button, Chip, Typography } from "@mui/material";
import { resolveAvatarPath } from "../../lib/avatar-options";
import { hexToRgba, ChannelAppearance } from "../../lib/chat/appearance";
import { resolveGuildBackgroundUrl, resolveGuildEmblemUrl } from "../../lib/guild-flags";
import { ChatView } from "../../stores/chat-store";
import { Guild } from "../../stores/guild-store";
import { ChatUser } from "../../stores/user-store";

type ChannelHeroProps = {
  activeChannel: ChatView;
  activeChannelTitle: string;
  activeGuild: Guild | null;
  activeWhisperUser: ChatUser | null;
  appearance: ChannelAppearance;
  t: Record<string, string>;
};

export function ChannelHero({ activeChannel, activeChannelTitle, activeGuild, activeWhisperUser, appearance, t }: ChannelHeroProps) {
  const backgroundUrl = activeGuild
    ? resolveGuildBackgroundUrl(activeGuild.backgroundUrl)
    : activeChannel.type === "open"
      ? "/assets/imgs/open-bg.png"
      : activeChannel.type === "whisper"
        ? "/assets/imgs/whisper-bg.png"
        : "/assets/imgs/global-bg.png";
  const avatarUrl = activeGuild
    ? resolveGuildEmblemUrl(activeGuild.emblemUrl, activeGuild.themeColor)
    : activeChannel.type === "open"
      ? "/assets/imgs/open_avatar.png"
      : activeChannel.type === "whisper"
        ? resolveAvatarPath(activeWhisperUser?.avatarUrl)
        : "/assets/imgs/global_avatar.png";

  return (
    <Box
      component="section"
      sx={{
        alignItems: "center",
        backgroundImage: `linear-gradient(90deg, rgba(3, 10, 20, 0.9) 0%, rgba(3, 10, 20, 0.58) 52%, rgba(3, 10, 20, 0.22) 100%), url(${backgroundUrl})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        border: `1px solid ${appearance.messageBorder}`,
        borderRadius: 1,
        boxShadow: "inset 0 -56px 90px rgba(2, 8, 18, 0.42), 0 18px 44px rgba(0, 0, 0, 0.22)",
        display: "grid",
        gap: { xs: 1.5, sm: 2.5 },
        gridTemplateColumns: { xs: "74px minmax(0, 1fr)", md: activeGuild ? "116px minmax(0, 1fr) auto" : "96px minmax(0, 1fr) auto" },
        minHeight: { xs: 234, md: 282 },
        overflow: "hidden",
        p: { xs: 2, md: 2.5 },
        position: "relative",
      }}
    >
      <Box
        component="img"
        alt=""
        src={avatarUrl}
        sx={{
          alignSelf: "center",
          border: activeGuild ? "none" : `1px solid ${appearance.messageBorder}`,
          borderRadius: activeGuild ? 0 : "50%",
          filter: activeGuild ? "drop-shadow(0 16px 24px rgba(0, 0, 0, 0.54))" : "drop-shadow(0 14px 20px rgba(0, 0, 0, 0.48))",
          height: activeGuild ? "100%" : { xs: 70, md: 92 },
          maxHeight: activeGuild ? { xs: 195, md: 246 } : undefined,
          objectFit: activeGuild ? "contain" : "cover",
          width: activeGuild ? { xs: 70, md: 108 } : { xs: 70, md: 92 },
        }}
      />

      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ color: appearance.accent, fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>
          {activeGuild ? t.guilds : appearance.label}
        </Typography>
        <Typography
          component="h3"
          sx={{
            color: "#f8fbff",
            fontSize: { xs: "1.45rem", md: "2rem" },
            fontWeight: 800,
            lineHeight: 1.1,
            mt: 0.5,
            overflowWrap: "anywhere",
            textShadow: "0 2px 18px rgba(0, 0, 0, 0.68)",
          }}
        >
          {activeChannelTitle}
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.25 }}>
          {activeGuild ? (
            <>
              <Chip
                label={`${activeGuild.members.length} ${t.members}`}
                size="small"
                sx={{ bgcolor: hexToRgba(appearance.accent, 0.18), color: "#f8fbff", fontWeight: 800 }}
              />
              <Chip
                label={`/${activeGuild.slug}`}
                size="small"
                sx={{ bgcolor: "rgba(2, 8, 18, 0.42)", color: "#bfdbfe", fontWeight: 700 }}
              />
            </>
          ) : activeChannel.type === "whisper" ? (
            <Chip
              label={activeWhisperUser?.onlineStatus ?? t.offline}
              size="small"
              sx={{ bgcolor: "rgba(2, 8, 18, 0.42)", color: appearance.accent, fontWeight: 800 }}
            />
          ) : null}
        </Box>
      </Box>

      <Button
        component={Link}
        href={activeGuild ? "/guilds" : activeChannel.type === "whisper" ? `/profile/${activeChannel.recipientId}` : "/"}
        sx={{
          alignSelf: "center",
          borderColor: hexToRgba(appearance.accent, 0.72),
          color: "#f8fbff",
          display: { xs: "none", md: "inline-flex" },
          fontWeight: 800,
          justifySelf: "end",
          px: 3,
          textTransform: "none",
          "&:hover": {
            bgcolor: hexToRgba(appearance.accent, 0.12),
            borderColor: appearance.accent,
          },
        }}
        variant="outlined"
      >
        {activeGuild ? t.guilds : activeChannel.type === "whisper" ? t.profile : t.social}
      </Button>
    </Box>
  );
}
