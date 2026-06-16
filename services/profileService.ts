import { supabase } from "../lib/supabase"
import type { Person } from "../data/mockPeople"
import * as FileSystem from "expo-file-system"
import { decode } from "base64-arraybuffer"
import * as ImageManipulator from "expo-image-manipulator"

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
  const path = `${id}/avatar.jpg`
  console.log("[uploadAvatar] start — id:", id, "uri:", localUri)

  // Resize + compress before upload (also converts HEIC → JPEG)
  let manipulated
  try {
    manipulated = await ImageManipulator.manipulateAsync(
      localUri,
      [{ resize: { width: 1024 } }],
      { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
    )
    console.log("[uploadAvatar] manipulated:", manipulated.uri)
  } catch (e: any) {
    console.error("[uploadAvatar] manipulate failed:", e?.message ?? e)
    throw new Error(`Could not process image: ${e?.message ?? "unknown"}`)
  }

  // Read as base64 — works with file://, content://, ph:// on all platforms
  let base64: string
  try {
    base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
      encoding: FileSystem.EncodingType.Base64,
    })
    console.log("[uploadAvatar] base64 length:", base64.length)
  } catch (e: any) {
    console.error("[uploadAvatar] file read failed:", e?.message ?? e)
    throw new Error(`Could not read image file: ${e?.message ?? "unknown"}`)
  }

  if (!base64 || base64.length < 100) {
    throw new Error("Image file was empty or too small.")
  }

  const arrayBuffer = decode(base64)
  console.log("[uploadAvatar] arrayBuffer bytes:", arrayBuffer.byteLength)

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, arrayBuffer, { contentType: "image/jpeg", upsert: true })

  if (uploadError) {
    console.error("[uploadAvatar] supabase error:", uploadError)
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // Cache-bust the URL so React Native doesn't show the stale image after upsert
  const { data } = supabase.storage.from("avatars").getPublicUrl(path)
  const cacheBustedUrl = `${data.publicUrl}?t=${Date.now()}`
  console.log("[uploadAvatar] public URL:", cacheBustedUrl)
  return cacheBustedUrl
}
