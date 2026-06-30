# Data Model

This page summarizes the main persisted models. Source of truth is the Mongoose schemas in `apps/api/src`.

## UserAccount

Represents credentials and account-level metadata.

Key fields:

- email
- password hash
- refresh token hashes
- role
- createdAt / updatedAt

## UserProfile

Represents public chat identity and preferences.

Key fields:

- accountId
- displayName
- avatarUrl
- statusMessage
- onlineStatus
- language

## Message

Represents persisted chat content.

Key fields:

- senderId
- channelType: `global | guild | whisper`
- guildId
- recipientId
- conversationId
- content
- createdAt
- editedAt
- deletedAt

Transient events such as presence changes and typing indicators are not `Message` documents.

## Guild

Represents a social group.

Key fields:

- name
- slug
- ownerId
- members
- inviteCodes
- themeColor
- emblemUrl
- backgroundUrl
- createdAt

## GuildMembership

Represents a user's relationship to a guild.

Key fields:

- userId
- guildId
- role: `owner | officer | member`
- joinedAt

## GuildJoinRequest

Represents a request to join a guild.

Key fields:

- userId
- guildId
- status
- decision metadata
