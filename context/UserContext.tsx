import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { getProfileById, updateProfile as saveProfileField, blockUser as svcBlockUser } from "../services/profileService"
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
  hasProfessionalMode: boolean
  blockedIds: string[]
  supabaseId: string | null
  avatarUrl: string | null
}

type UserContextType = {
  profile: UserProfile
  profileLoaded: boolean
  updateProfile: (updates: Partial<UserProfile>) => void
  refreshProfile: () => Promise<void>
  setMode: (mode: "social" | "professional") => void
  toggleMode: () => void
  toggleVisibility: () => void
  unlockProMode: () => Promise<void>
  blockUser: (targetId: string) => Promise<void>
}

const DEFAULT_PROFILE: UserProfile = {
  name: "",
  age: 0,
  bio: "",
  interests: [],
  talkTopics: [],
  avoidTopics: [],
  mode: "social",
  isVisible: true,
  hasProfessionalMode: false,
  blockedIds: [],
  supabaseId: null,
  avatarUrl: null,
}

const UserContext = createContext<UserContextType | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [authUserId, setAuthUserId] = useState<string | null>(null)

  const currentUserId = authUserId

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
    if (!currentUserId) {
      setProfile(DEFAULT_PROFILE)
      setProfileLoaded(true)
      return
    }
    // Always set supabaseId from the auth session, even if the profile
    // row hasn't been created yet (mid-signup). Otherwise downstream
    // screens think the user isn't linked and show "Profile not linked".
    setProfile(prev => ({ ...prev, supabaseId: currentUserId }))
    try {
      const person = await getProfileById(currentUserId)
      if (!person) {
        setProfileLoaded(true)
        return
      }
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
        hasProfessionalMode: person.hasProfessionalMode ?? false,
        blockedIds: person.blockedIds ?? [],
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

  const setMode = (mode: "social" | "professional") => {
    setProfile(prev => ({ ...prev, mode }))
    if (profile.supabaseId != null) {
      saveProfileField(profile.supabaseId, { mode }).catch(err =>
        console.error("[setMode] save error:", err)
      )
    }
  }

  const toggleMode = () => {
    const newMode = profile.mode === "social" ? "professional" : "social"
    setMode(newMode)
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

  const unlockProMode = async () => {
    if (!profile.supabaseId) return
    await saveProfileField(profile.supabaseId, { has_pro_mode: true })
    setProfile(prev => ({ ...prev, hasProfessionalMode: true }))
  }

  const blockUser = async (targetId: string) => {
    if (!profile.supabaseId) return
    await svcBlockUser(profile.supabaseId, targetId)
    setProfile(prev => ({ ...prev, blockedIds: [...prev.blockedIds, targetId] }))
  }

  return (
    <UserContext.Provider value={{ profile, profileLoaded, updateProfile, refreshProfile, setMode, toggleMode, toggleVisibility, unlockProMode, blockUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error("useUser must be used within UserProvider")
  return ctx
}
