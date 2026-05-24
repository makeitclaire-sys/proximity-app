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
