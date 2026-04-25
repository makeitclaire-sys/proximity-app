import { useState } from "react"
import { SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { mockPeople } from "../data/mockPeople"
import { useInteractions } from "../context/InteractionContext"

type NavProp = NativeStackNavigationProp<RootStackParamList>

type Conversation = {
  id: number
  personId?: number
  name: string
  lastMessage: string
  time: string
  unread: number
}

const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    personId: 1,
    name: "Maya R.",
    lastMessage: "That coffee spot on 5th is actually really good!",
    time: "2m",
    unread: 2,
  },
  {
    id: 2,
    personId: 14,
    name: "Chris L.",
    lastMessage: "Let me know if you're around this weekend",
    time: "1h",
    unread: 0,
  },
  {
    id: 3,
    personId: 10,
    name: "Jordan M.",
    lastMessage: "Totally agree, the workshop was brilliant",
    time: "3h",
    unread: 1,
  },
  {
    id: 4,
    personId: 3,
    name: "Priya S.",
    lastMessage: "Haha yes, terrible pun — appreciated though",
    time: "Yesterday",
    unread: 0,
  },
]

const AVATAR_COLORS = [
  { bg: "rgba(255, 45, 135, 0.12)", fg: "#FF2D87" },
  { bg: "rgba(79, 70, 229, 0.12)",  fg: "#4F46E5" },
  { bg: "rgba(6, 214, 160, 0.12)",  fg: "#06D6A0" },
  { bg: "rgba(255, 159, 28, 0.12)", fg: "#FF9F1C" },
]

const getAvatar = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length]
const getInitials = (name: string) => name.split(" ").map(p => p[0]).join("")

export default function MessagesScreen() {
  const navigation = useNavigation<NavProp>()
  const { chatRequests } = useInteractions()
  const [conversations, setConversations] = useState<Conversation[]>(INITIAL_CONVERSATIONS)

  const chatConvos: Conversation[] = chatRequests
    .filter(id => !INITIAL_CONVERSATIONS.some(c => c.personId === id))
    .flatMap(id => {
      const p = mockPeople.find(m => m.id === id)
      return p
        ? [{ id: id + 1000, personId: id, name: p.name, lastMessage: "You sent a chat request", time: "Now", unread: 0 }]
        : []
    })

  const allConversations = [...chatConvos, ...conversations]

  const openConversation = (conv: Conversation) => {
    setConversations(prev =>
      prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c)
    )
    if (conv.personId != null) {
      navigation.navigate("ProfileDetail", { personId: conv.personId })
    } else {
      Alert.alert("Messages", "Conversation view coming soon.")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>Proximity</Text>
        <Text style={styles.title}>Messages</Text>

        {allConversations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>💬</Text>
            <Text style={styles.emptyTitle}>No conversations yet</Text>
            <Text style={styles.emptySubtitle}>
              When you connect with someone, your messages will appear here.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {allConversations.map(conv => {
              const av = getAvatar(conv.id)
              const isUnread = conv.unread > 0
              return (
                <Pressable
                  key={conv.id}
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
