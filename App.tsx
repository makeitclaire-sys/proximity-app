import { useEffect } from "react"
import * as Linking from "expo-linking"
import RootNavigator from "./navigation/RootNavigator"
import { InteractionProvider } from "./context/InteractionContext"
import { UserProvider } from "./context/UserContext"
import { SignupProvider } from "./context/SignupContext"
import { RoomProvider } from "./context/RoomContext"
import { supabase } from "./lib/supabase"
import { navigationRef } from "./navigation/navigationRef"

function useDeepLinkAuth() {
  useEffect(() => {
    const handle = async (url: string) => {
      const parsed = Linking.parse(url)

      // createURL('reset-password') → proximity://reset-password
      // so "reset-password" lands in hostname, not path
      const segment = parsed.hostname ?? parsed.path ?? ""
      const isRecovery = segment === "reset-password"

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

export default function App() {
  useDeepLinkAuth()

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
