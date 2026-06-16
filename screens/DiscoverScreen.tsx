import { useState, useCallback, useEffect, useRef } from "react"
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useNavigation, useFocusEffect } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import type { Person } from "../data/mockPeople"
import { useInteractions } from "../context/InteractionContext"
import { useUser } from "../context/UserContext"
import { useRoom } from "../context/RoomContext"
import { getNearbyAvailablePeople, updateLocationPing } from "../services/profileService"
import { getCurrentCoarseLocation } from "../lib/location"
import { SOCIAL_COLOR, PRO_COLOR } from "../constants/modes"

type NavProp = NativeStackNavigationProp<RootStackParamList>

// Module-level flag — show explainer once per app session
let explainerShown = false

export default function DiscoverScreen() {
  const navigation = useNavigation<NavProp>()
  const { hiddenUsers } = useInteractions()
  const { profile, setMode, setAvailability } = useUser()
  const { room, roomLoaded, leaveRoom } = useRoom()

  const [nearbyPeople, setNearbyPeople] = useState<Person[]>([])
  const [nearbyLoading, setNearbyLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [togglingAvailable, setTogglingAvailable] = useState(false)
  const [showExplainer, setShowExplainer] = useState(!explainerShown)
  const locationRef = useRef<{ lat: number; lng: number } | null>(null)

  const activeMode = profile.mode
  const accentColor = activeMode === "professional" ? PRO_COLOR : SOCIAL_COLOR

  const switchMode = (mode: "social" | "professional") => {
    if (mode === "professional" && !profile.hasProfessionalMode) {
      navigation.navigate("Paywall")
      return
    }
    setMode(mode)
  }

  const loadNearby = useCallback(async (coords: { lat: number; lng: number } | null) => {
    if (!profile.isAvailable || !coords || !profile.supabaseId) {
      setNearbyPeople([])
      setNearbyLoading(false)
      return
    }
    setNearbyLoading(true)
    try {
      const people = await getNearbyAvailablePeople(
        profile.supabaseId,
        profile.blockedIds,
        coords.lat,
        coords.lng,
        activeMode
      )
      setNearbyPeople(
        people.filter(p => !hiddenUsers.includes(p.id))
      )
    } catch {
      setNearbyPeople([])
    } finally {
      setNearbyLoading(false)
    }
  }, [profile.isAvailable, profile.supabaseId, profile.blockedIds, activeMode, hiddenUsers])

  const refreshAll = useCallback(async () => {
    const coords = await getCurrentCoarseLocation()
    locationRef.current = coords
    if (profile.isAvailable && profile.supabaseId && coords) {
      updateLocationPing(profile.supabaseId, coords.lat, coords.lng).catch(() => {})
    }
    await loadNearby(coords)
  }, [profile.isAvailable, profile.supabaseId, loadNearby])

  // Reload when screen comes into focus
  useFocusEffect(useCallback(() => {
    refreshAll()
  }, [refreshAll]))

  // Re-run loadNearby when mode changes
  useEffect(() => {
    loadNearby(locationRef.current)
  }, [activeMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // 5-minute location ping while focused and available
  useEffect(() => {
    if (!profile.isAvailable) return
    const interval = setInterval(refreshAll, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [profile.isAvailable, refreshAll])

  const handleToggleAvailable = async () => {
    if (!profile.isVisible) {
      Alert.alert("visibility off", "turn visibility on in my profile first.")
      return
    }
    const coords = await getCurrentCoarseLocation()
    if (!coords) {
      Alert.alert("location needed", "we need location access to show you to nearby people.")
      return
    }
    setTogglingAvailable(true)
    try {
      await setAvailability(true, coords.lat, coords.lng)
      locationRef.current = coords
      await loadNearby(coords)
    } catch (err) {
      Alert.alert("error", err instanceof Error ? err.message : "please try again.")
    } finally {
      setTogglingAvailable(false)
    }
  }

  const onPullRefresh = async () => {
    setRefreshing(true)
    await refreshAll()
    setRefreshing(false)
  }

  const closeExplainer = () => {
    explainerShown = true
    setShowExplainer(false)
  }

  const renderPeopleSection = () => {
    if (!profile.isAvailable) {
      return (
        <Pressable
          style={styles.availableBanner}
          onPress={handleToggleAvailable}
          disabled={togglingAvailable}
        >
          {togglingAvailable
            ? <ActivityIndicator color="#12101C" />
            : (
              <>
                <Text style={styles.availableBannerTitle}>you're invisible.</Text>
                <Text style={styles.availableBannerSub}>
                  tap to be discoverable to people nearby.
                </Text>
              </>
            )
          }
        </Pressable>
      )
    }

    if (nearbyLoading) {
      return <ActivityIndicator size="small" color={accentColor} style={styles.loader} />
    }

    if (nearbyPeople.length === 0) {
      return (
        <View style={styles.emptyNearby}>
          <Text style={styles.emptyNearbyText}>nobody's around right now. that's okay.</Text>
        </View>
      )
    }

    return (
      <View style={styles.list}>
        {nearbyPeople.map((person, index) => (
          <Pressable
            key={person.id ?? index}
            style={[styles.card, { borderColor: accentColor + "30" }]}
            onPress={() => navigation.navigate("ProfileDetail", { personId: person.id, profile: person })}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.name}>{person.name}, {person.age}</Text>
              {person.distanceMeters != null && (
                <Text style={styles.distance}>{person.distanceMeters}m away</Text>
              )}
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
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onPullRefresh} />}
      >
        <Text style={styles.brand}>Proximity</Text>

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

        <Text style={[styles.sectionTitle, { color: accentColor }]}>
          {activeMode === "social" ? "people nearby" : "professionals nearby"}
        </Text>

        {renderPeopleSection()}

        {/* Rooms section */}
        <View style={styles.roomsDivider} />

        {!roomLoaded ? (
          <ActivityIndicator size="small" color="#A8A3B8" />
        ) : room ? (
          <View style={styles.roomBanner}>
            <View style={styles.roomBannerInfo}>
              <View style={styles.roomBannerDot} />
              <Text style={styles.roomBannerName} numberOfLines={1}>{room.name}</Text>
            </View>
            <View style={styles.roomBannerActions}>
              <Pressable
                onPress={() => navigation.navigate("RoomCode", {
                  roomCode: room.code,
                  roomName: room.name,
                  accessMode: room.accessMode,
                })}
                hitSlop={8}
              >
                <Text style={styles.roomActionText}>share</Text>
              </Pressable>
              <Pressable onPress={leaveRoom} hitSlop={8}>
                <Text style={styles.leaveText}>leave</Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.roomActions}>
            <Pressable style={styles.roomButton} onPress={() => navigation.navigate("CreateRoom")}>
              <Text style={styles.roomButtonText}>create a room</Text>
            </Pressable>
            <Pressable style={styles.roomButtonGhost} onPress={() => navigation.navigate("JoinRoom")}>
              <Text style={styles.roomButtonGhostText}>join with a code</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* First-time explainer */}
      <Modal visible={showExplainer} transparent animationType="fade">
        <View style={styles.explainerOverlay}>
          <View style={styles.explainerCard}>
            <Text style={styles.explainerTitle}>people nearby is new.</Text>
            <Text style={styles.explainerBody}>
              tap "you're invisible" below to show up to people within 200m who are also available. rooms still work — they're below the list.
            </Text>
            <Pressable style={styles.explainerButton} onPress={closeExplainer}>
              <Text style={styles.explainerButtonText}>got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  loader: {
    marginTop: 40,
  },
  availableBanner: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#EEEBF2",
    borderRadius: 18,
    padding: 20,
    alignItems: "center",
    gap: 6,
    minHeight: 80,
    justifyContent: "center",
  },
  availableBannerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#12101C",
  },
  availableBannerSub: {
    fontSize: 14,
    color: "#4A4458",
    textAlign: "center",
  },
  emptyNearby: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyNearbyText: {
    fontSize: 15,
    color: "#A8A3B8",
    textAlign: "center",
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
  distance: {
    fontSize: 12,
    color: "#A8A3B8",
  },
  status: {
    fontSize: 13,
    color: "#4A4458",
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
  roomsDivider: {
    height: 1,
    backgroundColor: "#EEEBF2",
    marginVertical: 4,
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
  roomBannerActions: {
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },
  roomActionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#12101C",
  },
  leaveText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#A8A3B8",
  },
  roomActions: {
    gap: 10,
  },
  roomButton: {
    backgroundColor: "#12101C",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  roomButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  roomButtonGhost: {
    borderWidth: 1.5,
    borderColor: "#EEEBF2",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  roomButtonGhostText: {
    color: "#4A4458",
    fontSize: 14,
    fontWeight: "600",
  },
  // Explainer modal
  explainerOverlay: {
    flex: 1,
    backgroundColor: "rgba(18,16,28,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  explainerCard: {
    backgroundColor: "#FAFAFB",
    borderRadius: 24,
    padding: 28,
    gap: 14,
    width: "100%",
  },
  explainerTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#12101C",
  },
  explainerBody: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4A4458",
  },
  explainerButton: {
    backgroundColor: "#12101C",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  explainerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
})
