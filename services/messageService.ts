import { supabase } from "../lib/supabase"

export type Message = {
  id: string
  senderId: string
  receiverId: string
  text: string
  createdAt: string
}

function rowToMessage(row: Record<string, unknown>): Message {
  return {
    id: row.id as string,
    senderId: row.sender_id as string,
    receiverId: row.receiver_id as string,
    text: row.text as string,
    createdAt: row.created_at as string,
  }
}

export async function getMessages(userId1: string, userId2: string): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${userId1},receiver_id.eq.${userId2}),and(sender_id.eq.${userId2},receiver_id.eq.${userId1})`
    )
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data ?? []).map(rowToMessage)
}

export type ConversationPreview = {
  text: string
  createdAt: string
}

// Returns the most recent message for each conversation partner in one query.
export async function getConversationPreviews(
  userId: string
): Promise<Map<string, ConversationPreview>> {
  const { data, error } = await supabase
    .from("messages")
    .select("sender_id, receiver_id, text, created_at")
    .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
    .order("created_at", { ascending: false })

  if (error) throw error

  const map = new Map<string, ConversationPreview>()
  for (const row of (data ?? []) as Array<Record<string, string>>) {
    const partnerId = row.sender_id === userId ? row.receiver_id : row.sender_id
    if (!map.has(partnerId)) {
      map.set(partnerId, { text: row.text, createdAt: row.created_at })
    }
  }
  return map
}

export async function sendMessage(
  senderId: string,
  receiverId: string,
  text: string
): Promise<Message> {
  const { data, error } = await supabase
    .from("messages")
    .insert({ sender_id: senderId, receiver_id: receiverId, text })
    .select()
    .single()

  if (error) throw error
  return rowToMessage(data as Record<string, unknown>)
}
