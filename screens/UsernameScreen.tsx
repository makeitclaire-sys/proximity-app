import { useState, useEffect } from 'react'
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'
import { useSignup } from '../context/SignupContext'

type Props = NativeStackScreenProps<RootStackParamList, 'Username'>

export default function UsernameScreen({ navigation }: Props) {
  const { setUsername: saveUsername } = useSignup()
  const [username, setUsername] = useState('')
  const [status, setStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle')

  // Fake availability check — runs whenever username changes
  useEffect(() => {
    if (username.length === 0) {
      setStatus('idle')
      return
    }

    // Basic validation: 3+ chars, only letters/numbers/dots/underscores
    const valid = /^[a-zA-Z0-9._]{3,20}$/.test(username)
    if (!valid) {
      setStatus('invalid')
      return
    }

    setStatus('checking')
    const timer = setTimeout(() => {
      // Fake check — "taken" if username is exactly "admin" or "test", otherwise available
      if (['admin', 'test', 'proximity'].includes(username.toLowerCase())) {
        setStatus('taken')
      } else {
        setStatus('available')
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [username])

  const isAvailable = status === 'available'

  const statusMessage = {
    idle: '',
    checking: 'Checking…',
    available: '✓ Available',
    taken: '✗ Taken',
    invalid: '3–20 characters, letters / numbers / . / _ only',
  }[status]

  const statusColor = {
    idle: '#A8A3B8',
    checking: '#A8A3B8',
    available: '#06D6A0',
    taken: '#FF2D87',
    invalid: '#FF2D87',
  }[status]

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.content}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <View style={styles.body}>
              <Text style={styles.title}>Pick a username</Text>
              <Text style={styles.subtitle}>
                This is how other people will find you. You can change it once.
              </Text>

              <View style={styles.inputRow}>
                <Text style={styles.atSymbol}>@</Text>
                <TextInput
                  placeholder="morgan.l"
                  placeholderTextColor="#A8A3B8"
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
              </View>

              {statusMessage !== '' && (
                <Text style={[styles.statusText, { color: statusColor }]}>
                  {statusMessage}
                </Text>
              )}
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.primaryButton, !isAvailable && styles.primaryButtonDisabled]}
                onPress={() => {
                  if (isAvailable) {
                    Keyboard.dismiss()
                    saveUsername(username)
                    navigation.navigate('Birthday')
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
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
    gap: 16,
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
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEEBF2',
    paddingHorizontal: 16,
    marginTop: 4,
  },
  atSymbol: {
    fontSize: 17,
    color: '#A8A3B8',
    fontWeight: '500',
    marginRight: 4,
  },
  input: {
    flex: 1,
    paddingVertical: 18,
    fontSize: 17,
    color: '#12101C',
  },
  statusText: {
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
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
    backgroundColor: '#A8A3B8',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
})