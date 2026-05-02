import { useState, useCallback } from "react"
import { SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, Image } from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { useUser } from "../context/UserContext"
import { getProfiles } from "../services/profileService"
import { getConnections } from "../services/connectionService"
import { getConversationPreviews } from "../services/messageService"

type NavProp = NativeStackNavigationProp<RootStackParamList>

type Conversation = {
  id: string
  personId: string
  name: string
  avatarUrl: string | null
  lastMessage: string
  lastMessageAt: string | null
  time: string
}

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

function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "now"
  if (mins < 60) return `${mins}m`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days === 1) return "Yesterday"
  if (days < 7) return new Date(isoString).toLocaleDateString([], { weekday: "short" })
  return new Date(isoString).toLocaleDateString([], { month: "short", day: "numeric" })
}

export default function MessagesScreen() {
  const navigation = useNavigation<NavProp>()
  const { profile: myProfile } = useUser()
  const myId = myProfile.supabaseId

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (myId == null) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [allProfiles, allConnections, previews] = await Promise.all([
        getProfiles(),
        getConnections(myId),
        getConversationPreviews(myId),
      ])

      const profileMap = new Map(allProfiles.map(p => [p.id, p]))
      const accepted = allConnections.filter(c => c.status === "accepted")

      const convos: Conversation[] = accepted.map(conn => {
        const otherId = conn.senderId === myId ? conn.receiverId : conn.senderId
        const person = profileMap.get(otherId)
        const preview = previews.get(otherId)
        return {
          id: conn.id,
          personId: otherId,
          name: person?.name ?? `User ${otherId.slice(0, 8)}`,
          avatarUrl: person?.avatarUrl ?? null,
          lastMessage: preview?.text ?? "",
          lastMessageAt: preview?.createdAt ?? null,
          time: preview ? formatRelativeTime(preview.createdAt) : "",
        }
      })

      // Sort: conversations with messages first (newest first), then messagelessly
      convos.sort((a, b) => {
        if (!a.lastMessageAt && !b.lastMessageAt) return 0
        if (!a.lastMessageAt) return 1
        if (!b.lastMessageAt) return -1
        return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      })

      setConversations(convos)
    } catch (err) {
      console.error("[MessagesScreen] load error:", err)
    } finally {
      setLoading(false)
    }
  }, [myId])

  useFocusEffect(useCallback(() => { load() }, [load]))

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
        ) : conversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              When someone accepts your chat request, they appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {conversations.map((conv, index) => {
              const av = getAvatar(conv.personId)
              return (
                <Pressable
                  key={conv.id ?? index}
                  style={styles.card}
                  onPress={() => navigation.navigate("Chat", { personId: conv.personId, name: conv.name })}
                >
                  <View style={[styles.avatar, { backgroundColor: av.bg }]}>
                    {conv.avatarUrl ? (
                      <Image source={{ uri: conv.avatarUrl }} style={styles.avatarImage} />
                    ) : (
                      <Text style={[styles.avatarText, { color: av.fg }]}>
                        {getInitials(conv.name)}
                      </Text>
                    )}
                  </View>

                  <View style={styles.middle}>
                    <View style={styles.topRow}>
                      <Text style={styles.name}>{conv.name}</Text>
                      {conv.time ? <Text style={styles.time}>{conv.time}</Text> : null}
                    </View>

                    <Text
                      style={[styles.preview, !conv.lastMessage && styles.previewEmpty]}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {conv.lastMessage || "No messages yet"}
                    </Text>
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
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarImage: {
    width: 46,
    height: 46,
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
    fontWeight: "600",
    color: "#12101C",
  },
  time: {
    fontSize: 12,
    color: "#A8A3B8",
  },
  preview: {
    fontSize: 13,
    color: "#A8A3B8",
  },
  previewEmpty: {
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
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
