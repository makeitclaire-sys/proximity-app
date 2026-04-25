import { View, Text, Pressable, ScrollView, StyleSheet, Switch, Alert, Image } from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { useNavigation } from "@react-navigation/native"
import { NativeStackNavigationProp } from "@react-navigation/native-stack"
import { RootStackParamList } from "../navigation/RootNavigator"
import { useUser } from "../context/UserContext"

type NavProp = NativeStackNavigationProp<RootStackParamList>

const MODE_ACCENT: Record<"social" | "professional", string> = {
  social: "#FF2D87",
  professional: "#4F46E5",
}

export default function MyProfileScreen() {
  const navigation = useNavigation<NavProp>()
  const { profile, updateProfile, toggleVisibility } = useUser()
  const insets = useSafeAreaInsets()
  const accent = MODE_ACCENT[profile.mode]
  const initials = profile.name.split(" ").map(p => p[0]).join("")

  const openSettings = () => {
    Alert.alert("Settings", undefined, [
      { text: "Edit Profile", onPress: () => navigation.navigate("EditProfile") },
      {
        text: profile.isVisible ? "Go invisible" : "Go visible",
        onPress: toggleVisibility,
      },
      { text: "Cancel", style: "cancel" },
    ])
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Full-width hero — same structure as ProfileDetailScreen ── */}
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

          {/* Tint over whole image, heavier band at bottom for name readability */}
          <View style={styles.heroOverlayFull} />
          <View style={styles.heroOverlayBottom} />

          {/* Name pinned to bottom of hero */}
          <View style={[styles.heroContent, { paddingBottom: 20 }]}>
            <Text style={styles.heroName}>{profile.name}, {profile.age}</Text>
          </View>
        </View>

        {/* Debug: confirm avatar URL is actually populated */}
        <Text style={styles.debugText}>
          Avatar URL: {profile.avatarUrl ?? "none"}
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>MODE</Text>
          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.modeOption, profile.mode === "social" && styles.modeOptionActive]}
              onPress={() => updateProfile({ mode: "social" })}
            >
              <Text style={[styles.modeOptionText, profile.mode === "social" && styles.modeOptionTextActive]}>
                Social
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeOption, profile.mode === "professional" && styles.modeOptionActive]}
              onPress={() => updateProfile({ mode: "professional" })}
            >
              <Text style={[styles.modeOptionText, profile.mode === "professional" && styles.modeOptionTextActive]}>
                Professional
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

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>VISIBILITY</Text>
          <View style={styles.visibilityCard}>
            <View style={styles.visibilityRow}>
              <View style={[styles.visibilityDot, { backgroundColor: profile.isVisible ? "#06D6A0" : "#A8A3B8" }]} />
              <Text style={styles.visibilityLabel}>
                {profile.isVisible ? "Visible to nearby people" : "Hidden"}
              </Text>
              <Switch
                value={profile.isVisible}
                onValueChange={toggleVisibility}
                trackColor={{ false: "#EEEBF2", true: "#12101C" }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={styles.visibilityHint}>
              {profile.isVisible
                ? "You're discoverable by people in the same space."
                : "You won't appear to anyone nearby."}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.primaryButton}
          onPress={() => navigation.navigate("EditProfile")}
        >
          <Text style={styles.primaryButtonText}>Edit profile</Text>
        </Pressable>
      </ScrollView>

      {/* Brand + settings float over the hero, respecting safe area top */}
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

  // ── Hero (mirrors ProfileDetailScreen) ──
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
  heroOverlayFull: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.12)",
  },
  heroOverlayBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: "rgba(0,0,0,0.58)",
  },
  heroContent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    gap: 6,
  },
  heroName: {
    fontSize: 30,
    fontWeight: "800",
    color: "#FFFFFF",
    lineHeight: 36,
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

  // ── Debug ──
  debugText: {
    fontSize: 11,
    color: "#A8A3B8",
    paddingHorizontal: 24,
    marginTop: -12,
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

  // Mode toggle
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
    backgroundColor: "#12101C",
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

  // Interests
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

  // Topics
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

  // Visibility
  visibilityCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EEEBF2",
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  visibilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  visibilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  visibilityLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#12101C",
  },
  visibilityHint: {
    fontSize: 13,
    lineHeight: 19,
    color: "#4A4458",
    marginLeft: 16,
  },

  // Edit button
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
})
