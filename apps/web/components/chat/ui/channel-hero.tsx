import { Box } from "@mui/material";
import type { ChannelAppearance } from "../domain/appearance";
import type { ChatView } from "../../../stores/chat-store";
import type { Guild } from "../../../stores/guild-store";
import type { ChatUser } from "../../../stores/user-store";
import { ChannelHeroAction, ChannelHeroAvatar, ChannelHeroContent, getChannelHeroPresentation } from "./channel-hero-parts";

type ChannelHeroProps = {
  activeChannel: ChatView;
  activeChannelTitle: string;
  activeGuild: Guild | null;
  activeWhisperUser: ChatUser | null;
  appearance: ChannelAppearance;
  t: Record<string, string>;
};

export function ChannelHero({ activeChannel, activeChannelTitle, activeGuild, activeWhisperUser, appearance, t }: ChannelHeroProps) {
  const presentation = getChannelHeroPresentation({ activeChannel, activeGuild, activeWhisperUser, appearance, t });

  return (
    <Box
      component="section"
      sx={{
        alignItems: "center",
        backgroundImage: `linear-gradient(90deg, rgba(3, 10, 20, 0.9) 0%, rgba(3, 10, 20, 0.58) 52%, rgba(3, 10, 20, 0.22) 100%), url(${presentation.backgroundUrl})`,
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
      <ChannelHeroAvatar appearance={appearance} presentation={presentation} />
      <ChannelHeroContent
        activeChannel={activeChannel}
        activeChannelTitle={activeChannelTitle}
        activeGuild={activeGuild}
        activeWhisperUser={activeWhisperUser}
        appearance={appearance}
        presentation={presentation}
        t={t}
      />
      <ChannelHeroAction appearance={appearance} presentation={presentation} />
    </Box>
  );
}
