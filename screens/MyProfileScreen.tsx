import { SafeAreaView, View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native'

const MOCK_PROFILE = {
  name: 'Alex T.',
  age: 27,
  mode: 'social' as const,
  bio: 'Product designer with a side obsession for bouldering and fermented foods. Currently figuring out what the next chapter looks like.',
  interests: ['Design', 'Bouldering', 'Food', 'Music', 'Travel'],
  visibility: 'visible' as const,
}

const MODE_ACCENT: Record<'social' | 'professional', string> = {
  social: '#FF2D87',
  professional: '#4F46E5',
}

const VISIBILITY_CONFIG = {
  visible: {
    label: 'Visible to nearby people',
    dot: '#06D6A0',
    hint: "You're discoverable by people in the same space.",
  },
  hidden: {
    label: 'Hidden',
    dot: '#A8A3B8',
    hint: "You won't appear to anyone nearby.",
  },
  'nearby-only': {
    label: 'Nearby only',
    dot: '#FF9F1C',
    hint: 'Only people within 10 metres can see you.',
  },
}

export default function MyProfileScreen() {
  const profile = MOCK_PROFILE
  const accent = MODE_ACCENT[profile.mode]
  const initials = profile.name.split(' ').map(p => p[0]).join('')
  const vis = VISIBILITY_CONFIG[profile.visibility]

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.brand}>Proximity</Text>

        <View style={styles.profileHeader}>
          <View style={[styles.avatar, { backgroundColor: accent + '20' }]}>
            <Text style={[styles.avatarText, { color: accent }]}>{initials}</Text>
          </View>
          <Text style={styles.name}>{profile.name}, {profile.age}</Text>
          <View style={[styles.modeChip, { backgroundColor: accent + '18' }]}>
            <Text style={[styles.modeChipText, { color: accent }]}>
              {(profile.mode as string) === "professional" ? "💼" : "🟡"} {profile.mode} profile
            </Text>
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
          <Text style={styles.sectionLabel}>VISIBILITY</Text>
          <View style={styles.visibilityCard}>
            <View style={styles.visibilityRow}>
              <View style={[styles.visibilityDot, { backgroundColor: vis.dot }]} />
              <Text style={styles.visibilityLabel}>{vis.label}</Text>
            </View>
            <Text style={styles.visibilityHint}>{vis.hint}</Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => Alert.alert('Edit profile', 'Profile editing coming soon.')}
          >
            <Text style={styles.primaryButtonText}>Edit profile</Text>
          </Pressable>

          <Pressable
            style={styles.secondaryButton}
            onPress={() => Alert.alert('Manage visibility', 'Visibility controls coming soon.')}
          >
            <Text style={styles.secondaryButtonText}>Manage visibility</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 28,
  },
  brand: {
    fontSize: 22,
    fontWeight: '700',
    color: '#12101C',
  },

  // Header
  profileHeader: {
    gap: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
  },
  name: {
    fontSize: 28,
    fontWeight: '800',
    color: '#12101C',
    lineHeight: 34,
  },
  modeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  modeChipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },

  // Sections
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#12101C',
    letterSpacing: 1,
  },
  bio: {
    fontSize: 15,
    lineHeight: 23,
    color: '#4A4458',
  },

  // Interests
  interestsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEBF2',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  interestText: {
    fontSize: 13,
    color: '#4A4458',
    fontWeight: '500',
  },

  // Visibility
  visibilityCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEBF2',
    borderRadius: 16,
    padding: 16,
    gap: 6,
  },
  visibilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visibilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  visibilityLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#12101C',
  },
  visibilityHint: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4A4458',
    marginLeft: 16,
  },

  // Actions
  actions: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#12101C',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEBF2',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#12101C',
    fontSize: 15,
    fontWeight: '600',
  },
})
