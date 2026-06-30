# Profiles

Profiles represent public chat identity and user preferences.

## Editable Fields

- display name
- status message
- online status preference
- UI language
- avatar from bundled avatar assets

Avatar selection is intentionally separate from the rest of the profile form and uses a modal picker.

## Public Profile View

Profiles can be previewed by account ID. If the viewed profile belongs to the signed-in user, the UI offers an edit action. Other profiles are read-only.

## Avatar System

Avatars are selected from `apps/web/public/assets/imgs/avatars`. The profile stores a bundled asset path rather than an arbitrary URL.
