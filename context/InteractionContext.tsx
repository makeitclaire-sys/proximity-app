import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

type InteractionState = {
  hiRequests: string[]
  chatRequests: string[]
  hiddenUsers: string[]
  sendHi: (id: string) => void
  sendChat: (id: string) => void
  hideUser: (id: string) => void
}

const InteractionContext = createContext<InteractionState | null>(null)

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [hiRequests, setHiRequests] = useState<string[]>([])
  const [chatRequests, setChatRequests] = useState<string[]>([])
  const [hiddenUsers, setHiddenUsers] = useState<string[]>([])

  const sendHi = (id: string) =>
    setHiRequests(prev => (prev.includes(id) ? prev : [...prev, id]))

  const sendChat = (id: string) =>
    setChatRequests(prev => (prev.includes(id) ? prev : [...prev, id]))

  const hideUser = (id: string) =>
    setHiddenUsers(prev => (prev.includes(id) ? prev : [...prev, id]))

  return (
    <InteractionContext.Provider value={{ hiRequests, chatRequests, hiddenUsers, sendHi, sendChat, hideUser }}>
      {children}
    </InteractionContext.Provider>
  )
}

export function useInteractions() {
  const ctx = useContext(InteractionContext)
  if (!ctx) throw new Error("useInteractions must be used within InteractionProvider")
  return ctx
}
