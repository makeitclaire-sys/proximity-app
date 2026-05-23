import { useEffect } from "react"
import * as Linking from "expo-linking"
import RootNavigator from "./navigation/RootNavigator"
import { InteractionProvider } from "./context/InteractionContext"
import { UserProvider } from "./context/UserContext"
import { SignupProvider } from "./context/SignupContext"
import { supabase } from "./lib/supabase"
import { navigationRef } from "./navigation/navigationRef"

function useDeepLinkAuth() {
  useEffect(() => {
    const handle = async (url: string) => {
      const { queryParams } = Linking.parse(url)
      const code = queryParams?.code
      if (code && typeof code === "string") {
        await supabase.auth.exchangeCodeForSession(code)
        if (navigationRef.isReady()) {
          navigationRef.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
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
          <RootNavigator />
        </InteractionProvider>
      </SignupProvider>
    </UserProvider>
  )
}
