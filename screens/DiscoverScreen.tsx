import { useState } from 'react'
import { SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'
import { mockPeople } from '../data/mockPeople'

type NavProp = NativeStackNavigationProp<RootStackParamList>
type Action = 'hi' | 'chat'

export default function DiscoverScreen() {
  const navigation = useNavigation<NavProp>()
  const [actions, setActions] = useState<Record<number, Action>>({})
  const [hidden, setHidden] = useState<Set<number>>(new Set())

  const sendHi = (id: number) => setActions(prev => ({ ...prev, [id]: 'hi' }))
  const sendChat = (id: number) => setActions(prev => ({ ...prev, [id]: 'chat' }))
  const notInterested = (id: number) => setHidden(prev => new Set(prev).add(id))

  const visiblePeople = mockPeople.filter(p => !hidden.has(p.id))

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>Proximity</Text>
        <Text style={styles.title}>Nearby people</Text>
        <Text style={styles.subtitle}>
          These are demo profiles. Later, this will load real users from Supabase.
        </Text>

        {visiblePeople.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👀</Text>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptySubtitle}>
              No one else nearby right now. Check back later.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {visiblePeople.map((person) => {
              const action = actions[person.id]
              return (
                <View key={person.id} style={styles.card}>
                  <Pressable
                    style={styles.profileArea}
                    onPress={() => navigation.navigate("ProfileDetail", { personId: person.id })}
                  >
                    <Text style={styles.name}>{person.name}, {person.age}</Text>
                    <Text style={styles.status}>{person.status}</Text>
                    <Text style={styles.distance}>{person.distance}</Text>
                  </Pressable>

                  {action ? (
                    <View style={styles.sentPill}>
                      <Text style={styles.sentPillText}>
                        {action === "hi" ? "Hi sent" : "Chat request sent"}
                      </Text>
                    </View>
                  ) : (
                    <View style={styles.actionsArea}>
                      <View style={styles.primaryActions}>
                        <Pressable style={styles.actionButton} onPress={() => sendHi(person.id)}>
                          <Text style={styles.actionButtonText}>Come say hi</Text>
                        </Pressable>
                        <Pressable style={styles.actionButton} onPress={() => sendChat(person.id)}>
                          <Text style={styles.actionButtonText}>Let's chat</Text>
                        </Pressable>
                      </View>
                      <Pressable style={styles.notInterestedButton} onPress={() => notInterested(person.id)}>
                        <Text style={styles.notInterestedText}>Not interested</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
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
    padding: 24,
    paddingBottom: 40,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: "#12101C",
    marginBottom: 28,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#12101C",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 22,
    color: "#4A4458",
  },
  list: {
    marginTop: 24,
    gap: 14,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 22,
    padding: 18,
    gap: 16,
  },
  profileArea: {
    gap: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#12101C",
  },
  status: {
    fontSize: 14,
    color: "#4A4458",
  },
  distance: {
    fontSize: 12,
    color: "#A8A3B8",
  },

  // Action states
  actionsArea: {
    gap: 10,
  },
  primaryActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#12101C",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  notInterestedButton: {
    alignItems: "center",
    paddingVertical: 4,
  },
  notInterestedText: {
    fontSize: 13,
    color: "#A8A3B8",
    fontWeight: "500",
  },

  // Sent pill
  sentPill: {
    backgroundColor: "#F4F3F7",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  sentPillText: {
    fontSize: 13,
    color: "#A8A3B8",
    fontWeight: "500",
  },

  // Empty state
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
