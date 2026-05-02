import RootNavigator from "./navigation/RootNavigator"
import { InteractionProvider } from "./context/InteractionContext"
import { UserProvider } from "./context/UserContext"
import { SignupProvider } from "./context/SignupContext"

export default function App() {
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