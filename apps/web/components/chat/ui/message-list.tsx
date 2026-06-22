"use client";

import { Alert, Box } from "@mui/material";
import { memo, useEffect, useRef } from "react";
import type { ChannelAppearance } from "../domain/appearance";
import type { UserAccount, UserProfile } from "../../../stores/auth-store";
import type { ChatView, Message } from "../../../stores/chat-store";
import { MessageItem } from "./message-item";

/** Props for the scrollable message timeline and inline status alerts. */
type MessageListProps = {
  /** Current account, used to align and label owned messages. */
  account: UserAccount | null;
  /** Active channel, used to reset scroll position on navigation. */
  activeChannel: ChatView;
  /** Visual tokens for message bubbles in the active channel. */
  appearance: ChannelAppearance;
  /** Latest realtime connection error, if any. */
  connectionError: string | null;
  /**
   * Formats the source channel label for messages in the open view.
   *
   * @param message - Message whose channel should be labeled.
   * @returns Human-readable channel label.
   */
  getMessageChannelLabel: (message: Message) => string;
  guildError: string | null;
  healthError: string | null;
  language: string;
  messages: Message[];
  profile: UserProfile | null;
  t: Record<string, string>;
  usersError: string | null;
};

function MessageListComponent({
  account,
  activeChannel,
  appearance,
  connectionError,
  getMessageChannelLabel,
  guildError,
  healthError,
  language,
  messages,
  profile,
  t,
  usersError,
}: MessageListProps) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const shouldStickToBottomRef = useRef(true);
  const lastMessageId = messages.at(-1)?._id ?? null;

  function scrollToBottom(behavior: ScrollBehavior = "auto") {
    const list = listRef.current;

    if (!list) {
      return;
    }

    list.scrollTo({ behavior, top: list.scrollHeight });
  }

  function handleScroll() {
    const list = listRef.current;

    if (!list) {
      return;
    }

    const distanceFromBottom = list.scrollHeight - list.scrollTop - list.clientHeight;
    shouldStickToBottomRef.current = distanceFromBottom < 96;
  }

  useEffect(() => {
    shouldStickToBottomRef.current = true;
    requestAnimationFrame(() => scrollToBottom());
  }, [activeChannel]);

  useEffect(() => {
    if (shouldStickToBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom("smooth"));
    }
  }, [lastMessageId, messages.length]);

  return (
    <Box
      aria-live="polite"
      aria-atomic="false"
      aria-relevant="additions text"
      onScroll={handleScroll}
      ref={listRef}
      role="log"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.75,
        minHeight: 0,
        overflowY: "auto",
        py: 1.5,
      }}
    >
      {messages.map((message) => (
        <MessageItem
          account={account}
          activeChannel={activeChannel}
          appearance={appearance}
          getMessageChannelLabel={getMessageChannelLabel}
          key={message._id}
          language={language}
          message={message}
          profile={profile}
          t={t}
        />
      ))}

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

      {usersError ? (
        <Alert severity="warning" variant="outlined">
          {usersError}
        </Alert>
      ) : null}

      {guildError ? (
        <Alert severity="warning" variant="outlined">
          {guildError}
        </Alert>
      ) : null}
    </Box>
  );
}

export const MessageList = memo(MessageListComponent);
