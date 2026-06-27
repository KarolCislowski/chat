"use client";

import Link from "next/link";
import { Box, Button, Chip, Typography } from "@mui/material";
import { resolveAvatarPath } from "../../../lib/avatar-options";
import { ChannelAppearance, hexToRgba } from "../domain/appearance";
import { resolveGuildBackgroundUrl, resolveGuildEmblemUrl } from "../../../lib/guild-flags";
import type { ChatView } from "../../../stores/chat-store";
import type { Guild } from "../../../stores/guild-store";
import type { ChatUser } from "../../../stores/user-store";

/** Fully resolved visual content for the channel hero. */
export type ChannelHeroPresentation = {
  actionHref: string | null;
  actionLabel: string | null;
  avatarUrl: string;
  backgroundUrl: string;
  eyebrow: string;
  isGuild: boolean;
};

type ChannelHeroContext = {
  activeChannel: ChatView;
  activeGuild: Guild | null;
  activeWhisperUser: ChatUser | null;
  appearance: ChannelAppearance;
  t: Record<string, string>;
};

/**
 * Resolves image assets, labels, and target links for the active channel hero.
 *
 * @param context - Active channel, optional entity data, appearance tokens, and translations.
 * @returns Presentation data ready for hero subcomponents.
 */
export function getChannelHeroPresentation({ activeChannel, activeGuild, activeWhisperUser, appearance, t }: ChannelHeroContext): ChannelHeroPresentation {
  if (activeGuild) {
    return {
      actionHref: "/guilds",
      actionLabel: t.guilds,
      avatarUrl: resolveGuildEmblemUrl(activeGuild.emblemUrl, activeGuild.themeColor),
      backgroundUrl: resolveGuildBackgroundUrl(activeGuild.backgroundUrl),
      eyebrow: t.guilds,
      isGuild: true,
    };
  }

  if (activeChannel.type === "open") {
    return {
      actionHref: null,
      actionLabel: null,
      avatarUrl: "/assets/imgs/open_avatar.png",
      backgroundUrl: "/assets/imgs/open-bg.png",
      eyebrow: appearance.label,
      isGuild: false,
    };
  }

  if (activeChannel.type === "whisper") {
    return {
      actionHref: `/profile/${activeChannel.recipientId}`,
      actionLabel: t.profile,
      avatarUrl: resolveAvatarPath(activeWhisperUser?.avatarUrl),
      backgroundUrl: "/assets/imgs/whisper-bg.png",
      eyebrow: appearance.label,
      isGuild: false,
    };
  }

  return {
    actionHref: null,
    actionLabel: null,
    avatarUrl: "/assets/imgs/global_avatar.png",
    backgroundUrl: "/assets/imgs/global-bg.png",
    eyebrow: appearance.label,
    isGuild: false,
  };
}

/** Props for the hero avatar or guild banner image. */
type ChannelHeroAvatarProps = {
  appearance: ChannelAppearance;
  presentation: ChannelHeroPresentation;
};

export function ChannelHeroAvatar({ appearance, presentation }: ChannelHeroAvatarProps) {
  return (
    <Box
      component="img"
      alt=""
      src={presentation.avatarUrl}
      sx={{
        alignSelf: "center",
        borderRadius: presentation.isGuild ? 0 : "50%",
        filter: presentation.isGuild ? "drop-shadow(0 16px 24px rgba(0, 0, 0, 0.54))" : "drop-shadow(0 14px 20px rgba(0, 0, 0, 0.48))",
        height: presentation.isGuild ? "100%" : { xs: 70, md: 92 },
        maxHeight: presentation.isGuild ? { xs: 195, md: 246 } : undefined,
        objectFit: presentation.isGuild ? "contain" : "cover",
        width: presentation.isGuild ? { xs: 70, md: 108 } : { xs: 70, md: 92 },
      }}
    />
  );
}

type ChannelHeroContentProps = {
  activeChannel: ChatView;
  activeChannelTitle: string;
  activeGuild: Guild | null;
  activeWhisperUser: ChatUser | null;
  appearance: ChannelAppearance;
  presentation: ChannelHeroPresentation;
  t: Record<string, string>;
};

export function ChannelHeroContent({
  activeChannel,
  activeChannelTitle,
  activeGuild,
  activeWhisperUser,
  appearance,
  presentation,
  t,
}: ChannelHeroContentProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ color: appearance.accent, fontSize: "0.72rem", fontWeight: 800, letterSpacing: 1.4, textTransform: "uppercase" }}>
        {presentation.eyebrow}
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
            <Chip label={`${activeGuild.members.length} ${t.members}`} size="small" sx={{ bgcolor: hexToRgba(appearance.accent, 0.18), color: "#f8fbff", fontWeight: 800 }} />
            <Chip label={`/${activeGuild.slug}`} size="small" sx={{ bgcolor: "rgba(2, 8, 18, 0.42)", color: "#bfdbfe", fontWeight: 700 }} />
          </>
        ) : activeChannel.type === "whisper" ? (
          <Chip label={activeWhisperUser?.onlineStatus ?? t.offline} size="small" sx={{ bgcolor: "rgba(2, 8, 18, 0.42)", color: appearance.accent, fontWeight: 800 }} />
        ) : null}
      </Box>
    </Box>
  );
}

type ChannelHeroActionProps = {
  appearance: ChannelAppearance;
  presentation: ChannelHeroPresentation;
};

export function ChannelHeroAction({ appearance, presentation }: ChannelHeroActionProps) {
  if (!presentation.actionHref || !presentation.actionLabel) {
    return null;
  }

  return (
    <Button
      component={Link}
      href={presentation.actionHref}
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
      {presentation.actionLabel}
    </Button>
  );
}
