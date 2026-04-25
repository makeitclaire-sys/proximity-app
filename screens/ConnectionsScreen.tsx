import { useState } from "react"
import { SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, Alert } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { mockPeople } from "../data/mockPeople"
import { useInteractions } from "../context/InteractionContext"

type NavProp = NativeStackNavigationProp<RootStackParamList>

type Person = {
  id: number
  name: string
  age: number
  status: string
}

type SentEntry = Person & { badge: string }

const PENDING: Person[] = [
  { id: 10, name: "Jordan M.", age: 29, status: "UX lead at Figma" },
  { id: 11, name: "Sam K.", age: 31, status: "Freelance photographer" },
]

const CONNECTIONS: Person[] = [
  { id: 1, name: "Maya R.", age: 28, status: "New in town" },
  { id: 14, name: "Chris L.", age: 33, status: "Software engineer" },
]

const ALL_PEOPLE: Person[] = [...PENDING, ...CONNECTIONS]

const AVATAR_COLORS = [
  { bg: "rgba(255, 45, 135, 0.12)", fg: "#FF2D87" },
  { bg: "rgba(79, 70, 229, 0.12)",  fg: "#4F46E5" },
  { bg: "rgba(6, 214, 160, 0.12)",  fg: "#06D6A0" },
  { bg: "rgba(255, 159, 28, 0.12)", fg: "#FF9F1C" },
]

const getAvatar = (id: number) => AVATAR_COLORS[id % AVATAR_COLORS.length]
const getInitials = (name: string) => name.split(" ").map(p => p[0]).join("")

export default function ConnectionsScreen() {
  const navigation = useNavigation<NavProp>()
  const { hiRequests, chatRequests } = useInteractions()

  const [pendingIds, setPendingIds] = useState<Set<number>>(
    new Set(PENDING.map(p => p.id))
  )
  const [acceptedIds, setAcceptedIds] = useState<Set<number>>(
    new Set(CONNECTIONS.map(p => p.id))
  )

  const accept = (id: number) => {
    setPendingIds(prev => { const s = new Set(prev); s.delete(id); return s })
    setAcceptedIds(prev => new Set(prev).add(id))
  }

  const decline = (id: number) => {
    setPendingIds(prev => { const s = new Set(prev); s.delete(id); return s })
  }

  const pendingPeople = PENDING.filter(p => pendingIds.has(p.id))
  const acceptedPeople = ALL_PEOPLE.filter(p => acceptedIds.has(p.id))

  const sentPeople: SentEntry[] = [
    ...hiRequests.flatMap(id => {
      const p = mockPeople.find(m => m.id === id)
      return p ? [{ id: p.id, name: p.name, age: p.age, status: p.status, badge: "Hi sent" }] : []
    }),
    ...chatRequests.flatMap(id => {
      const p = mockPeople.find(m => m.id === id)
      return p ? [{ id: p.id, name: p.name, age: p.age, status: p.status, badge: "Chat sent" }] : []
    }),
  ]

  const goToProfile = (id: number) => {
    navigation.navigate("ProfileDetail", { personId: id })
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>Proximity</Text>

        {pendingPeople.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PENDING ({pendingPeople.length})</Text>
            {pendingPeople.map(person => {
              const av = getAvatar(person.id)
              return (
                <Pressable key={person.id} style={styles.card} onPress={() => goToProfile(person.id)}>
                  <View style={styles.cardRow}>
                    <View style={[styles.avatar, { backgroundColor: av.bg }]}>
                      <Text style={[styles.avatarText, { color: av.fg }]}>
                        {getInitials(person.name)}
                      </Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>{person.name}, {person.age}</Text>
                      <Text style={styles.cardStatus}>{person.status}</Text>
                    </View>
                  </View>
                  <View style={styles.buttonRow}>
                    <Pressable style={styles.declineButton} onPress={() => decline(person.id)}>
                      <Text style={styles.declineButtonText}>Decline</Text>
                    </Pressable>
                    <Pressable style={styles.acceptButton} onPress={() => accept(person.id)}>
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </Pressable>
                  </View>
                </Pressable>
              )
            })}
          </View>
        )}

        {sentPeople.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SENT ({sentPeople.length})</Text>
            {sentPeople.map(person => {
              const av = getAvatar(person.id)
              return (
                <Pressable key={person.id} style={styles.card} onPress={() => goToProfile(person.id)}>
                  <View style={styles.cardRow}>
                    <View style={[styles.avatar, { backgroundColor: av.bg }]}>
                      <Text style={[styles.avatarText, { color: av.fg }]}>
                        {getInitials(person.name)}
                      </Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>{person.name}, {person.age}</Text>
                      <Text style={styles.cardStatus}>{person.status}</Text>
                    </View>
                    <Text style={styles.awaitingBadge}>{person.badge}</Text>
                  </View>
                </Pressable>
              )
            })}
          </View>
        )}

        {acceptedPeople.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CONNECTIONS ({acceptedPeople.length})</Text>
            {acceptedPeople.map(person => {
              const av = getAvatar(person.id)
              return (
                <Pressable key={person.id} style={styles.card} onPress={() => goToProfile(person.id)}>
                  <View style={styles.cardRow}>
                    <View style={[styles.avatar, { backgroundColor: av.bg }]}>
                      <Text style={[styles.avatarText, { color: av.fg }]}>
                        {getInitials(person.name)}
                      </Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.cardName}>{person.name}, {person.age}</Text>
                      <Text style={styles.cardStatus}>{person.status}</Text>
                    </View>
                  </View>
                  <Pressable
                    style={styles.messageButton}
                    onPress={() => Alert.alert("Message", `Messaging ${person.name} is coming soon.`)}
                  >
                    <Text style={styles.messageButtonText}>Message</Text>
                  </Pressable>
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
    gap: 28,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: "#12101C",
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
    justifyContent: "center",
    alignItems: "center",
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
})
