# CLAUDE.md — Proximity project context

Read this file in full at the start of every session. It is the single source of truth for where the project is. Update it at the end of every work session.

---

## What Proximity is

Mobile app (iOS first, then Android) for "meeting the people in the room" — presence-based introductions at events, coworking spaces, dinners, conferences, campuses. Brand is editorial, warm, minimalist, quietly confident. **Not** a dating app, **not** a feed.

Full product plan: `outputs/PROXIMITY_14_DAY_PLAN.md` (copy into repo if you want it tracked).
Full design plan: `outputs/PROXIMITY_PLAN.md` (13-section product & design doc).
High-fidelity mockups: `outputs/proximity_mockups.html`.
Brand symbol: `outputs/proximity_symbol.svg`.

## Tech stack

| Layer | Library / Version |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81 |
| Language | TypeScript 5.9 |
| Navigation | React Navigation 7 (native stack + bottom tabs) |
| Backend | Supabase JS v2 (auth, postgres, storage, realtime) |
| Safe area | react-native-safe-area-context 5.6 |
| Image picker | expo-image-picker 17 |
| Camera | expo-camera 17 |
| Deep links | expo-linking |

Repo: https://github.com/makeitclaire-sys/proximity-app

## Build plan — where we are

Target: TestFlight beta with 10–20 testers in 14 days. Cadence: 4–6 hrs/day.

| Phase | Days | Status |
|---|---|---|
| 1. Foundation fixes | 1–2 | ✅ Complete (compressed to Day 1) |
| 2. Realtime chat + visibility | 3–4 | ✅ Complete (compressed) |
| 3. Minimal rooms | 5–7 | ✅ Complete — schema, service layer, CreateRoom + JoinRoom screens, Discover gate, room-scoped filtering, leave-room flow |
| 4. Block/report + polish | 8–9 | ⏳ Pending |
| 5. TestFlight build #1 | 10–11 | ⏳ Pending |
| 6. Iterate + TestFlight #2 | 12–14 | ⏳ Pending |

## What's built end-to-end

- **Auth.** Real Supabase magic-link auth via `App.tsx` deep-link handler. Email + password signup/login. Recovery flow code is wired but blocked by Expo Go (see deferred section).
- **Profiles.** Create, edit, photo upload to Supabase storage (`avatars` bucket).
- **Modes.** Social (magenta `#FF2D87`) and Professional (cobalt `#4F46E5`). Stored as `profiles.mode`. Connections filter by mode. UI accents follow mode.
- **Paywall.** PaywallScreen unlocks `profiles.has_pro_mode = true`. Stripe stub — no real payment yet.
- **Connections.** Hi/chat requests with sender/receiver/type/status/mode. Accept/decline. Pending/sent/accepted lists, filtered by mode.
- **Messages.** Realtime messages table with INSERT subscription. ChatScreen wired with optimistic sends. MessagesScreen lists conversations.
- **Visibility.** Toggle in MyProfile writes `profiles.is_visible`. Discover filters out invisible users.
- **Rooms (data layer).** `rooms` and `room_members` tables exist with RLS. `roomService.ts` has createRoom, joinRoom, leaveRoom, closeRoom, getCurrentRoom, getRoomMembers. `RoomContext` exposes `useRoom()`.
- **Rooms (UI — Days 6–7).** `CreateRoomScreen` and `JoinRoomScreen` wired into `RootNavigator`. Discover gates on `useRoom().room`: no room → "Create a room" / "Join with a code" empty state; in a room → room banner (name + live dot + Leave button) + people list filtered to current room members only (`memberIds.has(p.id)`). Leaving resets context and snaps back to the gate automatically.

## Database schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | **Always use this. Never numeric_id.** Matches `auth.users.id`. |
| `name` | text | |
| `age` | int | |
| `bio` | text | |
| `email` | text | |
| `status` | text | |
| `mode` | text | "social" / "professional" |
| `is_visible` | bool | |
| `has_pro_mode` | bool | default false |
| `interests` | text[] | |
| `talk_topics` | text[] | |
| `avoid_topics` | text[] | |
| `conversation_starters` | text[] | |
| `avatar_url` | text | |
| `blocked_user_ids` | uuid[] | for block list (planned Day 8) |

### `connections`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `sender_id` | uuid | FK → profiles.id |
| `receiver_id` | uuid | FK → profiles.id |
| `type` | text | "hi" / "chat" |
| `status` | text | "pending" / "accepted" / "declined" |
| `mode` | text | "social" / "professional", default 'social' |
| `created_at` | timestamptz | |

Unique constraint: `(sender_id, receiver_id)`. **Known issue:** should be `(sender_id, receiver_id, mode)` so social and pro connections are independent. See LATER.md.

### `messages`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `sender_id` | uuid | FK → profiles.id ON DELETE CASCADE |
| `receiver_id` | uuid | FK → profiles.id ON DELETE CASCADE |
| `text` | text | |
| `created_at` | timestamptz | default now() |

Index: `(sender_id, receiver_id, created_at)`. In realtime publication.

### `rooms`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `name` | text | |
| `code` | text UNIQUE | 6 chars, shared with guests |
| `host_id` | uuid | FK → profiles.id |
| `created_at` | timestamptz | |
| `ends_at` | timestamptz | nullable |
| `closed_at` | timestamptz | nullable |

### `room_members`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `room_id` | uuid | FK → rooms.id ON DELETE CASCADE |
| `user_id` | uuid | FK → profiles.id |
| `joined_at` | timestamptz | |
| `left_at` | timestamptz | nullable — soft delete pattern |

Unique: `(room_id, user_id)`. Active members: `WHERE left_at IS NULL`.

### RLS posture

- All tables have RLS enabled.
- Profiles: users read/update their own row; authed users read all profiles (for Discover).
- Connections: users see rows where they're sender or receiver; insert where sender_id = auth.uid().
- Messages: users see rows where they're sender or receiver; insert where sender_id = auth.uid(). **App-level enforces "must be accepted connection" — RLS does not. Tighten before App Store launch. See LATER.md.**
- Rooms: authed users read; hosts insert/update their own.
- Room members: authed users read; users insert/update their own membership.

## File map

```
App.tsx                         — root, deep-link auth handler, providers
index.ts                        — entry point
app.json                        — Expo config, scheme: "proximity"
lib/supabase.ts                 — Supabase client init

navigation/
  RootNavigator.tsx             — native stack
  MainTabNavigator.tsx          — bottom tabs (Discover, Connections, Messages, MyProfile)
  navigationRef.ts              — imperative nav from outside React tree
  types.ts                      — RootStackParamList + TabParamList

context/
  UserContext.tsx               — current user profile, refreshProfile(), profileLoaded
  InteractionContext.tsx        — local hi/chat/hide state
  SignupContext.tsx             — accumulator for multi-step signup
  RoomContext.tsx               — current room, useRoom()

services/
  profileService.ts             — getProfiles, getProfileById, createProfile, updateProfile, uploadAvatar, getEmailByUsername
  connectionService.ts          — createConnection, getConnections, getConnectionWith, updateConnectionStatus
  messageService.ts             — sendMessage, getMessages, subscribeToConversation
  roomService.ts                — createRoom, joinRoom, leaveRoom, getCurrentRoom, getRoomMembers

screens/
  Welcome, Signup, Login, LoginCode, EmailVerify, PasswordSetup    (auth flow)
  Username, Birthday, Selfie, ModePicker, Basics, Done             (signup steps)
  Discover, Connections, Messages, MyProfile                       (main tabs)
  ProfileDetail, EditProfile, Chat, Paywall                        (overlays)
  CreateRoom, JoinRoom                                             (room entry)

constants/
  modes.ts                      — SOCIAL_COLOR, PRO_COLOR

data/
  mockPeople.ts                 — Person type definition (kept for type-only imports; mock data not used)
```

## Conventions

- **All IDs are UUID strings.** Never `numeric_id`. `Person.id`, `Connection.senderId`, `Conn.receiverId`, `Room.id` etc. are all strings.
- **Use `profile.supabaseId`** when calling services — it's the auth user UUID.
- **Soft-delete pattern** for ephemeral data (room_members.left_at). Don't hard-delete.
- **Optimistic UI** on user actions (createConnection, sendMessage). Roll back state on error.
- **Commit messages** use conventional commits: `feat(scope):`, `fix(scope):`, `chore:`, with a body explaining what & why for non-trivial changes.
- **Brand voice in copy:** lowercase headings, direct, calm. No exclamation marks. No "vibe," "tribe," "bestie," "match," "swipe." Good: "say hello," "open to conversation," "in this room."
- **Color discipline:** background is off-white #FAFAFB on ink #12101C. Magenta and cobalt are mode accents only. Lime (#D9F65C) reserved for live indicator. Mint (#06D6A0) reserved for verified.

## Things to never do

1. Reintroduce mockPeople data into Discover. Always load from Supabase.
2. Reference `numeric_id` — does not exist.
3. Restore the old phone signup path. It was removed (used React 16 country picker that conflicted with React 19). Email-only signup.
4. Add `localStorage` or browser storage APIs. Not supported in React Native.
5. Skip the two-device test after any messaging or realtime change.
6. Hardcode user IDs anywhere. Use the auth session.

## Deferred items (LATER.md)

Live in `LATER.md` in the repo. Quick list:
- Password reset blocked by Expo Go (fix when we have dev client, Day 10).
- Welcome screen flashes briefly on auto-login.
- Email confirmation on signup currently disabled.
- Messages INSERT RLS is permissive (tighten before App Store).
- Connections unique constraint should include `mode`.

## How to test changes

Two-device test for realtime / messaging / room membership: open the app on two phones (or simulator + phone) signed in as different users. Action on phone A should appear on phone B within ~1 second without manual refresh. **No other test replaces this for realtime features.**

For data layer changes, prefer SQL verification in Supabase Dashboard before building UI:
```sql
SELECT * FROM <table> WHERE <condition> ORDER BY created_at DESC LIMIT 5;
```

## Session end ritual

At the end of every working session:
1. `git status` — anything uncommitted should be either committed or stashed deliberately.
2. `git push` — back to origin.
3. **Update this CLAUDE.md** — what was done this session, what's next, what new deferred items.
4. Update the phase table at the top if a phase progressed.

---

*Last updated: end of Day 7. Phase 3 (Minimal rooms) complete. Phase 4 next: block/report + polish (Days 8–9).*
