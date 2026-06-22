"use client";

import Link from "next/link";
import { Box, Button, Paper, Typography } from "@mui/material";
import { ChannelHero } from "../components/chat/channel-hero";
import { ChatSidebar } from "../components/chat/chat-sidebar";
import { MessageComposer } from "../components/chat/message-composer";
import { MessageList } from "../components/chat/message-list";
import { OnlinePlayersPanel } from "../components/chat/online-players-panel";
import { useChatPage } from "../hooks/use-chat-page";
import { hexToRgba } from "../lib/chat/appearance";

export default function Home() {
  const chatPage = useChatPage();

  return (
    <Box
      component="main"
      sx={{
        color: "#e5edf7",
        display: "grid",
        gridTemplateColumns: { xs: "1fr", lg: "320px minmax(0, 1fr) 320px" },
        height: "100%",
        overflow: "hidden",
      }}
    >
      <ChatSidebar
        activeChannel={chatPage.activeChannel}
        guilds={chatPage.guilds}
        isAuthenticated={chatPage.isAuthenticated}
        manageableGuilds={chatPage.manageableGuilds}
        onChannelChange={chatPage.setActiveChannel}
        onInviteSelectedPlayer={(guildId) => void chatPage.handleInviteSelectedPlayer(guildId)}
        onPlayerMenuClose={chatPage.handlePlayerMenuClose}
        onPlayerMenuOpen={chatPage.handlePlayerMenuOpen}
        onStartWhisper={chatPage.startWhisper}
        playerMenuAnchor={chatPage.playerMenuAnchor}
        selectedPlayer={chatPage.selectedPlayer}
        t={chatPage.t}
        unreadByChannel={chatPage.unreadByChannel}
        users={chatPage.users}
      />

      <Box
        component="section"
        id="current"
        aria-label={chatPage.activeChannelTitle}
        sx={{
          "--scrollbar-thumb": hexToRgba(chatPage.channelAppearance.accent, 0.52),
          "--scrollbar-thumb-hover": hexToRgba(chatPage.channelAppearance.accent, 0.76),
          "--scrollbar-track": "rgba(2, 8, 18, 0.42)",
          bgcolor: chatPage.channelAppearance.pageBg,
          borderLeft: "1px solid rgba(96, 165, 250, 0.08)",
          borderRight: { lg: "1px solid rgba(96, 165, 250, 0.08)" },
          display: "grid",
          gridColumn: { xs: "1", lg: "2" },
          gridTemplateRows: "auto minmax(0, 1fr) auto",
          minHeight: 0,
          minWidth: 0,
          p: { xs: 2.5, md: 4 },
          rowGap: 2.25,
        }}
      >
        <ChannelHero
          activeChannel={chatPage.activeChannel}
          activeChannelTitle={chatPage.activeChannelTitle}
          activeGuild={chatPage.activeGuild}
          activeWhisperUser={chatPage.activeWhisperUser}
          appearance={chatPage.channelAppearance}
          t={chatPage.t}
        />

        {chatPage.isAuthenticated ? (
          <>
            <MessageList
              account={chatPage.account}
              activeChannel={chatPage.activeChannel}
              appearance={chatPage.channelAppearance}
              connectionError={chatPage.connectionError}
              getMessageChannelLabel={chatPage.getMessageChannelLabel}
              guildError={chatPage.guildError}
              healthError={chatPage.healthError}
              language={chatPage.language}
              messages={chatPage.messages}
              profile={chatPage.profile}
              t={chatPage.t}
              usersError={chatPage.usersError}
            />

            <MessageComposer
              activeChannelType={chatPage.activeChannel.type}
              appearance={chatPage.composeAppearance}
              composeChannel={chatPage.composeChannel}
              connectionStatus={chatPage.connectionStatus}
              draft={chatPage.draft}
              guilds={chatPage.guilds}
              onComposeChannelChange={chatPage.handleComposeChannelChange}
              onDraftChange={chatPage.setDraft}
              onSubmit={chatPage.handleSubmit}
              t={chatPage.t}
              users={chatPage.users}
            />
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
                {chatPage.t.chatLockedTitle}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.55 }}>
                {chatPage.t.chatLockedBody}
              </Typography>
              <Button component={Link} href="/auth" sx={{ mt: 2.5 }} variant="contained">
                {chatPage.t.login}
              </Button>
            </Paper>
          </Box>
        )}
      </Box>

      <OnlinePlayersPanel
        apiStatus={chatPage.apiStatus}
        isApiConnected={chatPage.isApiConnected}
        onPlayerMenuOpen={chatPage.handlePlayerMenuOpen}
        onlineUsers={chatPage.onlineUsers}
        t={chatPage.t}
      />
    </Box>
  );
}
