import { useState, useRef, useEffect } from 'react'
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'
import { supabase } from '../lib/supabase'
import { useSignup } from '../context/SignupContext'

const RESEND_COOLDOWN = 30

type Props = NativeStackScreenProps<RootStackParamList, 'Code'>

export default function CodeScreen({ navigation }: Props) {
  const { phone, setUserId } = useSignup()
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN)
  const inputs = useRef<Array<TextInput | null>>([])
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start countdown on mount
  useEffect(() => {
    startCountdown()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const startCountdown = () => {
    setResendCooldown(RESEND_COOLDOWN)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setResendCooldown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '')
    if (digit.length > 1) return
    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)
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
        phone,
        token: code.join(''),
        type: 'sms',
      })
      if (error) throw error
      setUserId(data.user?.id ?? null)
      navigation.navigate('Username')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid code. Please try again.'
      Alert.alert('Invalid code', msg)
      setCode(['', '', '', '', '', ''])
      inputs.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (resendCooldown > 0 || !phone) return
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone })
      if (error) throw error
      Alert.alert('Code sent', `A new code was sent to ${phone}.`)
      startCountdown()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not resend code.'
      Alert.alert('Error', msg)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.content}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <View style={styles.body}>
              <Text style={styles.title}>Enter the code</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit code to {phone || 'your number'}.
              </Text>

              <View style={styles.codeRow}>
                {code.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(el) => { inputs.current[index] = el }}
                    value={digit}
                    onChangeText={(v) => handleChange(v, index)}
                    onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                    editable={!loading}
                    style={[styles.codeBox, digit ? styles.codeBoxFilled : null]}
                  />
                ))}
              </View>

              <Pressable
                onPress={resend}
                disabled={resendCooldown > 0}
                style={styles.resendRow}
              >
                {resendCooldown > 0 ? (
                  <Text style={styles.resendTextDisabled}>
                    Resend code in {resendCooldown}s
                  </Text>
                ) : (
                  <Text style={styles.resendText}>Resend code</Text>
                )}
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.primaryButton, (!isComplete || loading) && styles.primaryButtonDisabled]}
                onPress={verify}
                disabled={!isComplete || loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Verify</Text>
                )}
              </Pressable>

              <Text style={styles.helperText}>
                Wrong number?{' '}
                <Text style={styles.helperLink} onPress={() => navigation.goBack()}>
                  Go back to change it
                </Text>
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
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
    justifyContent: 'space-between',
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
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: 18,
  },
  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '700',
    color: '#12101C',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: '#4A4458',
    maxWidth: 320,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    gap: 8,
  },
  codeBox: {
    width: 48,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#EEEBF2',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '600',
    color: '#12101C',
  },
  codeBoxFilled: {
    borderColor: '#12101C',
  },
  resendRow: {
    alignSelf: 'flex-start',
  },
  resendText: {
    fontSize: 14,
    color: '#4A4458',
    textDecorationLine: 'underline',
  },
  resendTextDisabled: {
    fontSize: 14,
    color: '#A8A3B8',
  },
  footer: {
    gap: 14,
  },
  primaryButton: {
    backgroundColor: '#12101C',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.5,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 13,
    color: '#A8A3B8',
    textAlign: 'center',
  },
  helperLink: {
    color: '#4A4458',
    textDecorationLine: 'underline',
  },
})
