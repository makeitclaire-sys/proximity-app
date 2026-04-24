import { useState, useRef } from 'react'
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

type Props = NativeStackScreenProps<RootStackParamList, 'Code'>

export default function CodeScreen({ navigation }: Props) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const inputs = useRef<Array<TextInput | null>>([])

  const handleChange = (value: string, index: number) => {
    const digit = value.replace(/[^0-9]/g, '')
    if (digit.length > 1) return

    const newCode = [...code]
    newCode[index] = digit
    setCode(newCode)

    if (digit && index < 5) {
      inputs.current[index + 1]?.focus()
    }

    if (digit && index === 5) {
      Keyboard.dismiss()
    }
  }

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus()
    }
  }

  const isComplete = code.every(d => d !== '')

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
                We sent a 6-digit code to your number.
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
                    style={[
                      styles.codeBox,
                      digit ? styles.codeBoxFilled : null,
                    ]}
                  />
                ))}
              </View>

              <Pressable onPress={() => alert('Code resent')}>
                <Text style={styles.resendText}>Resend code</Text>
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.primaryButton, !isComplete && styles.primaryButtonDisabled]}
                onPress={() => {
                  if (isComplete) {
                    Keyboard.dismiss()
                    navigation.navigate('Username')
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>Verify</Text>
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
  resendText: {
    fontSize: 14,
    color: '#4A4458',
    textDecorationLine: 'underline',
    marginTop: 6,
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