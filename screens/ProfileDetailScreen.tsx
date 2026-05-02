import { useState, useEffect } from 'react'
import { View, Text, Pressable, ScrollView, StyleSheet, Image } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'
import { mockPeople } from '../data/mockPeople'
import { useInteractions } from '../context/InteractionContext'
import { useUser } from '../context/UserContext'
import { supabaseProfilesCache } from '../services/profileService'
import { createConnection, getConnectionWith, type Connection } from '../services/connectionService'

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileDetail'>

const AVATAR_COLORS = [
  { bg: '#2D1B4E', fg: '#C084FC' },
  { bg: '#1B2D4E', fg: '#60A5FA' },
  { bg: '#1B4E2D', fg: '#4ADE80' },
]

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) & 0x7fffffff
  }
  return h
}

export default function ProfileDetailScreen({ navigation, route }: Props) {
  const person = route.params.profile
    ?? mockPeople.find(p => p.id === route.params.personId)
    ?? supabaseProfilesCache.get(route.params.personId)
  const { hideUser } = useInteractions()
  const { profile: myProfile } = useUser()
  const myId = myProfile.supabaseId
  const insets = useSafeAreaInsets()

  const [connection, setConnection] = useState<Connection | null>(null)

  useEffect(() => {
    if (myId == null || !person?.id) return
    getConnectionWith(myId, person.id).then(setConnection).catch(() => {})
  }, [myId, person?.id])

  if (!person) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.errorBack}>
          <Text style={styles.errorBackText}>← Back</Text>
        </Pressable>
        <Text style={styles.errorText}>Profile not found.</Text>
      </View>
    )
  }

  const avatarColor = AVATAR_COLORS[hashId(person.id) % AVATAR_COLORS.length] ?? AVATAR_COLORS[0]
  const initials = person.name.split(' ').map(p => p[0]).join('')

  const sentHi = connection?.type === "hi"
  const sentChat = connection?.type === "chat"
  const actionTaken = sentHi || sentChat

  const handleSendHi = () => {
    if (myId == null) return
    setConnection({ id: "", senderId: myId, receiverId: person.id, type: "hi", status: "pending", createdAt: "" })
    createConnection(myId, person.id, "hi").catch(() => {
      setConnection(null)
    })
  }

  const handleSendChat = () => {
    if (myId == null) return
    setConnection({ id: "", senderId: myId, receiverId: person.id, type: "chat", status: "pending", createdAt: "" })
    createConnection(myId, person.id, "chat").catch(() => {
      setConnection(null)
    })
    navigation.navigate("Chat", { personId: person.id, name: person.name })
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Math.max(insets.bottom, 16) + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Full-width hero ── */}
        <View style={styles.hero}>
          {person.avatarUrl ? (
            <Image
              source={{ uri: person.avatarUrl }}
              style={StyleSheet.absoluteFill}
              resizeMode="cover"
            />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: avatarColor.bg, justifyContent: 'center', alignItems: 'center' }]}>
              <Text style={[styles.heroInitials, { color: avatarColor.fg }]}>{initials}</Text>
            </View>
          )}

          {/* Dark tint over whole image, heavier band at the bottom for readability */}
          <View style={styles.heroOverlayFull} />
          <View style={styles.heroOverlayBottom} />

          {/* Name + meta pinned to bottom of hero */}
          <View style={[styles.heroContent, { paddingBottom: 20 }]}>
            <Text style={styles.heroName}>{person.name}, {person.age}</Text>
            <View style={styles.heroMetaRow}>
              {person.distance ? (
                <View style={styles.heroChip}>
                  <Text style={styles.heroChipText}>📍 {person.distance}</Text>
                </View>
              ) : null}
              {person.status ? (
                <Text style={styles.heroStatus}>{person.status}</Text>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── Profile sections ── */}
        <View style={styles.sections}>
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>ABOUT</Text>
            <Text style={styles.bio}>{person.bio}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>INTERESTS</Text>
            <View style={styles.interestsRow}>
              {(person.interests || []).map((interest, i) => (
                <View key={`interest-${i}`} style={styles.interestChip}>
                  <Text style={styles.interestText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>

          {(person.starters || []).length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>START A CONVERSATION</Text>
              <View style={styles.starterList}>
                {(person.starters || []).map((starter, i) => (
                  <View key={`starter-${i}`} style={styles.starterCard}>
                    <Text style={styles.starterText}>"{starter}"</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionLabel}>TALK TO ME ABOUT</Text>
            <View style={styles.topicList}>
              {(person.talkTopics || []).map((topic, i) => (
                <Text key={`talk-${i}`} style={styles.topicItem}>· {topic}</Text>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionLabel, styles.sectionLabelMuted]}>DON'T TALK TO ME ABOUT</Text>
            <View style={styles.topicList}>
              {(person.avoidTopics || []).map((topic, i) => (
                <Text key={`avoid-${i}`} style={styles.avoidTopicItem}>· {topic}</Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── Floating back button ── */}
      <Pressable
        style={[styles.backButton, { top: insets.top + 8 }]}
        onPress={() => navigation.goBack()}
        hitSlop={8}
      >
        <Text style={styles.backText}>← Back</Text>
      </Pressable>

      {/* ── Footer actions ── */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {actionTaken ? (
          <View style={styles.sentPill}>
            <Text style={styles.sentPillText}>
              {sentHi ? "Hi request sent" : "Chat request sent"}
            </Text>
          </View>
        ) : (
          <View style={styles.footerActions}>
            <View style={styles.primaryActions}>
              <Pressable style={styles.actionButton} onPress={handleSendHi}>
                <Text style={styles.actionButtonText}>Come say hi</Text>
              </Pressable>
              <Pressable style={styles.actionButton} onPress={handleSendChat}>
                <Text style={styles.actionButtonText}>Let's chat</Text>
              </Pressable>
            </View>
            <Pressable
              style={styles.notInterestedButton}
              onPress={() => { hideUser(person.id); navigation.goBack() }}
            >
              <Text style={styles.notInterestedText}>Not interested</Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  container: {
    flex: 1,
    backgroundColor: '#FAFAFB',
  },

  // Error state
  errorBack: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  errorBackText: {
    fontSize: 16,
    color: '#12101C',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 16,
    color: '#4A4458',
    marginTop: 12,
    paddingHorizontal: 24,
  },

  // Scroll
  scrollContent: {
    // paddingBottom set inline to incorporate safe area + footer height
  },

  // ── Hero ──
  hero: {
    width: '100%',
    height: 330,
    overflow: 'hidden',
    backgroundColor: '#1B1B2E',
  },
  heroInitials: {
    fontSize: 80,
    fontWeight: '800',
    letterSpacing: -2,
  },
  heroOverlayFull: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  heroOverlayBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: 'rgba(0,0,0,0.58)',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 22,
    gap: 6,
  },
  heroName: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 36,
    letterSpacing: -0.3,
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  heroChip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  heroChipText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  heroStatus: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '400',
  },

  // ── Floating back button ──
  backButton: {
    position: 'absolute',
    left: 16,
    backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
  },
  backText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },

  // ── Sections ──
  sections: {
    paddingHorizontal: 24,
    paddingTop: 28,
    gap: 28,
  },
  section: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#12101C',
    letterSpacing: 1,
  },
  sectionLabelMuted: {
    color: '#A8A3B8',
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

  // ── Footer ──
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    backgroundColor: '#FAFAFB',
    borderTopWidth: 1,
    borderTopColor: '#EEEBF2',
  },
  footerActions: {
    gap: 10,
  },
  primaryActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#12101C',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  notInterestedButton: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  notInterestedText: {
    fontSize: 14,
    color: '#A8A3B8',
    fontWeight: '500',
  },
  sentPill: {
    backgroundColor: '#F4F3F7',
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sentPillText: {
    fontSize: 14,
    color: '#A8A3B8',
    fontWeight: '500',
  },
})
