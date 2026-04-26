import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { getProfileById } from "../services/profileService"

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
  profileLoaded: boolean
  updateProfile: (updates: Partial<UserProfile>) => void
  refreshProfile: () => Promise<void>
  toggleMode: () => void
  toggleVisibility: () => void
}

const CLAIRE_ID = "8c785cf7-3095-4ff8-9117-87c8c7f27102"

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
  supabaseId: CLAIRE_ID,
  avatarUrl: null,
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [profileLoaded, setProfileLoaded] = useState(false)

  const refreshProfile = useCallback(async () => {
    console.log("CURRENT USER ID:", CLAIRE_ID)
    try {
      const person = await getProfileById(CLAIRE_ID)
      if (!person) {
        console.log("PROFILE LOAD ERROR: getProfileById returned null — check UUID and RLS policy")
        setProfileLoaded(true)
        return
      }
      console.log("LOADED PROFILE:", person)
      setProfile(prev => ({
        ...prev,
        name: person.name,
        age: person.age,
        bio: person.bio,
        interests: person.interests,
        talkTopics: person.talkTopics,
        avoidTopics: person.avoidTopics,
        mode: person.mode ?? prev.mode,
        isVisible: person.isVisible ?? prev.isVisible,
        avatarUrl: person.avatarUrl ?? null,
      }))
    } catch (err) {
      console.log("PROFILE LOAD ERROR:", err)
    } finally {
      setProfileLoaded(true)
    }
  }, [])

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

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
    <UserContext.Provider value={{ profile, profileLoaded, updateProfile, refreshProfile, toggleMode, toggleVisibility }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}
