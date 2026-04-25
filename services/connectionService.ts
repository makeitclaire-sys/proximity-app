import { supabase } from "../lib/supabase"

export type Connection = {
  id: string
  senderId: string
  receiverId: string
  type: "hi" | "chat"
  status: "pending" | "accepted" | "declined"
  createdAt: string
}

function rowToConnection(row: Record<string, unknown>): Connection {
  return {
    id: row.id as string,
    senderId: row.sender_id as string,
    receiverId: row.receiver_id as string,
    type: row.type as "hi" | "chat",
    status: row.status as "pending" | "accepted" | "declined",
    createdAt: row.created_at as string,
  }
}

// Create or update a connection request. Upsert so re-tapping is idempotent.
export async function createConnection(
  senderId: string,
  receiverId: string,
  type: "hi" | "chat"
): Promise<void> {
  const { error } = await supabase
    .from("connections")
    .upsert(
      { sender_id: senderId, receiver_id: receiverId, type, status: "pending" },
      { onConflict: "sender_id,receiver_id" }
    )
  if (error) throw error
}

// All connections the user is part of (sent and received).
export async function getConnections(userId: string): Promise<Connection[]> {
  const { data, error } = await supabase
    .from("connections")
    .select("*")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })
  if (error) throw error
  return (data ?? []).map(rowToConnection)
}

// Check whether any connection exists between two specific users (either direction).
export async function getConnectionWith(
  myId: string,
  otherId: string
): Promise<Connection | null> {
  const [{ data: sent }, { data: received }] = await Promise.all([
    supabase
      .from("connections")
      .select("*")
      .eq("sender_id", myId)
      .eq("receiver_id", otherId)
      .maybeSingle(),
    supabase
      .from("connections")
      .select("*")
      .eq("sender_id", otherId)
      .eq("receiver_id", myId)
      .maybeSingle(),
  ])
  const row = sent ?? received
  return row ? rowToConnection(row) : null
}

export async function updateConnectionStatus(
  id: string,
  status: "accepted" | "declined"
): Promise<void> {
  const { error } = await supabase
    .from("connections")
    .update({ status })
    .eq("id", id)
  if (error) throw error
}
