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

type Props = NativeStackScreenProps<RootStackParamList, 'PasswordSetup'>

export default function PasswordSetupScreen({ navigation, route }: Props) {
  const mode = route.params?.mode ?? 'setup'
  const isReset = mode === 'reset'

  const [password, setPassword]       = useState('')
  const [confirm, setConfirm]         = useState('')
  const [showPass, setShowPass]       = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading]         = useState(false)

  const lengthOk  = password.length >= 8
  const matchesOk = password === confirm && confirm.length > 0
  const canSubmit = lengthOk && matchesOk

  const save = async () => {
    if (!canSubmit || loading) return
    Keyboard.dismiss()
    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      if (isReset) {
        // Existing user just reset their password — drop them into the app.
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
      } else {
        // Brand-new signup — continue collecting profile info.
        navigation.navigate('Username')
      }
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Could not set password.')
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
              <Text style={styles.title}>{isReset ? 'Reset your password' : 'Create a password'}</Text>
              <Text style={styles.subtitle}>
                {isReset
                  ? 'Choose a new password. At least 8 characters.'
                  : "At least 8 characters. You'll use this to log in."}
              </Text>

              <View style={styles.fieldGroup}>
                <View style={styles.inputRow}>
                  <TextInput
                    placeholder="Password"
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
                    secureTextEntry={!showConfirm}
                    style={styles.input}
                    value={confirm}
                    onChangeText={setConfirm}
                    returnKeyType="done"
                    onSubmitEditing={save}
                    editable={!loading}
                  />
                  <Pressable style={styles.eyeBtn} onPress={() => setShowConfirm(v => !v)}>
                    <Text style={styles.eyeText}>{showConfirm ? 'Hide' : 'Show'}</Text>
                  </Pressable>
                </View>

                {confirm.length > 0 && !matchesOk && (
                  <Text style={styles.errorHint}>Passwords don't match</Text>
                )}
                {password.length > 0 && !lengthOk && (
                  <Text style={styles.errorHint}>Must be at least 8 characters</Text>
                )}
              </View>
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.primaryButton, !canSubmit && styles.disabled]}
                onPress={save}
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
  errorHint: { fontSize: 13, color: '#FF2D87', paddingLeft: 4 },
  footer: { gap: 14 },
  primaryButton: {
    backgroundColor: '#12101C', paddingVertical: 16,
    borderRadius: 999, alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
})
