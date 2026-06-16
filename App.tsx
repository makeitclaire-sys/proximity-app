import { useEffect, useRef } from "react"
import { AppState } from "react-native"
import * as Linking from "expo-linking"
import RootNavigator from "./navigation/RootNavigator"
import { InteractionProvider } from "./context/InteractionContext"
import { UserProvider } from "./context/UserContext"
import { SignupProvider } from "./context/SignupContext"
import { RoomProvider } from "./context/RoomContext"
import { supabase } from "./lib/supabase"
import { navigationRef } from "./navigation/navigationRef"
import { joinRoom as svcJoin } from "./services/roomService"
import { updateLocationPing } from "./services/profileService"
import { getCurrentCoarseLocation } from "./lib/location"

function useDeepLinkAuth() {
  useEffect(() => {
    const handle = async (url: string) => {
      const parsed = Linking.parse(url)

      // createURL('reset-password') → proximity://reset-password
      // so "reset-password" lands in hostname, not path
      const segment = parsed.hostname ?? parsed.path ?? ""
      const isRecovery = segment === "reset-password"

      // proximity://join/ABCDEF — auto-join the room
      if (segment === "join") {
        const roomCode = parsed.path?.replace(/^\//, "").toUpperCase()
        if (roomCode && roomCode.length === 6) {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            if (navigationRef.isReady()) {
              navigationRef.reset({ index: 0, routes: [{ name: "Welcome" }] })
            }
            return
          }
          try {
            await svcJoin(roomCode, session.user.id)
          } catch {
            // room not found — just navigate to main, user can join manually
          }
          if (navigationRef.isReady()) {
            navigationRef.reset({ index: 0, routes: [{ name: "MainTabs" }] })
          }
        }
        return
      }

      // PKCE flow — Supabase redirects with ?code=XXX
      const code = parsed.queryParams?.code
      if (code && typeof code === "string") {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) {
          console.warn("Auth code exchange failed:", error.message)
          // Navigate to Welcome so the user isn't left on a blank screen
          if (navigationRef.isReady()) {
            navigationRef.reset({ index: 0, routes: [{ name: "Welcome" }] })
          }
          return
        }
        if (!navigationRef.isReady()) return
        navigationRef.reset({
          index: 0,
          routes: [isRecovery
            ? { name: "PasswordSetup", params: { mode: "reset" } }
            : { name: "MainTabs" }
          ],
        })
        return
      }

      // Legacy token hash flow — #access_token=...&refresh_token=...&type=recovery
      const fragment = url.split("#")[1] ?? ""
      if (fragment) {
        const hashParams = Object.fromEntries(new URLSearchParams(fragment))
        const { access_token, refresh_token, type } = hashParams
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token })
          if (error) {
            console.warn("Auth session from hash failed:", error.message)
            return
          }
          if (!navigationRef.isReady()) return
          const isHashRecovery = type === "recovery" || isRecovery
          navigationRef.reset({
            index: 0,
            routes: [isHashRecovery
              ? { name: "PasswordSetup", params: { mode: "reset" } }
              : { name: "MainTabs" }
            ],
          })
        }
      }
    }

    Linking.getInitialURL().then(url => { if (url) handle(url) })
    const sub = Linking.addEventListener("url", ({ url }) => handle(url))
    return () => sub.remove()
  }, [])
}

function useBackgroundLocationRefresh() {
  const bgTimestamp = useRef<number | null>(null)

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      if (nextState === "background" || nextState === "inactive") {
        bgTimestamp.current = Date.now()
      } else if (nextState === "active" && bgTimestamp.current !== null) {
        const elapsed = Date.now() - bgTimestamp.current
        bgTimestamp.current = null
        if (elapsed > 15 * 60 * 1000) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            const coords = await getCurrentCoarseLocation()
            if (coords) {
              updateLocationPing(session.user.id, coords.lat, coords.lng).catch(() => {})
            }
          }
        }
      }
    })
    return () => sub.remove()
  }, [])
}

export default function App() {
  useDeepLinkAuth()
  useBackgroundLocationRefresh()

  return (
    <UserProvider>
      <SignupProvider>
        <InteractionProvider>
          <RoomProvider>
            <RootNavigator />
          </RoomProvider>
        </InteractionProvider>
      </SignupProvider>
    </UserProvider>
  )
}
