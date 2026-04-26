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
