import { createContext, useContext, useState } from "react"
import type { ReactNode } from "react"

export type UserProfile = {
  name: string
  age: number
  bio: string
  interests: string[]
  talkTopics: string[]
  avoidTopics: string[]
  mode: "social" | "professional"
  isVisible: boolean
  supabaseId: string | null
  avatarUrl: string | null
}

type UserContextType = {
  profile: UserProfile
  updateProfile: (updates: Partial<UserProfile>) => void
  toggleMode: () => void
  toggleVisibility: () => void
}

const DEFAULT_PROFILE: UserProfile = {
  name: "Alex T.",
  age: 27,
  bio: "Product designer with a side obsession for bouldering and fermented foods. Currently figuring out what the next chapter looks like.",
  interests: ["Design", "Bouldering", "Food", "Music", "Travel"],
  talkTopics: [
    "Finding good coffee in new places",
    "Side projects that went somewhere",
    "What you're currently obsessing over",
  ],
  avoidTopics: [
    "Crypto pitches",
    "LinkedIn hustle culture",
    "Networking for its own sake",
  ],
  mode: "social",
  isVisible: true,
  supabaseId: null,
  avatarUrl: null,
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)

  const updateProfile = (updates: Partial<UserProfile>) =>
    setProfile(prev => ({ ...prev, ...updates }))

  const toggleMode = () =>
    setProfile(prev => ({
      ...prev,
      mode: prev.mode === "social" ? "professional" : "social",
    }))

  const toggleVisibility = () =>
    setProfile(prev => ({ ...prev, isVisible: !prev.isVisible }))

  return (
    <UserContext.Provider value={{ profile, updateProfile, toggleMode, toggleVisibility }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}
