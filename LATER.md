# Proximity — LATER

Things we deliberately defer. Add to this file anytime you notice something you'd otherwise be tempted to fix mid-flow.

---

## Deep-link auth in Expo Go

**Issue:** Password reset, email verification, and magic-link login don't work in Expo Go because Expo Go can't handle custom URL schemes (`proximity://`). Tapping any link from a Supabase auth email lands on a blank page.

**Why it's deferred:** The fix requires a development build (`eas build --profile development`), which is Day 10 of the build plan. Until then, test auth with email + password only, and skip "Forgot password" flows.

**The fix when we get there:**
1. Run `eas build --profile development --platform ios` to create a dev client.
2. Install the dev client on your test phone (replaces Expo Go).
3. `proximity://` URLs will then route into the app correctly.
4. Verify Supabase Dashboard → Auth → URL Configuration has `proximity://*` whitelisted.
5. The redirect handler code in `App.tsx` already handles recovery → PasswordSetup routing.

---

## Welcome screen flashes on auto-login

**Issue:** When opening the app with a saved session, the Welcome screen renders for ~50ms before RootNavigator's `onReady` callback redirects to MainTabs. Looks like a flicker.

**Fix:** Render a neutral splash/loading screen as `initialRouteName`, then redirect to either Welcome (no session) or MainTabs (session) once we've checked auth state. This avoids any visible flash.

---

## Email confirmation on signup is disabled

**Issue:** `SignupScreen` calls `supabase.auth.signUp({ email, password })` and immediately navigates to Username without verifying the email. This means anyone can sign up with a fake email.

**Why it's currently fine:** Faster onboarding for closed beta. We trust testers.

**Fix at App Store time:** Enable email confirmation in Supabase Auth settings. Add an EmailVerify screen step between Signup and Username that polls auth state or waits for the deep link. This is part of "App Store launch" work, not TestFlight.

---

## react-native-country-picker-modal removed

We deleted `screens/PhoneEntry.tsx`, `screens/CodeScreen.tsx`, `components/CountryPickerModal.tsx`, `data/countries.ts`, and the `react-native-country-picker-modal` dep. If we ever bring back phone signup, build a fresh country picker — the old one expected React 16 and conflicts with React 19.

---

## Messages INSERT RLS is too permissive for App Store

**Issue:** Current INSERT policy on `messages` lets any authed user send to any user. The app enforces "must have accepted connection" at the UI layer only — a determined user with their auth token could bypass it and spam strangers.

**Why it's currently fine:** TestFlight beta is closed (people you know). UI-layer enforcement is good enough.

**Fix before App Store launch:**
Replace the INSERT policy with one that EXISTS-checks an accepted connection in either direction between sender and receiver. Outline:

```sql
DROP POLICY "send own messages" ON messages;
CREATE POLICY "send to accepted contacts only" ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM connections
      WHERE status = 'accepted'
        AND (
          (sender_id = auth.uid() AND receiver_id = messages.receiver_id)
          OR (receiver_id = auth.uid() AND sender_id = messages.receiver_id)
        )
    )
  );
```

---

## Connections unique constraint should include `mode`

**Issue:** Current unique constraint on `connections` is `(sender_id, receiver_id)`. Once a user has both Social and Pro modes unlocked, sending a Pro hi to the same person they already sent a Social hi to would overwrite the Social connection (because the upsert conflict key matches the constraint).

**Why it's currently fine:** Most users won't have both modes unlocked. Rare to hit in practice.

**Fix:** Change the unique constraint to `(sender_id, receiver_id, mode)`. Update the upsert `onConflict` key in `services/connectionService.ts`. Also update `getConnectionWith()` to take a mode parameter — call sites in ChatScreen need to know which mode's connection to fetch.

---

## Mode toggle in Discover for cross-mode browsing (V2)

Currently social users see social nearby people and pro users see pro. A user with both modes unlocked has to switch modes to browse the other list. V2 consideration: a combined view or a quick toggle in the people-nearby header.

---

## Map view of nearby rooms (V2)

Show open rooms on a small map view in JoinRoomScreen instead of (or alongside) the list. Useful at large events.

---

## Auto-disable "I'm available" on app uninstall

When a user uninstalls the app, their is_available flag stays true in the DB until available_until expires (max 4h). No fix needed for beta. For App Store: investigate push token revocation as a signal to clear availability, or add a server-side cron that sweeps expired rows.

---

## Avatar bucket DELETE policy too permissive

Current policy "Allow avatar deletes" lets any authenticated user delete any avatar in the bucket. Before App Store launch:

```sql
drop policy if exists "Allow avatar deletes" on storage.objects;
create policy "delete own avatar"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and auth.role() = 'authenticated'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
```

---

## Social mode friction with required rooms — validate during beta

**Issue:** Current MVP requires every Discover view to be scoped to a room you've joined. Professional mode benefits clearly (events, dinners, conferences are naturally room-shaped). Social mode is less obvious — a person at a coffee shop has no host to set up a room.

**Why it's still the right MVP choice:**
- Privacy discipline: visibility is always a deliberate opt-in. Without rooms, Proximity drifts toward Happn/Tinder Nearby — the exact pattern the design plan rejects.
- Spam prevention: a stranger can't ping you unless you've both joined the same room.
- Brand alignment: "presence is temporary", "leave the room anytime", "in this room now" only mean something if rooms are the unit.

**Watch for during beta:**
- Do Social mode users actually create or join rooms, or do they bounce off the empty state?
- Median rooms-joined per Social user in the first week. Target: ≥1 per session.

**If Social users skip rooms:**
The V2 evolution path (do **not** ship in V1):
1. **Implicit/standing rooms** — Proximity creates standing rooms for natural contexts: neighborhoods ("Williamsburg Tonight"), recurring venues, recurring meetups. Users join with one tap, no code-hunting. Same opt-in discipline, way lower friction.
2. **Personal "I'm out" status** — a lightweight presence signal ("available to meet for the next 2 hours") that surfaces you to friends-of-friends only, not strangers. Adjacent to rooms, not a replacement.
3. Keep rooms required for Professional contexts (where curation matters most).

**Mistake to avoid:** splitting Social and Professional into fundamentally different products. Doubles design surface, codebase, testing. Loses the clean "one app, two modes" pitch.
