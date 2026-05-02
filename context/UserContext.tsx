import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { getProfileById, updateProfile as saveProfileField } from "../services/profileService"
import { supabase } from "../lib/supabase"

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
  const [authUserId, setAuthUserId] = useState<string | null>(null)

  // Authenticated user takes priority; fall back to CLAIRE_ID for demo/dev mode
  const currentUserId = authUserId ?? CLAIRE_ID

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUserId(session?.user.id ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUserId(session?.user.id ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const refreshProfile = useCallback(async () => {
    console.log("CURRENT USER ID:", currentUserId)
    try {
      const person = await getProfileById(currentUserId)
      if (!person) {
        console.log("PROFILE LOAD ERROR: getProfileById returned null — check UUID and RLS policy")
        setProfileLoaded(true)
        return
      }
      console.log("LOADED PROFILE:", person)
      setProfile(prev => ({
        ...prev,
        supabaseId: currentUserId,
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
  }, [currentUserId])

  useEffect(() => {
    refreshProfile()
  }, [refreshProfile])

  const updateProfile = (updates: Partial<UserProfile>) =>
    setProfile(prev => ({ ...prev, ...updates }))

  const toggleMode = () => {
    const newMode = profile.mode === "social" ? "professional" : "social"
    setProfile(prev => ({ ...prev, mode: newMode }))
    if (profile.supabaseId != null) {
      saveProfileField(profile.supabaseId, { mode: newMode }).catch(err =>
        console.error("[toggleMode] save error:", err)
      )
    }
  }

  const toggleVisibility = () => {
    const newVisible = !profile.isVisible
    setProfile(prev => ({ ...prev, isVisible: newVisible }))
    if (profile.supabaseId != null) {
      saveProfileField(profile.supabaseId, { is_visible: newVisible }).catch(err =>
        console.error("[toggleVisibility] save error:", err)
      )
    }
  }

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
