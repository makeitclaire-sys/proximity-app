import { useState, useEffect } from "react"
import { SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import type { Person } from "../data/mockPeople"
import { useInteractions } from "../context/InteractionContext"
import { useUser } from "../context/UserContext"
import { getProfiles } from "../services/profileService"

type NavProp = NativeStackNavigationProp<RootStackParamList>

export default function DiscoverScreen() {
  const navigation = useNavigation<NavProp>()
  const { hiddenUsers } = useInteractions()
  const { profile } = useUser()

  const [profiles, setProfiles] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    getProfiles()
      .then(data => {
        if (!cancelled) setProfiles(data)
      })
      .catch(() => {
        if (!cancelled) setProfiles([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  const visiblePeople = profiles.filter(p => !hiddenUsers.includes(p.id))

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>Proximity</Text>
        <Text style={styles.title}>Nearby people</Text>

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
            <Text style={styles.emptyTitle}>No people nearby right now.</Text>
            <Text style={styles.emptySubtitle}>Check back soon.</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {visiblePeople.map((person, index) => (
              <Pressable
                key={person.id ?? index}
                style={styles.card}
                onPress={() => navigation.navigate("ProfileDetail", { personId: person.id, profile: person })}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.name}>{person.name}, {person.age}</Text>
                  {person.distance ? <Text style={styles.distance}>{person.distance}</Text> : null}
                </View>
                {person.status ? <Text style={styles.status}>{person.status}</Text> : null}
                {person.bio ? (
                  <Text style={styles.bio} numberOfLines={2}>{person.bio}</Text>
                ) : null}
                {person.interests.length > 0 && (
                  <View style={styles.chips}>
                    {person.interests.slice(0, 3).map((interest, i) => (
                      <View key={`${interest}-${i}`} style={styles.chip}>
                        <Text style={styles.chipText}>{interest}</Text>
                      </View>
                    ))}
                  </View>
                )}
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
    gap: 6,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#12101C",
  },
  status: {
    fontSize: 13,
    color: "#4A4458",
  },
  distance: {
    fontSize: 12,
    color: "#A8A3B8",
  },
  bio: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4A4458",
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 2,
  },
  chip: {
    backgroundColor: "#F4F3F7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 11,
    color: "#4A4458",
    fontWeight: "500",
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
  },
})
