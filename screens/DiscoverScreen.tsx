import { useState, useCallback, useEffect } from "react"
import { SafeAreaView, View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from "react-native"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import type { Person } from "../data/mockPeople"
import { useInteractions } from "../context/InteractionContext"
import { useUser } from "../context/UserContext"
import { useRoom } from "../context/RoomContext"
import { getProfiles } from "../services/profileService"
import { supabase } from "../lib/supabase"
import { SOCIAL_COLOR, PRO_COLOR } from "../constants/modes"

type NavProp = NativeStackNavigationProp<RootStackParamList>

export default function DiscoverScreen() {
  const navigation = useNavigation<NavProp>()
  const { hiddenUsers } = useInteractions()
  const { profile, setMode } = useUser()
  const { room, roomLoaded, members, leaveRoom } = useRoom()

  const [profiles, setProfiles] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)

  const activeMode = profile.mode
  const accentColor = activeMode === "professional" ? PRO_COLOR : SOCIAL_COLOR
  const memberIds = new Set(members.map(m => m.userId))

  useFocusEffect(useCallback(() => {
    let cancelled = false
    setLoading(true)

    getProfiles()
      .then(data => { if (!cancelled) setProfiles(data) })
      .catch(() => { if (!cancelled) setProfiles([]) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, []))

  // Live visibility updates — when any profile toggles is_visible, remove or restore them instantly
  useEffect(() => {
    const channel = supabase
      .channel("discover-profiles")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          const row = payload.new as { id: string; is_visible: boolean; mode: string }
          setProfiles(prev =>
            prev.map(p =>
              p.id === row.id
                ? { ...p, isVisible: row.is_visible, mode: row.mode as "social" | "professional" }
                : p
            )
          )
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const switchMode = (mode: "social" | "professional") => {
    if (mode === "professional" && !profile.hasProfessionalMode) {
      navigation.navigate("Paywall")
      return
    }
    setMode(mode)
  }

  const visiblePeople = profiles.filter(p =>
    !hiddenUsers.includes(p.id) &&
    p.id !== profile.supabaseId &&
    (p.mode ?? "social") === activeMode &&
    p.isVisible !== false &&
    memberIds.has(p.id)
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.brand}>Proximity</Text>

        {!roomLoaded ? (
          <ActivityIndicator size="small" color="#12101C" style={styles.loader} />
        ) : !room ? (
          <View style={styles.noRoomState}>
            <Text style={styles.noRoomEmoji}>📍</Text>
            <Text style={styles.noRoomTitle}>You're not in a room yet.</Text>
            <Text style={styles.noRoomSubtitle}>
              Join or create one to see who's nearby.
            </Text>
            <Pressable style={styles.primaryButton} onPress={() => navigation.navigate("CreateRoom")}>
              <Text style={styles.primaryButtonText}>Create a room</Text>
            </Pressable>
            <Pressable style={styles.ghostButton} onPress={() => navigation.navigate("JoinRoom")}>
              <Text style={styles.ghostButtonText}>Join with a code</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.roomBanner}>
              <View style={styles.roomBannerInfo}>
                <View style={styles.roomBannerDot} />
                <Text style={styles.roomBannerName} numberOfLines={1}>{room.name}</Text>
              </View>
              <Pressable onPress={leaveRoom} hitSlop={8}>
                <Text style={styles.leaveText}>Leave</Text>
              </Pressable>
            </View>

            <View style={styles.modeTabs}>
              <Pressable
                style={[styles.modeTab, activeMode === "social" && { ...styles.modeTabActive, backgroundColor: SOCIAL_COLOR }]}
                onPress={() => switchMode("social")}
              >
                <Text style={[styles.modeTabText, activeMode === "social" && styles.modeTabTextActive]}>
                  Social
                </Text>
              </Pressable>
              <Pressable
                style={[styles.modeTab, activeMode === "professional" && { ...styles.modeTabActive, backgroundColor: PRO_COLOR }]}
                onPress={() => switchMode("professional")}
              >
                <Text style={[styles.modeTabText, activeMode === "professional" && styles.modeTabTextActive]}>
                  Professional {!profile.hasProfessionalMode && "🔒"}
                </Text>
              </Pressable>
            </View>

            <Text style={[styles.title, { color: accentColor }]}>
              {activeMode === "social" ? "Nearby people" : "Professionals nearby"}
            </Text>

            {!profile.isVisible && (
              <View style={styles.invisibleBanner}>
                <Text style={styles.invisibleBannerText}>
                  You are invisible. Others cannot see you.
                </Text>
              </View>
            )}

            {loading ? (
              <ActivityIndicator size="small" color={accentColor} style={styles.loader} />
            ) : visiblePeople.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyEmoji}>{activeMode === "social" ? "👀" : "💼"}</Text>
                <Text style={styles.emptyTitle}>No {activeMode === "social" ? "people" : "professionals"} nearby right now.</Text>
                <Text style={styles.emptySubtitle}>Check back soon.</Text>
              </View>
            ) : (
              <View style={styles.list}>
                {visiblePeople.map((person, index) => (
                  <Pressable
                    key={person.id ?? index}
                    style={[styles.card, { borderColor: accentColor + "30" }]}
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
                          <View key={`${interest}-${i}`} style={[styles.chip, { backgroundColor: accentColor + "15" }]}>
                            <Text style={[styles.chipText, { color: accentColor }]}>{interest}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </Pressable>
                ))}
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
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: "#12101C",
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "#F0EEF5",
    borderRadius: 999,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  modeTabActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A4458",
  },
  modeTabTextActive: {
    color: "#FFFFFF",
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "500",
  },
  invisibleBanner: {
    backgroundColor: "rgba(255, 159, 28, 0.1)",
    borderRadius: 12,
    padding: 12,
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
  noRoomState: {
    alignItems: "center",
    paddingTop: 80,
    gap: 16,
  },
  noRoomEmoji: {
    fontSize: 44,
  },
  noRoomTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#12101C",
    textAlign: "center",
  },
  noRoomSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4A4458",
    textAlign: "center",
    maxWidth: 260,
  },
  primaryButton: {
    backgroundColor: "#12101C",
    paddingVertical: 15,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignItems: "center",
    width: "100%",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  ghostButton: {
    borderWidth: 1.5,
    borderColor: "#12101C",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 999,
    alignItems: "center",
    width: "100%",
  },
  ghostButtonText: {
    color: "#12101C",
    fontSize: 15,
    fontWeight: "600",
  },
  roomBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F0EEF5",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  roomBannerInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  roomBannerDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#06D6A0",
    flexShrink: 0,
  },
  roomBannerName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#12101C",
    flexShrink: 1,
  },
  leaveText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#A8A3B8",
  },
})
