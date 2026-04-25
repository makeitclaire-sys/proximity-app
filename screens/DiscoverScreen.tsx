import { useState, useEffect } from "react"
import { SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { mockPeople } from "../data/mockPeople"
import type { Person } from "../data/mockPeople"
import { useInteractions } from "../context/InteractionContext"
import { useUser } from "../context/UserContext"
import { getProfiles } from "../services/profileService"

type NavProp = NativeStackNavigationProp<RootStackParamList>

export default function DiscoverScreen() {
  const navigation = useNavigation<NavProp>()
  const { hiddenUsers } = useInteractions()
  const { profile } = useUser()

  const [supabaseProfiles, setSupabaseProfiles] = useState<Person[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getProfiles()
      .then(profiles => {
        if (!cancelled) setSupabaseProfiles(profiles)
      })
      .catch(() => {
        if (!cancelled) setSupabaseProfiles(null)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const sourceProfiles = supabaseProfiles ?? mockPeople
  const visiblePeople = sourceProfiles.filter(p => !hiddenUsers.includes(p.id))

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>Proximity</Text>
        <Text style={styles.title}>Nearby people</Text>
        <Text style={styles.subtitle}>
          {supabaseProfiles
            ? "People nearby right now."
            : "These are demo profiles. Later, this will load real users from Supabase."}
        </Text>

        {!profile.isVisible && (
          <View style={styles.invisibleBanner}>
            <Text style={styles.invisibleBannerText}>
              You are invisible. Others cannot see you.
            </Text>
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="small" color="#12101C" style={styles.loader} />
        ) : visiblePeople.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>👀</Text>
            <Text style={styles.emptyTitle}>All caught up</Text>
            <Text style={styles.emptySubtitle}>
              No one else nearby right now. Check back later.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {visiblePeople.map((person) => (
              <Pressable
                key={person.id}
                style={styles.card}
                onPress={() => navigation.navigate("ProfileDetail", { personId: person.id })}
              >
                <Text style={styles.name}>{person.name}, {person.age}</Text>
                <Text style={styles.status}>{person.status}</Text>
                <Text style={styles.distance}>{person.distance}</Text>
              </Pressable>
            ))}
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
  loader: {
    marginTop: 60,
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
  invisibleBanner: {
    backgroundColor: "rgba(255, 159, 28, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
  },
  invisibleBannerText: {
    fontSize: 13,
    color: "#FF9F1C",
    fontWeight: "500",
    textAlign: "center",
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
