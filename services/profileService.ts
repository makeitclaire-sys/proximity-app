import { supabase } from "../lib/supabase"
import type { Person } from "../data/mockPeople"

// Raw shape returned from the profiles table
type ProfileRow = {
  id: string                  // UUID primary key
  numeric_id: number          // stable integer used as Person.id in the app
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
}

// Module-level caches so ProfileDetailScreen can look up Supabase profiles
// without changing the navigation param type.
export const supabaseProfilesCache = new Map<number, Person>()
const uuidByNumericId = new Map<number, string>()

function rowToPerson(row: ProfileRow): Person {
  const person: Person = {
    id: row.numeric_id,
    name: row.name ?? "",
    age: row.age ?? 0,
    status: row.status ?? "Proximity user",
    distance: row.distance ?? "nearby",
    bio: row.bio ?? "",
    interests: row.interests ?? [],
    starters: row.conversation_starters ?? [],
    talkTopics: row.talk_topics ?? [],
    avoidTopics: row.avoid_topics ?? [],
  }
  supabaseProfilesCache.set(person.id, person)
  uuidByNumericId.set(person.id, row.id)
  return person
}

export async function getProfiles(): Promise<Person[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("id, numeric_id, name, age, bio, status, distance, mode, is_visible, interests, talk_topics, avoid_topics, conversation_starters")
    .eq("is_visible", true)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data as ProfileRow[]).map(rowToPerson)
}

export async function getProfileById(numericId: number): Promise<Person | null> {
  if (supabaseProfilesCache.has(numericId)) {
    return supabaseProfilesCache.get(numericId)!
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, numeric_id, name, age, bio, status, distance, mode, is_visible, interests, talk_topics, avoid_topics, conversation_starters")
    .eq("numeric_id", numericId)
    .single()

  if (error || !data) return null
  return rowToPerson(data as ProfileRow)
}

export async function updateProfile(numericId: number, updates: ProfileUpdates): Promise<void> {
  const uuid = uuidByNumericId.get(numericId)
  if (!uuid) throw new Error(`No UUID found for numeric_id ${numericId}`)

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", uuid)

  if (error) throw error

  // Invalidate cache so the next getProfileById fetches fresh data
  supabaseProfilesCache.delete(numericId)
}
