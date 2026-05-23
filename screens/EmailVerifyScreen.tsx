import { useRef, useState } from 'react'
import {
  View, Text, Pressable, TextInput, StyleSheet,
  Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView,
  ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'
import { supabase } from '../lib/supabase'
import { useSignup } from '../context/SignupContext'

type Props = NativeStackScreenProps<RootStackParamList, 'EmailVerify'>
type Stage = 'email' | 'code'

const RESEND_COOLDOWN = 30

export default function EmailVerifyScreen({ navigation }: Props) {
  const { setEmail, setUserId } = useSignup()

  const [stage, setStage]   = useState<Stage>('email')
  const [email, setLocalEmail] = useState('')
  const [loading, setLoading]  = useState(false)
  const [code, setCode]        = useState(['', '', '', '', '', ''])
  const [cooldown, setCooldown] = useState(0)
  const inputs  = useRef<Array<TextInput | null>>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())

  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const extractMessage = (err: unknown): string => {
    if (err instanceof Error) return err.message
    if (err && typeof err === 'object' && 'message' in err) return String((err as any).message)
    return 'Could not send code. Please try again.'
  }

  const sendCode = async () => {
    if (!emailValid || loading) return
    Keyboard.dismiss()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({ email: email.trim() })
      if (error) throw error
      setStage('code')
      startCooldown()
    } catch (err: unknown) {
      const msg = extractMessage(err)
      const isRateLimit = msg.toLowerCase().includes('rate') || msg.toLowerCase().includes('security purposes')
      Alert.alert(
        isRateLimit ? 'Too many requests' : 'Could not send code',
        isRateLimit
          ? 'Supabase limits verification emails during development. Please wait a few minutes and try again, or set up a custom SMTP provider in your Supabase dashboard.'
          : msg
      )
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (cooldown > 0) return
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() })
    if (error) {
      const msg = extractMessage(error)
      Alert.alert('Could not resend', msg)
    } else {
      startCooldown()
    }
  }

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '')
    if (digit.length > 1) return
    const next = [...code]
    next[index] = digit
    setCode(next)
    if (digit && index < 5) inputs.current[index + 1]?.focus()
    if (digit && index === 5) Keyboard.dismiss()
  }

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const isComplete = code.every(d => d !== '')

  const verify = async () => {
    if (!isComplete || loading) return
    Keyboard.dismiss()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.join(''),
        type: 'email',
      })
      if (error) throw error
      const userId = data.user?.id
      if (!userId) throw new Error('Could not get user ID.')
      setEmail(email.trim())
      setUserId(userId)
      navigation.navigate('PasswordSetup')
    } catch (err: unknown) {
      Alert.alert('Invalid code', err instanceof Error ? err.message : 'Try again.')
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  // ── Email input ───────────────────────────────────────────────────────────
  if (stage === 'email') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <KeyboardAvoidingView style={styles.flex} behavior="padding">
          <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            <View style={styles.content}>
              <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                <Text style={styles.backText}>← Back</Text>
              </Pressable>

              <View style={styles.body}>
                <Text style={styles.title}>What's your email?</Text>
                <Text style={styles.subtitle}>
                  We'll send a 6-digit code to verify it's really you.
                </Text>
                <TextInput
                  placeholder="you@example.com"
                  placeholderTextColor="#A8A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  value={email}
                  onChangeText={setLocalEmail}
                  returnKeyType="done"
                  onSubmitEditing={sendCode}
                  editable={!loading}
                />
              </View>

              <View style={styles.footer}>
                <Pressable
                  style={[styles.primaryButton, (!emailValid || loading) && styles.disabled]}
                  onPress={sendCode}
                  disabled={!emailValid || loading}
                >
                  {loading
                    ? <ActivityIndicator color="#FFFFFF" />
                    : <Text style={styles.primaryButtonText}>Send code</Text>
                  }
                </Pressable>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  // ── Code entry ────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.content}>
            <Pressable onPress={() => setStage('email')} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <View style={styles.body}>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to{'\n'}
                <Text style={styles.highlight}>{email.trim()}</Text>
              </Text>

              <View style={styles.codeRow}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={el => { inputs.current[index] = el }}
                    value={digit}
                    onChangeText={v => handleChange(v, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={[styles.codeBox, digit ? styles.codeBoxFilled : null]}
                  />
                ))}
              </View>

              <Pressable onPress={resend} disabled={cooldown > 0}>
                <Text style={cooldown > 0 ? styles.resendDisabled : styles.resendText}>
                  {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.primaryButton, (!isComplete || loading) && styles.disabled]}
                onPress={verify}
                disabled={!isComplete || loading}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.primaryButtonText}>Verify email</Text>
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
  body: { flex: 1, justifyContent: 'center', gap: 20 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '700', color: '#12101C' },
  subtitle: { fontSize: 15, lineHeight: 23, color: '#4A4458', maxWidth: 320 },
  highlight: { fontWeight: '600', color: '#12101C' },
  input: {
    backgroundColor: '#FFFFFF', borderRadius: 18, borderWidth: 1,
    borderColor: '#EEEBF2', paddingHorizontal: 16, paddingVertical: 18,
    fontSize: 17, color: '#12101C',
  },
  codeRow: {
    flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: 8,
  },
  codeBox: {
    width: 48, height: 60, borderRadius: 14,
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#EEEBF2',
    textAlign: 'center', fontSize: 24, fontWeight: '600', color: '#12101C',
  },
  codeBoxFilled: { borderColor: '#12101C' },
  resendText: { fontSize: 14, color: '#4A4458', textDecorationLine: 'underline' },
  resendDisabled: { fontSize: 14, color: '#A8A3B8' },
  footer: { gap: 14 },
  primaryButton: {
    backgroundColor: '#12101C', paddingVertical: 16,
    borderRadius: 999, alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
})
