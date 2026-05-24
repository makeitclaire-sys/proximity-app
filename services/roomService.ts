import { supabase } from "../lib/supabase"

export type Room = {
  id: string
  name: string
  code: string
  hostId: string
  createdAt: string
  endsAt: string | null
  closedAt: string | null
}

export type RoomMember = {
  id: string
  roomId: string
  userId: string
  joinedAt: string
  leftAt: string | null
}

type RoomRow = {
  id: string
  name: string
  code: string
  host_id: string
  created_at: string
  ends_at: string | null
  closed_at: string | null
}

type RoomMemberRow = {
  id: string
  room_id: string
  user_id: string
  joined_at: string
  left_at: string | null
}

function rowToRoom(row: RoomRow): Room {
  return {
    id: row.id,
    name: row.name,
    code: row.code,
    hostId: row.host_id,
    createdAt: row.created_at,
    endsAt: row.ends_at,
    closedAt: row.closed_at,
  }
}

function rowToMember(row: RoomMemberRow): RoomMember {
  return {
    id: row.id,
    roomId: row.room_id,
    userId: row.user_id,
    joinedAt: row.joined_at,
    leftAt: row.left_at,
  }
}

// Unambiguous chars — no 0/O, 1/I/L
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export async function createRoom(name: string, hostId: string): Promise<Room> {
  const code = generateCode()

  const { data: roomData, error: roomError } = await supabase
    .from("rooms")
    .insert({ name: name.trim(), code, host_id: hostId })
    .select()
    .single()

  if (roomError) throw roomError

  const { error: memberError } = await supabase
    .from("room_members")
    .insert({ room_id: roomData.id, user_id: hostId })

  if (memberError) throw memberError

  return rowToRoom(roomData as RoomRow)
}

export async function joinRoom(code: string, userId: string): Promise<Room> {
  const { data: roomData, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("code", code.trim().toUpperCase())
    .is("closed_at", null)
    .maybeSingle()

  if (roomError) throw roomError
  if (!roomData) throw new Error("Room not found or already closed.")

  const room = rowToRoom(roomData as RoomRow)

  // Upsert: re-joining after leaving resets left_at and updates joined_at
  const { error: memberError } = await supabase
    .from("room_members")
    .upsert(
      { room_id: room.id, user_id: userId, joined_at: new Date().toISOString(), left_at: null },
      { onConflict: "room_id,user_id" }
    )

  if (memberError) throw memberError

  return room
}

export async function leaveRoom(roomId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from("room_members")
    .update({ left_at: new Date().toISOString() })
    .eq("room_id", roomId)
    .eq("user_id", userId)
    .is("left_at", null)

  if (error) throw error
}

export async function closeRoom(roomId: string): Promise<void> {
  const { error } = await supabase
    .from("rooms")
    .update({ closed_at: new Date().toISOString() })
    .eq("id", roomId)

  if (error) throw error
}

export async function getCurrentRoom(userId: string): Promise<Room | null> {
  const { data: memberData, error: memberError } = await supabase
    .from("room_members")
    .select("room_id")
    .eq("user_id", userId)
    .is("left_at", null)
    .maybeSingle()

  if (memberError || !memberData) return null

  const { data: roomData, error: roomError } = await supabase
    .from("rooms")
    .select("*")
    .eq("id", (memberData as { room_id: string }).room_id)
    .is("closed_at", null)
    .maybeSingle()

  if (roomError || !roomData) return null
  return rowToRoom(roomData as RoomRow)
}

export async function getRoomMembers(roomId: string): Promise<RoomMember[]> {
  const { data, error } = await supabase
    .from("room_members")
    .select("*")
    .eq("room_id", roomId)
    .is("left_at", null)
    .order("joined_at", { ascending: true })

  if (error) throw error
  return (data ?? []).map(r => rowToMember(r as RoomMemberRow))
}
