import { useState, useEffect, useCallback } from "react"
import { SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, ActivityIndicator, Image } from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import type { Person } from "../data/mockPeople"
import { useUser } from "../context/UserContext"
import { getProfiles } from "../services/profileService"
import { getConnections, updateConnectionStatus, type Connection } from "../services/connectionService"

type NavProp = NativeStackNavigationProp<RootStackParamList>

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

export default function ConnectionsScreen() {
  const navigation = useNavigation<NavProp>()
  const { profile: myProfile } = useUser()
  const myId = myProfile.supabaseId

  const [connections, setConnections] = useState<Connection[]>([])
  const [profileMap, setProfileMap] = useState<Map<number, Person>>(new Map())
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const profiles = await getProfiles()
      const map = new Map(profiles.map(p => [p.id, p]))
      setProfileMap(map)

      if (myId != null) {
        const conns = await getConnections(myId)
        setConnections(conns)
      }
    } catch {
      // leave previous state
    } finally {
      setLoading(false)
    }
  }, [myId])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const accept = async (conn: Connection) => {
    setConnections(prev =>
      prev.map(c => c.id === conn.id ? { ...c, status: "accepted" } : c)
    )
    try {
      await updateConnectionStatus(conn.id, "accepted")
    } catch {
      setConnections(prev =>
        prev.map(c => c.id === conn.id ? { ...c, status: "pending" } : c)
      )
    }
  }

  const decline = async (conn: Connection) => {
    setConnections(prev => prev.filter(c => c.id !== conn.id))
    try {
      await updateConnectionStatus(conn.id, "declined")
    } catch {
      setConnections(prev => [...prev, conn])
    }
  }

  const getOtherId = (conn: Connection) =>
    conn.senderId === myId ? conn.receiverId : conn.senderId

  const receivedPending = connections.filter(
    c => c.receiverId === myId && c.status === "pending"
  )
  const sentPending = connections.filter(
    c => c.senderId === myId && c.status === "pending"
  )
  const accepted = connections.filter(c => c.status === "accepted")

  const isEmpty = !loading && receivedPending.length === 0 && sentPending.length === 0 && accepted.length === 0

  const renderPersonCard = (conn: Connection, index: number, slot: "received" | "sent" | "accepted") => {
    const otherId = getOtherId(conn)
    const person = profileMap.get(otherId)
    const av = getAvatar(otherId)
    const name = person?.name ?? `User ${otherId}`
    const initials = getInitials(name)

    return (
      <Pressable
        key={conn.id ?? index}
        style={styles.card}
        onPress={() => person
          ? navigation.navigate("ProfileDetail", { personId: otherId, profile: person })
          : undefined
        }
      >
        <View style={styles.cardRow}>
          <View style={[styles.avatar, { backgroundColor: av.bg }]}>
            {person?.avatarUrl ? (
              <Image source={{ uri: person.avatarUrl }} style={styles.avatarImage} />
            ) : (
              <Text style={[styles.avatarText, { color: av.fg }]}>{initials}</Text>
            )}
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardName}>{name}{person?.age ? `, ${person.age}` : ""}</Text>
            {person?.status ? <Text style={styles.cardStatus}>{person.status}</Text> : null}
            <Text style={styles.connectionType}>
              {conn.type === "hi" ? "👋 Said hi" : "💬 Chat request"}
            </Text>
          </View>
          {slot === "sent" && (
            <Text style={styles.awaitingBadge}>Awaiting</Text>
          )}
        </View>

        {slot === "received" && (
          <View style={styles.buttonRow}>
            <Pressable style={styles.declineButton} onPress={() => decline(conn)}>
              <Text style={styles.declineButtonText}>Decline</Text>
            </Pressable>
            <Pressable style={styles.acceptButton} onPress={() => accept(conn)}>
              <Text style={styles.acceptButtonText}>Accept</Text>
            </Pressable>
          </View>
        )}

        {slot === "accepted" && (
          <Pressable
            style={styles.messageButton}
            onPress={() => navigation.navigate("Chat", { personId: otherId, name })}
          >
            <Text style={styles.messageButtonText}>Message</Text>
          </Pressable>
        )}
      </Pressable>
    )
  }

  if (myId == null && !loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.brand}>Proximity</Text>
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🔗</Text>
            <Text style={styles.emptyTitle}>Profile not linked</Text>
            <Text style={styles.emptySubtitle}>
              Set your Supabase profile ID in UserContext to see real connections.
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>Proximity</Text>

        {loading ? (
          <ActivityIndicator size="small" color="#12101C" style={styles.loader} />
        ) : isEmpty ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🤝</Text>
            <Text style={styles.emptyTitle}>No connections yet.</Text>
            <Text style={styles.emptySubtitle}>
              Discover people nearby and say hi or start a chat.
            </Text>
          </View>
        ) : (
          <>
            {receivedPending.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>REQUESTS ({receivedPending.length})</Text>
                {receivedPending.map((conn, i) => renderPersonCard(conn, i, "received"))}
              </View>
            )}

            {sentPending.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>SENT ({sentPending.length})</Text>
                {sentPending.map((conn, i) => renderPersonCard(conn, i, "sent"))}
              </View>
            )}

            {accepted.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>CONNECTIONS ({accepted.length})</Text>
                {accepted.map((conn, i) => renderPersonCard(conn, i, "accepted"))}
              </View>
            )}
          </>
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
    gap: 28,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: "#12101C",
  },
  loader: {
    marginTop: 60,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#A8A3B8",
    letterSpacing: 1,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 20,
    padding: 16,
    gap: 14,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarImage: {
    width: 44,
    height: 44,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#12101C",
  },
  cardStatus: {
    fontSize: 13,
    color: "#4A4458",
  },
  connectionType: {
    fontSize: 12,
    color: "#A8A3B8",
    marginTop: 2,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#EEEBF2",
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  declineButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A4458",
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#12101C",
    alignItems: "center",
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  awaitingBadge: {
    fontSize: 12,
    fontWeight: "500",
    color: "#A8A3B8",
    flexShrink: 0,
  },
  messageButton: {
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#12101C",
    alignItems: "center",
  },
  messageButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
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
