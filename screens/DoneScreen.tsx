import { useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Defs, LinearGradient as SvgGradient, Stop, Circle } from 'react-native-svg'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'
import { useSignup } from '../context/SignupContext'
import { useUser } from '../context/UserContext'
import { createProfile } from '../services/profileService'
import { supabase } from '../lib/supabase'

type Props = NativeStackScreenProps<RootStackParamList, 'Done'>
type Mode = 'social' | 'professional'

const MODE_CONFIG: Record<Mode, { emoji: string; accent: string }> = {
  social:       { emoji: '👋', accent: '#FF2D87' },
  professional: { emoji: '💼', accent: '#4F46E5' },
}

export default function DoneScreen({ route, navigation }: Props) {
  const mode       = route.params.mode
  const other      = (mode === 'social' ? 'professional' : 'social') as Mode
  const otherAccent = MODE_CONFIG[other].accent
  const otherEmoji  = MODE_CONFIG[other].emoji

  const { username, age, status, bio, reset } = useSignup()
  const { refreshProfile } = useUser()
  const [creating, setCreating] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously()
      if (authError || !authData.user) {
        throw new Error(authError?.message ?? 'Could not create account.')
      }
      await createProfile(authData.user.id, {
        name: username,
        age: age ?? 0,
        bio,
        status,
        mode,
      })
      await refreshProfile()
      if (!cancelled) {
        reset()
        setCreating(false)
      }
    }

    run().catch((err: unknown) => {
      if (!cancelled) {
        setError(err instanceof Error ? err.message : 'Could not create profile.')
        setCreating(false)
      }
    })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (creating) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#12101C" />
          <Text style={styles.loadingText}>Setting up your profile…</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.secondaryLink}>Continue anyway</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>

        <View style={styles.header}>
          <Text style={styles.headline}>You're in.</Text>
          <Text style={styles.subtitle}>
            Your {mode} profile is live. Want to set up your {other} profile too?
          </Text>
        </View>

        <View style={styles.middle}>
          <View style={styles.avatarWrapper}>
            <Svg width={96} height={96}>
              <Defs>
                <SvgGradient id="grad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0" stopColor="#FF2D87" />
                  <Stop offset="1" stopColor="#FF8FAE" />
                </SvgGradient>
              </Defs>
              <Circle cx="48" cy="48" r="48" fill="url(#grad)" />
            </Svg>
            <Text style={styles.avatarEmoji}>🙂</Text>
          </View>

          <View style={[styles.card, { borderColor: otherAccent + '66' }]}>
            <Text style={styles.cardEmoji}>{otherEmoji}</Text>
            <View style={styles.cardText}>
              <Text style={styles.cardTitle}>Add your {other} profile</Text>
              <Text style={styles.cardDesc}>
                Different answers, different crowd, same account.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: otherAccent }]}
            onPress={() => Alert.alert('Coming soon', 'Add profile flow coming soon')}
          >
            <Text style={styles.primaryButtonText}>Set up my {other} profile</Text>
          </Pressable>

          <Pressable onPress={() => navigation.navigate('MainTabs')}>
            <Text style={styles.secondaryLink}>Maybe later — take me to Proximity</Text>
          </Pressable>
        </View>

      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFB',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 15,
    color: '#4A4458',
  },
  errorText: {
    fontSize: 15,
    color: '#FF2D87',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 16,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 24,
    gap: 12,
  },
  headline: {
    fontSize: 52,
    lineHeight: 56,
    fontWeight: '800',
    color: '#12101C',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: '#4A4458',
    maxWidth: 320,
  },
  middle: {
    alignItems: 'center',
    gap: 28,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    position: 'absolute',
    fontSize: 40,
  },
  card: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#12101C',
  },
  cardDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: '#4A4458',
  },
  footer: {
    gap: 16,
    alignItems: 'center',
  },
  primaryButton: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryLink: {
    fontSize: 14,
    color: '#4A4458',
    textDecorationLine: 'underline',
  },
})
