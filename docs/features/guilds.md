# Guilds

Guilds are social groups with their own chat channels and appearance.

## Rules

- A user can belong to at most 3 guilds.
- Each guild has one owner.
- Roles are `owner`, `officer`, and `member`.
- Owners can manage member roles and remove members.
- Owners and officers can manage appearance and join requests.

## Join Flow

The preferred flow is request-based:

1. User views available guilds.
2. User requests to join.
3. Guild owner or officer accepts the request.
4. Membership is created if the user still has capacity.

Legacy invite-code endpoints still exist in the API.

## Appearance

Guild appearance includes:

- theme color,
- emblem from bundled flag assets,
- hero background from bundled guild backgrounds.

Guild theme color also influences guild chat styling.
