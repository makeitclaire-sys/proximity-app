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
      const code = parsed.queryParams?.code
      if (!code || typeof code !== "string") return

      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) {
        console.warn("Auth code exchange failed:", error.message)
        return
      }

      if (!navigationRef.isReady()) return

      // Path tells us which flow we're in. "reset-password" comes from
      // resetPasswordForEmail; anything else is a normal login/verify.
      const isRecovery = parsed.path === "reset-password"
      if (isRecovery) {
        navigationRef.reset({
          index: 0,
          routes: [{ name: 'PasswordSetup', params: { mode: 'reset' } }],
        })
      } else {
        navigationRef.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
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
