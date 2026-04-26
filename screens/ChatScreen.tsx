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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { useUser } from "../context/UserContext"
import { getConnectionWith, type Connection } from "../services/connectionService"
import { getMessages, sendMessage, type Message } from "../services/messageService"
import { supabase } from "../lib/supabase"

type Props = NativeStackScreenProps<RootStackParamList, "Chat">

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
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
      })
      .catch(err => {
        console.error("[ChatScreen] load error:", err)
        setConnection(null)
      })
      .finally(() => setLoading(false))
  }, [myId, personId])

  // Realtime subscription — fires for every INSERT on messages involving this conversation
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

          // Ignore messages outside this conversation
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
            // Deduplicate: real message may already be in state from sendMessage() response
            if (prev.some(m => m.id === msg.id)) return prev
            return [...prev, msg]
          })
          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [myId, personId])

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
      // Realtime may have already added the real message before this resolves.
      // Remove the optimistic entry; add the real one only if not already present.
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
              <>
                <Text style={styles.dayLabel}>Messages</Text>
                {messages.map(msg => {
                  const fromMe = msg.senderId === myId
                  return (
                    <View
                      key={msg.id}
                      style={[styles.bubbleRow, fromMe ? styles.bubbleRowMe : styles.bubbleRowThem]}
                    >
                      <View style={[styles.bubble, fromMe ? styles.bubbleMe : styles.bubbleThem]}>
                        <Text style={[styles.bubbleText, fromMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                          {msg.text}
                        </Text>
                      </View>
                      <Text style={[styles.bubbleTime, fromMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
                        {formatTime(msg.createdAt)}
                      </Text>
                    </View>
                  )
                })}
              </>
            )}
          </ScrollView>
        )}

        <SafeAreaView edges={["bottom"]} style={styles.inputSafeArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={[styles.input, !canChat && styles.inputDisabled]}
              value={inputText}
              onChangeText={setInputText}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: "#FAFAFB",
  },

  // Header
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

  // Pending banner
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

  // Loading
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },

  // Messages
  messageList: {
    flex: 1,
  },
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
  bubbleTextMe: {
    color: "#FFFFFF",
  },
  bubbleTextThem: {
    color: "#12101C",
  },
  bubbleTime: {
    fontSize: 11,
    color: "#A8A3B8",
  },
  bubbleTimeMe: {
    alignSelf: "flex-end",
  },
  bubbleTimeThem: {
    alignSelf: "flex-start",
  },

  // Input
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
  inputDisabled: {
    opacity: 0.5,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#12101C",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#EEEBF2",
  },
  sendButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "700",
    lineHeight: 22,
  },
})
