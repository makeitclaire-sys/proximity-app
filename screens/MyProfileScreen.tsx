import { useState } from "react"
import { View, Text, Pressable, ScrollView, StyleSheet, Switch, Alert, Image } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { useUser } from "../context/UserContext"
import { supabase } from "../lib/supabase"
import { SOCIAL_COLOR, PRO_COLOR } from "../constants/modes"
import { getCurrentCoarseLocation } from "../lib/location"

type NavProp = NativeStackNavigationProp<RootStackParamList>

export default function MyProfileScreen() {
  const navigation = useNavigation<NavProp>()
  const { profile, setMode, toggleVisibility, setAvailability, extendAvailability } = useUser()
  const insets = useSafeAreaInsets()
  const accent = profile.mode === "professional" ? PRO_COLOR : SOCIAL_COLOR
  const initials = profile.name.split(" ").map(p => p[0]).join("")

  const [togglingAvailable, setTogglingAvailable] = useState(false)
  const [extending, setExtending] = useState(false)

  const formatUntil = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase()

  const handleToggleAvailable = async (value: boolean) => {
    if (!value) {
      try {
        await setAvailability(false)
      } catch {}
      return
    }
    if (!profile.isVisible) {
      Alert.alert("visibility off", "turn visibility on first.")
      return
    }
    setTogglingAvailable(true)
    try {
      const coords = await getCurrentCoarseLocation()
      if (!coords) {
        Alert.alert("location needed", "we need location access to enable this.")
        return
      }
      await setAvailability(true, coords.lat, coords.lng)
    } catch (err) {
      Alert.alert("error", err instanceof Error ? err.message : "please try again.")
    } finally {
      setTogglingAvailable(false)
    }
  }

  const handleExtend = async () => {
    setExtending(true)
    try {
      await extendAvailability()
    } catch {}
    setExtending(false)
  }

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          await supabase.auth.signOut()
          navigation.reset({ index: 0, routes: [{ name: "Welcome" }] })
        },
      },
    ])
  }

  const openSettings = () => {
    Alert.alert("Settings", undefined, [
      { text: "Edit Profile", onPress: () => navigation.navigate("EditProfile") },
      {
        text: profile.isVisible ? "Go invisible" : "Go visible",
        onPress: toggleVisibility,
      },
      { text: "Log out", style: "destructive", onPress: handleLogout },
      { text: "Cancel", style: "cancel" },
    ])
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero photo — no overlay ── */}
        <View style={styles.hero}>
          {profile.avatarUrl ? (
            <Image
              source={{ uri: profile.avatarUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: accent + "55", justifyContent: "center", alignItems: "center" }]}>
              <Text style={[styles.heroInitials, { color: "#FFFFFF" }]}>{initials}</Text>
            </View>
          )}
        </View>

        {/* Name sits below the photo */}
        <View style={styles.nameRow}>
          <Text style={styles.heroName}>{profile.name}, {profile.age}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MODE</Text>
          <View style={styles.modeToggle}>
            <Pressable
              style={[
                styles.modeOption,
                profile.mode === "social" && { ...styles.modeOptionActive, backgroundColor: SOCIAL_COLOR },
              ]}
              onPress={() => setMode("social")}
            >
              <Text style={[styles.modeOptionText, profile.mode === "social" && styles.modeOptionTextActive]}>
                Social
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.modeOption,
                profile.mode === "professional" && { ...styles.modeOptionActive, backgroundColor: PRO_COLOR },
              ]}
              onPress={() => {
                if (!profile.hasProfessionalMode) {
                  navigation.navigate("Paywall")
                } else {
                  setMode("professional")
                }
              }}
            >
              <Text style={[styles.modeOptionText, profile.mode === "professional" && styles.modeOptionTextActive]}>
                Professional {!profile.hasProfessionalMode && "🔒"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ABOUT</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>INTERESTS</Text>
          <View style={styles.interestsRow}>
            {profile.interests.map(interest => (
              <View key={interest} style={styles.interestChip}>
                <Text style={styles.interestText}>{interest}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>TALK TO ME ABOUT</Text>
          <View style={styles.topicList}>
            {profile.talkTopics.map((topic, i) => (
              <Text key={i} style={styles.topicItem}>· {topic}</Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, styles.sectionLabelMuted]}>{"DON'T TALK TO ME ABOUT"}</Text>
          <View style={styles.topicList}>
            {profile.avoidTopics.map((topic, i) => (
              <Text key={i} style={styles.avoidTopicItem}>· {topic}</Text>
            ))}
          </View>
        </View>

        <Pressable
          style={[styles.visibilityCard, { borderColor: profile.isVisible ? "#06D6A0" : "#EEEBF2" }]}
          onPress={toggleVisibility}
        >
          <View style={styles.visibilityRow}>
            <View style={styles.visibilityTextGroup}>
              <Text style={[styles.visibilityStatus, { color: profile.isVisible ? "#06D6A0" : "#A8A3B8" }]}>
                {profile.isVisible ? "Visible in rooms" : "Invisible"}
              </Text>
              <Text style={styles.visibilityTagline}>
                Visible only while checked in. Leave the room anytime.
              </Text>
            </View>
            <Switch
              value={profile.isVisible}
              onValueChange={toggleVisibility}
              trackColor={{ false: "#EEEBF2", true: "#06D6A0" }}
              thumbColor="#FFFFFF"
            />
          </View>
        </Pressable>

        {/* I'm available */}
        <View style={[
          styles.visibilityCard,
          { borderColor: profile.isAvailable ? "#D9F65C" : "#EEEBF2", opacity: profile.isVisible ? 1 : 0.5 },
        ]}>
          <View style={styles.visibilityRow}>
            <View style={styles.visibilityTextGroup}>
              {profile.isAvailable && profile.availableUntil ? (
                <>
                  <Text style={[styles.visibilityStatus, { color: "#8AB200" }]}>I'm available</Text>
                  <Text style={styles.visibilityTagline}>
                    {`available until ${formatUntil(profile.availableUntil)}.`}
                  </Text>
                  <Pressable onPress={handleExtend} disabled={extending} style={styles.extendButton}>
                    <Text style={styles.extendText}>{extending ? "extending…" : "extend +4h"}</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={[styles.visibilityStatus, { color: "#A8A3B8" }]}>I'm available</Text>
                  <Text style={styles.visibilityTagline}>
                    {profile.isVisible
                      ? "people nearby can see me for the next 4 hours."
                      : "turn visibility on first."}
                  </Text>
                </>
              )}
            </View>
            <Switch
              value={profile.isAvailable}
              onValueChange={handleToggleAvailable}
              trackColor={{ false: "#EEEBF2", true: "#D9F65C" }}
              thumbColor="#FFFFFF"
              disabled={togglingAvailable || !profile.isVisible}
            />
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.primaryButtonText}>Edit profile</Text>
        </Pressable>

        <Pressable style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      </ScrollView>

      {/* Brand + settings float over the hero */}
      <View style={[styles.floatingHeader, { top: insets.top + 8 }]}>
        <Text style={styles.brand}>Proximity</Text>
        <Pressable onPress={openSettings} style={styles.settingsButton} hitSlop={8}>
          <Text style={styles.settingsIcon}>•••</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFB",
  },
  content: {
    gap: 28,
    paddingBottom: 40,
  },

  // ── Hero ──
  hero: {
    width: "100%",
    height: 330,
    overflow: "hidden",
    backgroundColor: "#1B1B2E",
  },
  heroInitials: {
    fontSize: 80,
    fontWeight: "800",
    letterSpacing: -2,
  },

  // Name below photo
  nameRow: {
    paddingHorizontal: 22,
    marginTop: -4,
  },
  heroName: {
    fontSize: 28,
    fontWeight: "800",
    color: "#12101C",
    lineHeight: 34,
    letterSpacing: -0.3,
  },

  // ── Floating brand / settings ──
  floatingHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  brand: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    textShadowColor: "rgba(0,0,0,0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  settingsButton: {
    padding: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  settingsIcon: {
    fontSize: 16,
    color: "#FFFFFF",
    letterSpacing: 1,
  },

  // ── Sections ──
  section: {
    gap: 10,
    paddingHorizontal: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#12101C",
    letterSpacing: 1,
  },
  sectionLabelMuted: {
    color: "#A8A3B8",
  },

  modeToggle: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 999,
    overflow: "hidden",
  },
  modeOption: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  modeOptionActive: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  modeOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A4458",
  },
  modeOptionTextActive: {
    color: "#FFFFFF",
  },

  bio: {
    fontSize: 15,
    lineHeight: 23,
    color: "#4A4458",
  },

  interestsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  interestChip: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  interestText: {
    fontSize: 13,
    color: "#4A4458",
    fontWeight: "500",
  },

  topicList: {
    gap: 8,
  },
  topicItem: {
    fontSize: 15,
    lineHeight: 22,
    color: "#4A4458",
  },
  avoidTopicItem: {
    fontSize: 15,
    lineHeight: 22,
    color: "#A8A3B8",
  },

  visibilityCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 24,
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  visibilityTextGroup: {
    flex: 1,
    gap: 4,
  },
  visibilityStatus: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  visibilityTagline: {
    fontSize: 13,
    lineHeight: 18,
    color: "#4A4458",
  },

  extendButton: {
    marginTop: 4,
  },
  extendText: {
    fontSize: 13,
    color: "#8AB200",
    fontWeight: "500",
  },
  primaryButton: {
    backgroundColor: "#12101C",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
    marginHorizontal: 24,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  logoutButton: {
    alignItems: "center",
    paddingVertical: 12,
    marginHorizontal: 24,
  },
  logoutText: {
    fontSize: 15,
    color: "#FF3B30",
    fontWeight: "500",
  },
})
