# Proximity — Project Context

## Tech Stack

| Layer | Library / Version |
|---|---|
| Framework | Expo SDK 54 / React Native 0.81 |
| Language | TypeScript 5.9 |
| Navigation | React Navigation 7 (native stack + bottom tabs) |
| Backend | Supabase JS v2 |
| Safe area | react-native-safe-area-context 5.6 |
| Image picker | expo-image-picker 17 |
| Camera | expo-camera 17 |

---

## Navigation Structure

```
RootNavigator (native stack)
├── Signup flow (linear, no auth yet)
│   Welcome → Phone → Code → Username → Birthday → Selfie → ModePicker → Basics → Done
└── MainTabs (bottom tabs)
    ├── Discover
    ├── Connections
    ├── Messages
    └── MyProfile
    
Stack overlays (push on top of tabs):
    ProfileDetail  { personId: string; profile?: Person }
    EditProfile
    Chat           { personId: string; name: string }
```

---

## Supabase Schema

### `profiles` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | **Always use this. Never numeric_id.** |
| `name` | text | |
| `age` | int | |
| `bio` | text | |
| `status` | text | e.g. "New in town" |
| `distance` | text | e.g. "in this room" |
| `mode` | text | "social" \| "professional" |
| `is_visible` | bool | |
| `interests` | text[] | |
| `talk_topics` | text[] | |
| `avoid_topics` | text[] | |
| `conversation_starters` | text[] | |
| `avatar_url` | text | Public URL from Supabase Storage |

### `connections` table

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `sender_id` | uuid | FK → profiles.id |
| `receiver_id` | uuid | FK → profiles.id |
| `type` | text | "hi" \| "chat" |
| `status` | text | "pending" \| "accepted" \| "declined" |
| `created_at` | timestamptz | |

Unique constraint: `(sender_id, receiver_id)` — used for upsert idempotency.

### Supabase Storage

Bucket: `avatars` (public)  
Path pattern: `avatars/{profiles.id}.jpg`  
Upload requires anon insert policy on the bucket.

---

## Current User

No auth implemented yet. Current user is hardcoded in `UserContext`:

```ts
const CLAIRE_ID = "8c785cf7-3095-4ff8-9117-87c8c7f27102"
```

`UserContext` fetches this profile from Supabase on app mount via `getProfileById(CLAIRE_ID)` and exposes it as `profile`. A `profileLoaded: boolean` flag tracks whether the fetch has completed.

---

## Key Files

```
context/
  UserContext.tsx        — current user profile state, refreshProfile(), profileLoaded flag
  InteractionContext.tsx — local hi/chat/hide state (string IDs, no Supabase)

services/
  profileService.ts      — getProfiles, getProfileById, updateProfile, uploadAvatar
  connectionService.ts   — createConnection, getConnections, getConnectionWith, updateConnectionStatus

data/
  mockPeople.ts          — Person type definition + local mock data (do not use in Discover)

navigation/
  RootNavigator.tsx      — stack navigator, RootStackParamList
  MainTabNavigator.tsx   — bottom tab navigator
```

---

## Data Flow

### Discover
- Calls `getProfiles()` → `select("*")` from `profiles` table
- Populates `supabaseProfilesCache` (Map<string, Person>) as a side effect
- Tapping a card navigates to `ProfileDetail` with the full `Person` object in params

### MyProfile
- `UserContext` fetches `getProfileById(CLAIRE_ID)` on mount
- `MyProfileScreen` reads directly from `useUser().profile`
- Shows DEFAULT_PROFILE ("Alex T.") only while `profileLoaded === false` or if fetch fails

### ProfileDetail
- Reads `route.params.profile` first (passed from Discover)
- Falls back to `supabaseProfilesCache.get(personId)` if profile not in params
- "Come say hi" / "Let's chat" calls `createConnection(myId, person.id, type)`

### EditProfile
- Waits for `profileLoaded === true` before initialising form fields
- Save calls `updateProfile(supabaseId, { name, bio, ... })` → `.update().eq("id", id)`
- After save calls `refreshProfile()` so MyProfileScreen reflects the change immediately

### Avatar upload
1. `expo-image-picker` → local URI
2. `fetch(uri).arrayBuffer()` → ArrayBuffer
3. `supabase.storage.from("avatars").upload("avatars/{id}.jpg", arrayBuffer, { upsert: true })`
4. `getPublicUrl(path)` → public URL saved to `profiles.avatar_url` and `UserContext`

### Connections
- `getConnections(myId)` → `.or("sender_id.eq.X,receiver_id.eq.X")`
- Groups into: received pending / sent pending / accepted
- Accept/decline calls `updateConnectionStatus(id, status)`
- Reloads on tab focus via `useFocusEffect`

### Chat
- Placeholder UI only (no real-time messages yet)
- Loads `getConnectionWith(myId, personId)` to detect pending status
- Shows amber banner if connection is pending and current user is the sender

---

## ID Rules

- **All IDs are UUID strings** (`profiles.id`, `connections.sender_id`, `connections.receiver_id`)
- **`Person.id: string`** — the Supabase UUID is used directly
- **`Connection.senderId / receiverId: string`** — UUIDs
- **`InteractionContext`** stores `string[]` for hiRequests, chatRequests, hiddenUsers
- **Navigation params** `personId: string`, `Chat.personId: string`

---

## IMPORTANT RULES

1. **Always use `profiles.id` (UUID string).** Never reference `numeric_id` — it does not exist.
2. **Do not reintroduce `mockPeople` into Discover.** Discover loads from Supabase only.
3. **Do not use numbers for any user or profile ID.**
4. **Do not rewrite unrelated files** when fixing a targeted bug.
5. **`getProfileById` must `select("*")`** to include `avatar_url`.
6. **After `updateProfile` in profileService, the cache entry is deleted** — next read hits Supabase fresh.

---

## Known Issues

- **MyProfile falls back to DEFAULT_PROFILE** if `getProfileById` returns null. Root causes: Supabase RLS blocking anon reads, UUID not present in the table, or network failure. Console logs `PROFILE LOAD ERROR` when this happens.
- **`avatar_url` not reflected in UserContext** if the profiles row has `avatar_url` set but the fetch fails before merging. Workaround: save avatar via EditProfile, which calls `refreshProfile()` after upload.
- **Connection creation fails silently** if `supabaseId` in UserContext is wrong or the row doesn't exist in `profiles`. No auth means no server-side identity validation.
- **EditProfile form shows empty fields briefly** on first open (spinner shown until `profileLoaded === true`).
- **No real-time messaging** — ChatScreen is a local-state placeholder. Messages do not persist.
- **Signup flow is UI-only** — no Supabase writes on signup yet; user lands on MainTabs with the hardcoded CLAIRE_ID profile.
