import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'
import { mockPeople } from '../data/mockPeople'
import { useInteractions } from '../context/InteractionContext'
import { supabaseProfilesCache } from '../services/profileService'

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileDetail'>

const AVATAR_COLORS = [
  { bg: 'rgba(255, 45, 135, 0.12)', fg: '#FF2D87' },
  { bg: 'rgba(79, 70, 229, 0.12)',  fg: '#4F46E5' },
  { bg: 'rgba(6, 214, 160, 0.12)',  fg: '#06D6A0' },
]

export default function ProfileDetailScreen({ navigation, route }: Props) {
  const person = mockPeople.find(p => p.id === route.params.personId)
    ?? supabaseProfilesCache.get(route.params.personId)
  const { hiRequests, chatRequests, sendHi, sendChat, hideUser } = useInteractions()

  if (!person) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <Text style={styles.errorText}>Profile not found.</Text>
        </View>
      </SafeAreaView>
    )
  }

  const avatarColor = AVATAR_COLORS[(person.id - 1) % AVATAR_COLORS.length]
  const initials = person.name.split(' ').map(p => p[0]).join('')
  const sentHi = hiRequests.includes(person.id)
  const sentChat = chatRequests.includes(person.id)
  const actionTaken = sentHi || sentChat

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeader}>
            <View style={[styles.avatar, { backgroundColor: avatarColor.bg }]}>
              <Text style={[styles.avatarText, { color: avatarColor.fg }]}>{initials}</Text>
            </View>
            <Text style={styles.name}>{person.name}, {person.age}</Text>
            <View style={styles.chipRow}>
              <View style={styles.chip}>
                <Text style={styles.chipText}>📍 {person.distance}</Text>
              </View>
            </View>
            <Text style={styles.status}>{person.status}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ABOUT</Text>
            <Text style={styles.bio}>{person.bio}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>INTERESTS</Text>
            <View style={styles.interestsRow}>
              {person.interests.map((interest) => (
                <View key={interest} style={styles.interestChip}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>START A CONVERSATION</Text>
            <View style={styles.starterList}>
              {person.starters.map((starter, i) => (
                <View key={i} style={styles.starterCard}>
                  <Text style={styles.starterText}>"{starter}"</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TALK TO ME ABOUT</Text>
            <View style={styles.topicList}>
              {person.talkTopics?.map((topic, i) => (
                <Text key={i} style={styles.topicItem}>· {topic}</Text>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, styles.sectionLabelMuted]}>DON'T TALK TO ME ABOUT</Text>
            <View style={styles.topicList}>
              {person.avoidTopics?.map((topic, i) => (
                <Text key={i} style={styles.avoidTopicItem}>· {topic}</Text>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          {actionTaken ? (
            <View style={styles.sentPill}>
              <Text style={styles.sentPillText}>
                {sentHi ? "Hi request sent" : "Chat request sent"}
              </Text>
            </View>
          ) : (
            <View style={styles.footerActions}>
              <View style={styles.primaryActions}>
                <Pressable style={styles.actionButton} onPress={() => sendHi(person.id)}>
                  <Text style={styles.actionButtonText}>Come say hi</Text>
                </Pressable>
                <Pressable style={styles.actionButton} onPress={() => sendChat(person.id)}>
                  <Text style={styles.actionButtonText}>Let's chat</Text>
                </Pressable>
              </View>
              <Pressable
                style={styles.notInterestedButton}
                onPress={() => {
                  hideUser(person.id)
                  navigation.goBack()
                }}
              >
                <Text style={styles.notInterestedText}>Not interested</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 12,
  },
  backText: {
    fontSize: 16,
    color: '#12101C',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#4A4458',
    marginTop: 24,
  },
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 24,
    gap: 28,
  },

  // Header
  profileHeader: {
    gap: 8,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
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
  chipRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    backgroundColor: '#EEEBF2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    color: '#4A4458',
    fontWeight: '500',
  },
  status: {
    fontSize: 15,
    color: '#4A4458',
    lineHeight: 22,
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

  sectionLabelMuted: {
    color: '#A8A3B8',
  },

  // Topics
  topicList: {
    gap: 8,
  },
  topicItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#4A4458',
  },
  avoidTopicItem: {
    fontSize: 15,
    lineHeight: 22,
    color: '#A8A3B8',
  },

  // Starters
  starterList: {
    gap: 10,
  },
  starterCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEBF2',
    borderRadius: 16,
    padding: 16,
  },
  starterText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#12101C',
    fontStyle: 'italic',
  },

  // Footer
  footer: {
    paddingTop: 10,
  },
  footerActions: {
    gap: 10,
  },
  primaryActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#12101C",
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  notInterestedButton: {
    alignItems: "center",
    paddingVertical: 6,
  },
  notInterestedText: {
    fontSize: 14,
    color: "#A8A3B8",
    fontWeight: "500",
  },
  sentPill: {
    backgroundColor: "#F4F3F7",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  sentPillText: {
    fontSize: 14,
    color: "#A8A3B8",
    fontWeight: "500",
  },
})
