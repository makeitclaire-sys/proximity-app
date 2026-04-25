import { SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, Switch } from "react-native"
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
  const accent = MODE_ACCENT[profile.mode]
  const initials = profile.name.split(" ").map(p => p[0]).join("")

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>Proximity</Text>

        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: accent + "20" }]}>
            <Text style={[styles.avatarText, { color: accent }]}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile.name}, {profile.age}</Text>
        </View>

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

  // Header
  profileHeader: {
    gap: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#12101C",
    lineHeight: 34,
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

  // Sections
  section: {
    gap: 10,
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

  // Actions
  primaryButton: {
    backgroundColor: "#12101C",
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
})
