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
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { useUser } from "../context/UserContext"
import { getConnectionWith, type Connection } from "../services/connectionService"

type Props = NativeStackScreenProps<RootStackParamList, "Chat">

type Message = {
  id: number
  text: string
  fromMe: boolean
  time: string
}

function formatTime() {
  const now = new Date()
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}

export default function ChatScreen({ navigation, route }: Props) {
  const { personId, name } = route.params
  const scrollRef = useRef<ScrollView>(null)
  const { profile: myProfile } = useUser()
  const myId = myProfile.supabaseId

  const [connection, setConnection] = useState<Connection | null | "loading">("loading")

  useEffect(() => {
    if (myId == null) {
      setConnection(null)
      return
    }
    getConnectionWith(myId, personId)
      .then(setConnection)
      .catch(() => setConnection(null))
  }, [myId, personId])

  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hey, good to connect!", fromMe: false, time: formatTime() },
  ])
  const [inputText, setInputText] = useState("")

  const send = () => {
    const trimmed = inputText.trim()
    if (!trimmed) return
    setMessages(prev => [
      ...prev,
      { id: Date.now(), text: trimmed, fromMe: true, time: formatTime() },
    ])
    setInputText("")
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50)
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

        {connection !== "loading" && connection !== null && connection.status === "pending" && connection.senderId === myId && (
          <View style={styles.pendingBanner}>
            <Text style={styles.pendingBannerText}>
              Your request is pending. You can chat once {name} accepts.
            </Text>
          </View>
        )}

        <ScrollView
          ref={scrollRef}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
        >
          <Text style={styles.dayLabel}>Today</Text>
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[styles.bubbleRow, msg.fromMe ? styles.bubbleRowMe : styles.bubbleRowThem]}
            >
              <View style={[styles.bubble, msg.fromMe ? styles.bubbleMe : styles.bubbleThem]}>
                <Text style={[styles.bubbleText, msg.fromMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                  {msg.text}
                </Text>
              </View>
              <Text style={[styles.bubbleTime, msg.fromMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
                {msg.time}
              </Text>
            </View>
          ))}
        </ScrollView>

        <SafeAreaView edges={["bottom"]} style={styles.inputSafeArea}>
          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Message..."
              placeholderTextColor="#A8A3B8"
              returnKeyType="send"
              onSubmitEditing={send}
              blurOnSubmit={false}
              multiline
            />
            <Pressable
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={send}
              disabled={!inputText.trim()}
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
