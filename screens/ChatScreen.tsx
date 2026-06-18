import { useState, useRef, useEffect } from "react"
import {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { useUser } from "../context/UserContext"
import { getConnectionWith, type Connection } from "../services/connectionService"
import { getMessages, sendMessage, type Message } from "../services/messageService"
import { supabase } from "../lib/supabase"
import {
  getReactions,
  toggleReaction,
  subscribeToReactions,
  type Reaction,
  type EmojiKey,
  EMOJI_OPTIONS,
  EMOJI_DISPLAY,
} from "../services/reactionService"
import { haptic } from "../lib/haptics"

type Props = NativeStackScreenProps<RootStackParamList, "Chat">

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

function formatDateLabel(isoString: string): string {
  const date = new Date(isoString)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return "Today"
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday"
  return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
}

function sameDay(a: string, b: string): boolean {
  const da = new Date(a)
  const db = new Date(b)
  return da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
}

function groupReactions(reactions: Reaction[], messageId: string, myId: string) {
  const forMsg = reactions.filter(r => r.messageId === messageId)
  const counts = new Map<EmojiKey, { count: number; mine: boolean }>()
  for (const r of forMsg) {
    const prev = counts.get(r.emoji) ?? { count: 0, mine: false }
    counts.set(r.emoji, { count: prev.count + 1, mine: prev.mine || r.userId === myId })
  }
  return Array.from(counts.entries()).map(([emoji, data]) => ({ emoji, ...data }))
}

function TypingIndicator() {
  const dots = [
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
    useRef(new Animated.Value(0)).current,
  ]

  useEffect(() => {
    const animations = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(dot, { toValue: 1, duration: 250, useNativeDriver: true }),
          Animated.timing(dot, { toValue: 0, duration: 250, useNativeDriver: true }),
          Animated.delay(450 - i * 150),
        ])
      )
    )
    const anim = Animated.parallel(animations)
    anim.start()
    return () => anim.stop()
  }, [])

  return (
    <View style={styles.bubbleRowThem}>
      <View style={[styles.bubbleThem, { paddingHorizontal: 16, paddingVertical: 12 }]}>
        <View style={{ flexDirection: "row", gap: 5, alignItems: "center" }}>
          {dots.map((dot, i) => (
            <Animated.View
              key={i}
              style={{
                width: 7, height: 7, borderRadius: 3.5,
                backgroundColor: "#A8A3B8",
                transform: [{ translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -4] }) }],
              }}
            />
          ))}
        </View>
      </View>
    </View>
  )
}

export default function ChatScreen({ navigation, route }: Props) {
  const { personId, name } = route.params
  const scrollRef = useRef<ScrollView>(null)
  const { profile: myProfile } = useUser()
  const myId = myProfile.supabaseId

  const [connection, setConnection] = useState<Connection | null | "loading">("loading")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [inputText, setInputText] = useState("")
  const [sending, setSending] = useState(false)
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [pickerVisible, setPickerVisible] = useState(false)
  const [pickerMessageId, setPickerMessageId] = useState<string | null>(null)

  const typingChannelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const messagesRef = useRef<Message[]>([])

  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Load initial connection + messages + reactions
  useEffect(() => {
    if (myId == null) {
      setConnection(null)
      setLoading(false)
      return
    }

    Promise.all([
      getConnectionWith(myId, personId),
      getMessages(myId, personId),
    ])
      .then(([conn, msgs]) => {
        setConnection(conn)
        setMessages(msgs)
        const realIds = msgs.map(m => m.id).filter(id => !id.startsWith("optimistic"))
        if (realIds.length > 0) {
          getReactions(realIds).then(setReactions).catch(() => {})
        }
      })
      .catch(err => {
        console.error("[ChatScreen] load error:", err)
        setConnection(null)
      })
      .finally(() => setLoading(false))
  }, [myId, personId])

  // Realtime messages subscription
  useEffect(() => {
    if (myId == null) return

    const channel = supabase
      .channel(`chat-${myId}-${personId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          const senderId = row.sender_id as string
          const receiverId = row.receiver_id as string
          const inConversation =
            (senderId === myId && receiverId === personId) ||
            (senderId === personId && receiverId === myId)
          if (!inConversation) return
          const msg: Message = {
            id: row.id as string,
            senderId,
            receiverId,
            text: row.text as string,
            createdAt: row.created_at as string,
          }
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [myId, personId])

  // Realtime reactions subscription
  useEffect(() => {
    if (myId == null) return
    const key = [myId, personId].sort().join("-")
    return subscribeToReactions(key, {
      onInsert: (r) => {
        if (!messagesRef.current.some(m => m.id === r.messageId)) return
        setReactions(prev => (prev.some(p => p.id === r.id) ? prev : [...prev, r]))
      },
      onDelete: (id) => {
        setReactions(prev => prev.filter(r => r.id !== id))
      },
      onUpdate: (r) => {
        if (!messagesRef.current.some(m => m.id === r.messageId)) return
        setReactions(prev => [...prev.filter(p => p.id !== r.id), r])
      },
    })
  }, [myId, personId])

  // Typing — Presence-based (auto-clears on disconnect unlike Broadcast)
  useEffect(() => {
    if (!myId) return
    const chName = `typing-${[myId, personId].sort().join("-")}`
    const ch = supabase
      .channel(chName, { config: { presence: { key: myId } } })
      .on("presence", { event: "sync" }, () => {
        const state = ch.presenceState<{ isTyping: boolean }>()
        const otherTyping = Object.entries(state)
          .filter(([key]) => key !== myId)
          .some(([, presences]) => presences.some(p => p.isTyping))
        setIsOtherTyping(otherTyping)
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await ch.track({ isTyping: false })
        }
      })
    typingChannelRef.current = ch
    return () => {
      supabase.removeChannel(ch)
      typingChannelRef.current = null
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    }
  }, [myId, personId])

  const handleTyping = (text: string) => {
    setInputText(text)
    if (!myId || !typingChannelRef.current) return
    typingChannelRef.current.track({ isTyping: true })
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      typingChannelRef.current?.track({ isTyping: false })
    }, 2000)
  }

  const canChat =
    connection !== "loading" &&
    connection !== null &&
    connection.status === "accepted"

  const isPending =
    connection !== "loading" &&
    connection !== null &&
    connection.status === "pending"

  const send = async () => {
    const trimmed = inputText.trim()
    if (!trimmed || !canChat || myId == null || sending) return

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingChannelRef.current?.track({ isTyping: false })
    haptic.light()

    setInputText("")
    setSending(true)

    const optimistic: Message = {
      id: `optimistic-${Date.now()}`,
      senderId: myId,
      receiverId: personId,
      text: trimmed,
      createdAt: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)

    try {
      const saved = await sendMessage(myId, personId, trimmed)
      setMessages(prev => {
        const withoutOptimistic = prev.filter(m => m.id !== optimistic.id)
        if (withoutOptimistic.some(m => m.id === saved.id)) return withoutOptimistic
        return [...withoutOptimistic, saved]
      })
    } catch (err) {
      console.error("[ChatScreen] send error:", err)
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      setInputText(trimmed)
    } finally {
      setSending(false)
    }
  }

  const handleLongPress = (msgId: string) => {
    if (msgId.startsWith("optimistic")) return
    haptic.medium()
    setPickerMessageId(msgId)
    setPickerVisible(true)
  }

  const handlePickEmoji = async (messageId: string, emoji: EmojiKey) => {
    if (!myId) return
    setPickerVisible(false)
    setPickerMessageId(null)
    haptic.selection()
    try {
      await toggleReaction(messageId, myId, emoji)
    } catch {}
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.headerName}>{name}</Text>
          <View style={styles.backButton} />
        </View>

        {isPending && connection.senderId === myId && (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingBannerText}>
              Your request is pending. You can chat once {name} accepts.
            </Text>
          </View>
        )}

        {isPending && connection.senderId !== myId && (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingBannerText}>
              {name} wants to chat. Accept their request in Connections to start messaging.
            </Text>
          </View>
        )}

        {!loading && connection === null && (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingBannerText}>
              No connection with {name}. Send a connection request first.
            </Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#12101C" />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.messageList}
            contentContainerStyle={styles.messageListContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
          >
            {messages.length === 0 ? (
              <Text style={styles.emptyText}>
                {canChat ? "No messages yet. Say hello!" : ""}
              </Text>
            ) : (
              messages.map((msg, i) => {
                const fromMe = msg.senderId === myId
                const prev = messages[i - 1]
                const showDateSep = !prev || !sameDay(prev.createdAt, msg.createdAt)
                const msgReactions = groupReactions(reactions, msg.id, myId ?? "")
                return (
                  <View key={msg.id}>
                    {showDateSep && (
                      <Text style={styles.dayLabel}>{formatDateLabel(msg.createdAt)}</Text>
                    )}
                    <Pressable
                      onLongPress={() => handleLongPress(msg.id)}
                      delayLongPress={400}
                      style={[styles.bubbleRow, fromMe ? styles.bubbleRowMe : styles.bubbleRowThem]}
                    >
                      <View style={[styles.bubble, fromMe ? styles.bubbleMe : styles.bubbleThem]}>
                        <Text style={[styles.bubbleText, fromMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                          {msg.text}
                        </Text>
                        <Text style={[styles.bubbleTime, fromMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
                          {formatTime(msg.createdAt)}
                        </Text>
                      </View>
                      {msgReactions.length > 0 && (
                        <View style={styles.reactionRow}>
                          {msgReactions.map(r => (
                            <Pressable
                              key={r.emoji}
                              style={[styles.reactionPill, r.mine && styles.reactionPillMine]}
                              onPress={() => handlePickEmoji(msg.id, r.emoji)}
                            >
                              <Text style={styles.reactionEmoji}>{EMOJI_DISPLAY[r.emoji]}</Text>
                              {r.count > 1 && (
                                <Text style={styles.reactionCount}>{r.count}</Text>
                              )}
                            </Pressable>
                          ))}
                        </View>
                      )}
                    </Pressable>
                  </View>
                )
              })
            )}
            {isOtherTyping && canChat && <TypingIndicator />}
          </ScrollView>
        )}

        <SafeAreaView edges={["bottom"]} style={styles.inputSafeArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, !canChat && styles.inputDisabled]}
              value={inputText}
              onChangeText={handleTyping}
              placeholder={canChat ? "Message..." : "Accept connection to chat"}
              placeholderTextColor="#A8A3B8"
              returnKeyType="send"
              onSubmitEditing={send}
              blurOnSubmit={false}
              multiline
              editable={canChat}
            />
            <Pressable
              style={[styles.sendButton, (!inputText.trim() || !canChat || sending) && styles.sendButtonDisabled]}
              onPress={send}
              disabled={!inputText.trim() || !canChat || sending}
            >
              <Text style={styles.sendButtonText}>↑</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>

      <Modal
        visible={pickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPickerVisible(false)}
      >
        <Pressable style={styles.pickerBackdrop} onPress={() => setPickerVisible(false)}>
          <View style={styles.pickerContainer}>
            <View style={styles.pickerRow}>
              {EMOJI_OPTIONS.map(emoji => (
                <Pressable
                  key={emoji}
                  style={styles.pickerEmoji}
                  onPress={() => pickerMessageId && handlePickEmoji(pickerMessageId, emoji)}
                >
                  <Text style={styles.pickerEmojiText}>{EMOJI_DISPLAY[emoji]}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFB",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEBF2",
    backgroundColor: "#FAFAFB",
  },
  backButton: {
    width: 70,
  },
  backText: {
    fontSize: 16,
    color: "#12101C",
    fontWeight: "500",
  },
  headerName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#12101C",
    textAlign: "center",
  },

  pendingBanner: {
    backgroundColor: "rgba(255, 159, 28, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEBF2",
  },
  pendingBannerText: {
    fontSize: 13,
    color: "#FF9F1C",
    fontWeight: "500",
    textAlign: "center",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  messageList: { flex: 1 },
  messageListContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 12,
  },
  dayLabel: {
    fontSize: 12,
    color: "#A8A3B8",
    textAlign: "center",
    marginBottom: 4,
    fontWeight: "500",
  },
  emptyText: {
    fontSize: 14,
    color: "#A8A3B8",
    textAlign: "center",
    marginTop: 40,
  },
  bubbleRow: {
    gap: 4,
  },
  bubbleRowMe: {
    alignItems: "flex-end",
  },
  bubbleRowThem: {
    alignItems: "flex-start",
  },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMe: {
    backgroundColor: "#12101C",
    borderBottomRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderBottomLeftRadius: 4,
  },
  bubbleText: {
    fontSize: 15,
    lineHeight: 21,
  },
  bubbleTextMe: { color: "#FFFFFF" },
  bubbleTextThem: { color: "#12101C" },
  bubbleTime: {
    fontSize: 10,
    marginTop: 3,
    opacity: 0.65,
    alignSelf: "flex-end",
  },
  bubbleTimeMe: { color: "#FFFFFF" },
  bubbleTimeThem: { color: "#12101C" },

  reactionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 2,
  },
  reactionPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 3,
  },
  reactionPillMine: {
    borderColor: "#12101C",
    backgroundColor: "#F4F3F7",
  },
  reactionEmoji: { fontSize: 14 },
  reactionCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4A4458",
  },

  pickerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  pickerRow: {
    flexDirection: "row",
    gap: 8,
  },
  pickerEmoji: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 26,
    backgroundColor: "#F4F3F7",
  },
  pickerEmojiText: { fontSize: 28 },

  inputSafeArea: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#EEEBF2",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#F4F3F7",
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: "#12101C",
    maxHeight: 120,
  },
  inputDisabled: { opacity: 0.5 },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#12101C",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: { backgroundColor: "#EEEBF2" },
  sendButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "700",
    lineHeight: 22,
  },
})
