# 0003: Message Retention

## Status

Accepted.

## Context

Dworven Shaft is intended to feel like a dynamic MMO-style chat, not a long-term Slack archive.

## Decision

Keep message history intentionally small:

- Global channel: 200 messages.
- Each guild channel: 200 messages.
- Each whisper conversation: 100 messages.
- Open chat feed: latest 200 visible messages.
- Maximum message age: 30 days.

MongoDB also uses a TTL index on message creation time.

## Consequences

- Normal list rendering is acceptable for chat timelines.
- Old messages are not a product guarantee.
- Storage growth stays bounded.
