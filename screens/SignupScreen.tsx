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
import { useSignup } from '../context/SignupContext'

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>

export default function SignupScreen({ navigation }: Props) {
  const { setEmail: saveEmail, setUserId } = useSignup()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPass, setShowPass] = useState(false)
  const [showConf, setShowConf] = useState(false)
  const [loading, setLoading]   = useState(false)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const lengthOk   = password.length >= 8
  const matchesOk  = password === confirm && confirm.length > 0
  const canSubmit  = emailValid && lengthOk && matchesOk

  const createAccount = async () => {
    if (!canSubmit || loading) return
    Keyboard.dismiss()
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      })
      if (error) throw new Error(error.message)

      const userId = data.user?.id
      if (!userId) throw new Error('Could not create account. Please try again.')

      saveEmail(email.trim())
      setUserId(userId)
      navigation.navigate('Username')
    } catch (err: unknown) {
      Alert.alert('Sign up failed', err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setLoading(false)
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
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Enter your email and choose a password.</Text>

              <View style={styles.fieldGroup}>
                <TextInput
                  placeholder="Email"
                  placeholderTextColor="#A8A3B8"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  returnKeyType="next"
                  editable={!loading}
                />

                <View style={styles.inputRow}>
                  <TextInput
                    placeholder="Password (min. 8 characters)"
                    placeholderTextColor="#A8A3B8"
                    secureTextEntry={!showPass}
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    returnKeyType="next"
                    editable={!loading}
                  />
                  <Pressable style={styles.eyeBtn} onPress={() => setShowPass(v => !v)}>
                    <Text style={styles.eyeText}>{showPass ? 'Hide' : 'Show'}</Text>
                  </Pressable>
                </View>

                <View style={styles.inputRow}>
                  <TextInput
                    placeholder="Confirm password"
                    placeholderTextColor="#A8A3B8"
                    secureTextEntry={!showConf}
                    style={styles.input}
                    value={confirm}
                    onChangeText={setConfirm}
                    returnKeyType="done"
                    onSubmitEditing={createAccount}
                    editable={!loading}
                  />
                  <Pressable style={styles.eyeBtn} onPress={() => setShowConf(v => !v)}>
                    <Text style={styles.eyeText}>{showConf ? 'Hide' : 'Show'}</Text>
                  </Pressable>
                </View>

                {password.length > 0 && !lengthOk && (
                  <Text style={styles.errorHint}>Must be at least 8 characters</Text>
                )}
                {confirm.length > 0 && !matchesOk && (
                  <Text style={styles.errorHint}>Passwords don't match</Text>
                )}
              </View>
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.primaryButton, (!canSubmit || loading) && styles.disabled]}
                onPress={createAccount}
                disabled={!canSubmit || loading}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" />
                  : <Text style={styles.primaryButtonText}>Continue</Text>
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
  title: { fontSize: 34, lineHeight: 40, fontWeight: '700', color: '#12101C' },
  subtitle: { fontSize: 15, lineHeight: 23, color: '#4A4458' },
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
  errorHint: { fontSize: 13, color: '#FF3B30', paddingLeft: 4 },
  footer: { gap: 14 },
  primaryButton: {
    backgroundColor: '#12101C', paddingVertical: 16,
    borderRadius: 999, alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
})
