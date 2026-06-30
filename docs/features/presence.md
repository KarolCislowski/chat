# Presence and Typing

Presence and typing are realtime-only features.

## Online and Offline

The API tracks active sockets per account.

- First active socket: user becomes online.
- Last active socket disconnects: user becomes offline.

The web app updates:

- online users list,
- message author status dots,
- profile status labels,
- optional login/logout system notices.

## Typing Indicators

Typing indicators are channel-scoped and transient.

The web app:

- sends `typing:changed` with `isTyping: true` when a draft is active,
- sends `isTyping: false` after inactivity, channel changes, or message send,
- removes remote indicators after a timeout if a stop event is missed.

The API:

- validates typing payloads,
- checks guild membership for guild typing events,
- relays to the correct room,
- does not persist typing state.
