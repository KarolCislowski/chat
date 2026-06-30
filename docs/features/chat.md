# Chat

Chat supports several channel types:

- `open`: aggregate listening view across visible channels.
- `global`: shared global room.
- `guild`: guild-specific room.
- `whisper`: private conversation between two users.

## Message Shape

```ts
Message {
  _id: string;
  senderId: string;
  channelType: "global" | "guild" | "whisper";
  guildId?: string | null;
  recipientId?: string | null;
  conversationId?: string | null;
  content: string;
  createdAt: string;
  editedAt?: string | null;
  deletedAt?: string | null;
}
```

## Rendering

The timeline currently renders as a normal list, not a virtualized list. This is acceptable because message retention caps keep each channel small.

## Open Chat

Open chat combines messages from channels visible to the current user. It also exposes a compose destination selector so the user can choose where a new message should be sent.

## System Notices

Login/logout notices are UI-only events. They are rendered in the timeline but are not persisted and do not increment unread counters.
