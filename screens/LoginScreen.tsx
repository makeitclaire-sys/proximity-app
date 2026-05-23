import { useState } from 'react'
import {
  View, Text, Pressable, TextInput, StyleSheet,
  Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView,
  ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'
import { supabase } from '../lib/supabase'
import { getEmailByUsername, getProfileById, createProfile } from '../services/profileService'
import { navigationRef } from '../navigation/navigationRef'

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>
type Stage = 'login' | 'forgot' | 'forgot_sent'

export default function LoginScreen({ navigation }: Props) {
  const [stage, setStage]       = useState<Stage>('login')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [resetId, setResetId]   = useState('')

  const resolveEmail = async (id: string): Promise<string | null> => {
    const trimmed = id.trim()
    if (trimmed.includes('@')) return trimmed
    return getEmailByUsername(trimmed)
  }

  const login = async () => {
    if (!identifier.trim() || !password || loading) return
    Keyboard.dismiss()
    setLoading(true)
    try {
      const email = await resolveEmail(identifier)
      if (!email) {
        Alert.alert('Not found', 'No account found with that username or email.')
        return
      }
      const { data: signInData, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // If profile doesn't exist yet (e.g. user confirmed email but profile wasn't created),
      // create a minimal one now so the app loads correctly.
      const userId = signInData.user?.id
      if (userId) {
        const existing = await getProfileById(userId)
        if (!existing) {
          const displayName = email.split('@')[0].replace(/[^a-zA-Z0-9_.]/g, '') || 'User'
          await createProfile(userId, { name: displayName, age: 0, bio: '', mode: 'social', email })
        }
      }

      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
      }
    } catch (err: unknown) {
      Alert.alert('Login failed', err instanceof Error ? err.message : 'Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const sendReset = async () => {
    if (!resetId.trim() || loading) return
    Keyboard.dismiss()
    setLoading(true)
    try {
      const email = await resolveEmail(resetId)
      if (!email) {
        Alert.alert('Not found', 'No account found with that username or email.')
        return
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      if (error) throw error
      setStage('forgot_sent')
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not send reset email.')
    } finally {
      setLoading(false)
    }
  }

  // ── Forgot password sent ──────────────────────────────────────────────────
  if (stage === 'forgot_sent') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>
          <View style={styles.body}>
            <Text style={styles.icon}>📬</Text>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a password reset link to the email on your account. Open it to set a new password.
            </Text>
          </View>
          <View style={styles.footer}>
            <Pressable style={styles.ghostButton} onPress={() => { setStage('login'); setResetId('') }}>
              <Text style={styles.ghostButtonText}>Back to log in</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  // ── Forgot password input ─────────────────────────────────────────────────
  if (stage === 'forgot') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.content}>
              <Pressable onPress={() => setStage('login')} style={styles.backButton}>
                <Text style={styles.backText}>← Back</Text>
              </Pressable>
              <View style={styles.body}>
                <Text style={styles.title}>Reset password</Text>
                <Text style={styles.subtitle}>
                  Enter your username or email and we'll send a reset link.
                </Text>
                <TextInput
                  placeholder="Username or email"
                  placeholderTextColor="#A8A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  value={resetId}
                  onChangeText={setResetId}
                  returnKeyType="done"
                  onSubmitEditing={sendReset}
                  editable={!loading}
                />
              </View>
              <View style={styles.footer}>
                <Pressable
                  style={[styles.primaryButton, (!resetId.trim() || loading) && styles.disabled]}
                  onPress={sendReset}
                  disabled={!resetId.trim() || loading}
                >
                  {loading
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={styles.primaryButtonText}>Send reset link</Text>
                  }
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.content}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <View style={styles.body}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Log in with your username or email.</Text>

              <View style={styles.fieldGroup}>
                <TextInput
                  placeholder="Username or email"
                  placeholderTextColor="#A8A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  value={identifier}
                  onChangeText={setIdentifier}
                  returnKeyType="next"
                  editable={!loading}
                />

                <View style={styles.inputRow}>
                  <TextInput
                    placeholder="Password"
                    placeholderTextColor="#A8A3B8"
                    secureTextEntry={!showPass}
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="done"
                    onSubmitEditing={login}
                    editable={!loading}
                  />
                  <Pressable style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
                    <Text style={styles.eyeText}>{showPass ? 'Hide' : 'Show'}</Text>
                  </Pressable>
                </View>

                <Pressable onPress={() => setStage('forgot')}>
                  <Text style={styles.forgotText}>Forgot password?</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.primaryButton, (!identifier.trim() || !password || loading) && styles.disabled]}
                onPress={login}
                disabled={!identifier.trim() || !password || loading}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.primaryButtonText}>Log in</Text>
                }
              </Pressable>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  content: {
    flex: 1, paddingHorizontal: 24, paddingBottom: 16, justifyContent: 'space-between',
  },
  backButton: { alignSelf: 'flex-start', paddingVertical: 12 },
  backText: { fontSize: 16, color: '#12101C', fontWeight: '500' },
  body: { flex: 1, justifyContent: 'center', gap: 24 },
  icon: { fontSize: 48 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '700', color: '#12101C' },
  subtitle: { fontSize: 15, lineHeight: 23, color: '#4A4458', maxWidth: 320 },
  fieldGroup: { gap: 12 },
  inputRow: { position: 'relative' },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1,
    borderColor: '#EEEBF2', paddingHorizontal: 16, paddingVertical: 18,
    paddingRight: 72, fontSize: 17, color: '#12101C',
  },
  eyeBtn: {
    position: 'absolute', right: 16, top: 0, bottom: 0, justifyContent: 'center',
  },
  eyeText: { fontSize: 13, fontWeight: '600', color: '#4A4458' },
  forgotText: { fontSize: 14, color: '#4A4458', textDecorationLine: 'underline' },
  footer: { gap: 14 },
  primaryButton: {
    backgroundColor: '#12101C', paddingVertical: 16,
    borderRadius: 999, alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
  ghostButton: {
    borderWidth: 1.5, borderColor: '#EEEBF2',
    paddingVertical: 15, borderRadius: 999, alignItems: 'center',
  },
  ghostButtonText: { color: '#4A4458', fontSize: 15, fontWeight: '500' },
})
