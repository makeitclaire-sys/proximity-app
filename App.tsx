import RootNavigator from "./navigation/RootNavigator"
import { InteractionProvider } from "./context/InteractionContext"
import { UserProvider } from "./context/UserContext"

export default function App() {
  return (
    <UserProvider>
      <InteractionProvider>
        <RootNavigator />
      </InteractionProvider>
    </UserProvider>
  )
}