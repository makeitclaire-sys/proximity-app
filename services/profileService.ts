import { supabase } from "../lib/supabase"
import type { Person } from "../data/mockPeople"

// Raw shape returned from the profiles table
type ProfileRow = {
  id: string                  // UUID primary key — used as Person.id
  name: string
  age: number
  bio: string
  status: string
  distance: string
  mode: "social" | "professional"
  is_visible: boolean
  interests: string[]
  talk_topics: string[]
  avoid_topics: string[]
  conversation_starters: string[]
  avatar_url: string | null
}

type ProfileUpdates = {
  name?: string
  age?: number
  bio?: string
  status?: string
  mode?: "social" | "professional"
  is_visible?: boolean
  interests?: string[]
  talk_topics?: string[]
  avoid_topics?: string[]
  conversation_starters?: string[]
  avatar_url?: string | null
}

// Module-level cache so ProfileDetailScreen can look up Supabase profiles
// without changing the navigation param type.
export const supabaseProfilesCache = new Map<string, Person>()

function rowToPerson(row: ProfileRow): Person {
  const person: Person = {
    id: row.id,
    name: row.name ?? "",
    age: row.age ?? 0,
    bio: row.bio ?? "",
    mode: row.mode,
    isVisible: row.is_visible,
    interests: row.interests ?? [],
    talkTopics: row.talk_topics ?? [],
    avoidTopics: row.avoid_topics ?? [],
    starters: row.conversation_starters?.length ? row.conversation_starters : undefined,
    avatarUrl: row.avatar_url ?? undefined,
  }
  supabaseProfilesCache.set(person.id, person)
  return person
}

export async function createProfile(
  userId: string,
  data: {
    name: string
    age: number
    bio: string
    status: string
    mode: "social" | "professional"
  }
): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .upsert({
      id: userId,
      name: data.name,
      age: data.age,
      bio: data.bio,
      status: data.status,
      mode: data.mode,
      is_visible: true,
      interests: [],
      talk_topics: [],
      avoid_topics: [],
      conversation_starters: [],
    })
  if (error) throw error
}

export async function getProfiles(): Promise<Person[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) throw error
  return ((data ?? []) as ProfileRow[]).map(rowToPerson)
}

export async function getProfileById(id: string): Promise<Person | null> {
  if (supabaseProfilesCache.has(id)) {
    return supabaseProfilesCache.get(id)!
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !data) return null
  return rowToPerson(data as ProfileRow)
}

export async function updateProfile(id: string, updates: ProfileUpdates): Promise<void> {
  console.log("[updateProfile] id:", id, "updates:", updates)
  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", id)

  if (error) {
    console.error("[updateProfile] ERROR:", error.message, error)
    throw error
  }

  console.log("[updateProfile] success")
  supabaseProfilesCache.delete(id)
}

export async function uploadAvatar(id: string, localUri: string): Promise<string> {
  // Path is relative to the bucket root — bucket name is NOT repeated here
  const path = `${id}.jpg`
  console.log("[uploadAvatar] bucket: avatars, path:", path, "uri:", localUri)

  const response = await fetch(localUri)
  const arrayBuffer = await response.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, arrayBuffer, { contentType: "image/jpeg", upsert: true })

  if (uploadError) {
    console.error("[uploadAvatar] UPLOAD ERROR:", uploadError.message, uploadError)
    throw uploadError
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path)
  console.log("[uploadAvatar] public URL:", data.publicUrl)
  return data.publicUrl
}
