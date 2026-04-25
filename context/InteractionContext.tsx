import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

type InteractionState = {
  hiRequests: number[]
  chatRequests: number[]
  hiddenUsers: number[]
  sendHi: (id: number) => void
  sendChat: (id: number) => void
  hideUser: (id: number) => void
}

const InteractionContext = createContext<InteractionState | null>(null)

export function InteractionProvider({ children }: { children: ReactNode }) {
  const [hiRequests, setHiRequests] = useState<number[]>([])
  const [chatRequests, setChatRequests] = useState<number[]>([])
  const [hiddenUsers, setHiddenUsers] = useState<number[]>([])

  const sendHi = (id: number) =>
    setHiRequests(prev => (prev.includes(id) ? prev : [...prev, id]))

  const sendChat = (id: number) =>
    setChatRequests(prev => (prev.includes(id) ? prev : [...prev, id]))

  const hideUser = (id: number) =>
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
