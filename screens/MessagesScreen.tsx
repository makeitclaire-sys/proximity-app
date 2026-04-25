import { useState, useEffect } from "react"
import { SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { mockPeople } from "../data/mockPeople"
import { useInteractions } from "../context/InteractionContext"
import { getProfiles, supabaseProfilesCache } from "../services/profileService"

type NavProp = NativeStackNavigationProp<RootStackParamList>

type Conversation = {
  id: string
  personId: string
  name: string
  lastMessage: string
  time: string
  unread: number
}

const MOCK_LAST_MESSAGES = [
  "That was really interesting, thanks for sharing!",
  "Let me know if you're around this weekend",
  "Totally agree, the talk was brilliant",
  "Haha yes, great chatting with you!",
  "Would love to grab coffee sometime",
]

const MOCK_TIMES = ["2m", "1h", "3h", "Yesterday", "2d"]

const AVATAR_COLORS = [
  { bg: "rgba(255, 45, 135, 0.12)", fg: "#FF2D87" },
  { bg: "rgba(79, 70, 229, 0.12)",  fg: "#4F46E5" },
  { bg: "rgba(6, 214, 160, 0.12)",  fg: "#06D6A0" },
  { bg: "rgba(255, 159, 28, 0.12)", fg: "#FF9F1C" },
]

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) & 0x7fffffff
  }
  return h
}

const getAvatar = (id: string) => AVATAR_COLORS[hashId(id) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]
const getInitials = (name: string) => name.split(" ").map(p => p[0]).join("")

export default function MessagesScreen() {
  const navigation = useNavigation<NavProp>()
  const { chatRequests } = useInteractions()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getProfiles()
      .then(data => {
        if (!cancelled) {
          const convos: Conversation[] = data.map((person, i) => ({
            id: person.id,
            personId: person.id,
            name: person.name,
            lastMessage: MOCK_LAST_MESSAGES[i % MOCK_LAST_MESSAGES.length],
            time: MOCK_TIMES[i % MOCK_TIMES.length],
            unread: i < 2 ? (i === 0 ? 2 : 1) : 0,
          }))
          setConversations(convos)
        }
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const chatConvos: Conversation[] = chatRequests
    .filter(id => !conversations.some(c => c.personId === id))
    .flatMap(id => {
      const p = mockPeople.find(m => m.id === id) ?? supabaseProfilesCache.get(id)
      return p
        ? [{ id: id + "-chat", personId: id, name: p.name, lastMessage: "You sent a chat request", time: "Now", unread: 0 }]
        : []
    })

  const allConversations = [...chatConvos, ...conversations]

  const openConversation = (conv: Conversation) => {
    setConversations(prev =>
      prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c)
    )
    navigation.navigate("Chat", { personId: conv.personId, name: conv.name })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>Proximity</Text>
        <Text style={styles.title}>Messages</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#12101C" style={styles.loader} />
        ) : allConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              When you connect with someone, your messages will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {allConversations.map((conv, index) => {
              const av = getAvatar(conv.personId)
              const isUnread = conv.unread > 0
              return (
                <Pressable
                  key={conv.id ?? index}
                  style={styles.card}
                  onPress={() => openConversation(conv)}
                >
                  <View style={[styles.avatar, { backgroundColor: av.bg }]}>
                    <Text style={[styles.avatarText, { color: av.fg }]}>
                      {getInitials(conv.name)}
                    </Text>
                  </View>

                  <View style={styles.middle}>
                    <View style={styles.topRow}>
                      <Text style={[styles.name, isUnread && styles.nameUnread]}>
                        {conv.name}
                      </Text>
                      <Text style={styles.time}>{conv.time}</Text>
                    </View>

                    <View style={styles.bottomRow}>
                      <Text
                        style={[styles.preview, isUnread && styles.previewUnread]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {conv.lastMessage}
                      </Text>
                      {isUnread && (
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>{conv.unread}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </Pressable>
              )
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFB",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 20,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: "#12101C",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#12101C",
    marginTop: -8,
  },
  loader: {
    marginTop: 60,
  },
  list: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  middle: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 15,
    fontWeight: "500",
    color: "#12101C",
  },
  nameUnread: {
    fontWeight: "700",
  },
  time: {
    fontSize: 12,
    color: "#A8A3B8",
    fontWeight: "400",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  preview: {
    flex: 1,
    fontSize: 13,
    color: "#A8A3B8",
  },
  previewUnread: {
    color: "#4A4458",
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#12101C",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    flexShrink: 0,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#12101C",
  },
  emptySubtitle: {
    fontSize: 14,
    lineHeight: 21,
    color: "#4A4458",
    textAlign: "center",
    maxWidth: 260,
  },
})
