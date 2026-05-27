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
  has_pro_mode: boolean
  blocked_user_ids: string[] | null
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
  has_pro_mode?: boolean
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
    hasProfessionalMode: row.has_pro_mode ?? false,
    blockedIds: row.blocked_user_ids ?? [],
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
    status?: string
    mode: "social" | "professional"
    email: string
  }
): Promise<void> {
  const row: Record<string, unknown> = {
    id: userId,
    name: data.name,
    age: data.age,
    bio: data.bio,
    mode: data.mode,
    email: data.email,
    is_visible: true,
    interests: [],
    talk_topics: [],
    avoid_topics: [],
    conversation_starters: [],
  }
  if (data.status !== undefined) row.status = data.status

  const { error } = await supabase.from("profiles").upsert(row)
  if (error) throw new Error(error.message ?? JSON.stringify(error))
}

export async function getEmailByUsername(username: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("email")
    .ilike("name", username.trim())
    .limit(1)
    .single()

  if (error || !data) return null
  return (data as { email: string | null }).email
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
    throw new Error(error.message ?? JSON.stringify(error))
  }

  console.log("[updateProfile] success")
  supabaseProfilesCache.delete(id)
}

export async function blockUser(myId: string, targetId: string): Promise<void> {
  const { data, error: readError } = await supabase
    .from("profiles")
    .select("blocked_user_ids")
    .eq("id", myId)
    .single()

  if (readError) throw readError

  const current = (data as { blocked_user_ids: string[] | null }).blocked_user_ids ?? []
  if (current.includes(targetId)) return

  const { error } = await supabase
    .from("profiles")
    .update({ blocked_user_ids: [...current, targetId] })
    .eq("id", myId)

  if (error) throw error
  supabaseProfilesCache.delete(myId)
}

export async function reportUser(
  reporterId: string,
  reportedId: string,
  reason: string
): Promise<void> {
  const { error } = await supabase
    .from("reports")
    .insert({ reporter_id: reporterId, reported_id: reportedId, reason })
  if (error) throw error
}

export async function uploadAvatar(id: string, localUri: string): Promise<string> {
  const path = `${id}.jpg`
  console.log("[uploadAvatar] path:", path, "uri:", localUri)

  // XHR with arraybuffer is the most reliable way to read local file:// URIs in React Native.
  // fetch().blob() and fetch().arrayBuffer() both have issues with local URIs in some Expo builds.
  const arrayBuffer = await new Promise<ArrayBuffer>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.responseType = "arraybuffer"
    xhr.open("GET", localUri)
    xhr.onload = () => resolve(xhr.response as ArrayBuffer)
    xhr.onerror = () => reject(new Error("XHR read failed"))
    xhr.send()
  })

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, arrayBuffer, { contentType: "image/jpeg", upsert: true })

  if (uploadError) {
    console.error("[uploadAvatar] status:", (uploadError as any).status, "message:", uploadError.message, uploadError)
    throw uploadError
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(path)
  console.log("[uploadAvatar] public URL:", data.publicUrl)
  return data.publicUrl
}
