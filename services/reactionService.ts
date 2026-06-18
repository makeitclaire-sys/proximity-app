import { supabase } from "../lib/supabase"

export type EmojiKey = "heart" | "thumbsup" | "laugh" | "wow" | "pray"

export const EMOJI_DISPLAY: Record<EmojiKey, string> = {
  heart:    "❤️",
  thumbsup: "👍",
  laugh:    "😂",
  wow:      "😮",
  pray:     "🙏",
}

export const EMOJI_OPTIONS: EmojiKey[] = ["heart", "thumbsup", "laugh", "wow", "pray"]

export type Reaction = {
  id: string
  messageId: string
  userId: string
  emoji: EmojiKey
  createdAt: string
}

type ReactionRow = {
  id: string
  message_id: string
  user_id: string
  emoji: string
  created_at: string
}

function rowToReaction(row: ReactionRow): Reaction {
  return {
    id: row.id,
    messageId: row.message_id,
    userId: row.user_id,
    emoji: row.emoji as EmojiKey,
    createdAt: row.created_at,
  }
}

export async function getReactions(messageIds: string[]): Promise<Reaction[]> {
  if (messageIds.length === 0) return []
  const { data, error } = await supabase
    .from("message_reactions")
    .select("*")
    .in("message_id", messageIds)
  if (error) throw error
  return ((data ?? []) as ReactionRow[]).map(rowToReaction)
}

export async function toggleReaction(
  messageId: string,
  userId: string,
  emoji: EmojiKey
): Promise<void> {
  const { data: existing } = await supabase
    .from("message_reactions")
    .select("id, emoji")
    .eq("message_id", messageId)
    .eq("user_id", userId)
    .maybeSingle()

  const row = existing as { id: string; emoji: string } | null
  if (row) {
    if (row.emoji === emoji) {
      await supabase.from("message_reactions").delete().eq("id", row.id)
    } else {
      await supabase.from("message_reactions").update({ emoji }).eq("id", row.id)
    }
  } else {
    await supabase
      .from("message_reactions")
      .insert({ message_id: messageId, user_id: userId, emoji })
  }
}

type ReactionCallbacks = {
  onInsert: (r: Reaction) => void
  onDelete: (id: string, messageId: string) => void
  onUpdate: (r: Reaction) => void
}

export function subscribeToReactions(
  channelKey: string,
  callbacks: ReactionCallbacks
): () => void {
  const channel = supabase
    .channel(`reactions-${channelKey}`)
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "message_reactions" },
      (payload) => callbacks.onInsert(rowToReaction(payload.new as ReactionRow))
    )
    .on(
      "postgres_changes",
      { event: "DELETE", schema: "public", table: "message_reactions" },
      (payload) => {
        const old = payload.old as Partial<ReactionRow>
        if (old.id && old.message_id) callbacks.onDelete(old.id, old.message_id)
      }
    )
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "message_reactions" },
      (payload) => {
        const old = payload.old as Partial<ReactionRow>
        if (old.id && old.message_id) callbacks.onDelete(old.id, old.message_id)
        callbacks.onUpdate(rowToReaction(payload.new as ReactionRow))
      }
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}
