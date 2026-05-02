import { useState } from 'react'
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
import CountryPickerModal from '../components/CountryPickerModal'
import { countryFlag, type Country } from '../data/countries'

const DEFAULT_COUNTRY: Country = { name: 'United States', code: 'US', dialCode: '1' }

type Props = NativeStackScreenProps<RootStackParamList, 'Phone'>

export default function PhoneScreen({ navigation }: Props) {
  const { setPhone } = useSignup()
  const [country, setCountry] = useState<Country>(DEFAULT_COUNTRY)
  const [phone, setLocalPhone] = useState('')
  const [pickerVisible, setPickerVisible] = useState(false)

  const digits = phone.replace(/\D/g, '')
  const isValid = digits.length >= 5 && country.dialCode.length + digits.length <= 15

  const handleContinue = () => {
    if (!isValid) return
    Keyboard.dismiss()
    const localNumber = digits.replace(/^0/, '')
    const formatted = `+${country.dialCode}${localNumber}`
    setPhone(formatted)
    navigation.navigate('Username')
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
              <Text style={styles.title}>What's your number?</Text>
              <Text style={styles.subtitle}>
                Your number is never shown to other users.
              </Text>

              <View style={styles.inputRow}>
                <Pressable
                  style={styles.countryCodeBox}
                  onPress={() => setPickerVisible(true)}
                >
                  <Text style={styles.flagText}>{countryFlag(country.code)}</Text>
                  <Text style={styles.countryCode}>+{country.dialCode}</Text>
                  <Text style={styles.chevron}>▾</Text>
                </Pressable>

                <TextInput
                  placeholder="Phone number"
                  placeholderTextColor="#A8A3B8"
                  keyboardType="phone-pad"
                  style={styles.input}
                  value={phone}
                  onChangeText={setLocalPhone}
                  returnKeyType="done"
                  onSubmitEditing={handleContinue}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.primaryButton, !isValid && styles.primaryButtonDisabled]}
                onPress={handleContinue}
                disabled={!isValid}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
              </Pressable>

              <Text style={styles.helperText}>
                By continuing, you agree to our Terms and Privacy Policy.
              </Text>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <CountryPickerModal
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        onSelect={c => { setCountry(c); setLocalPhone('') }}
      />
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
  inputRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#EEEBF2',
    overflow: 'hidden',
    marginTop: 10,
  },
  countryCodeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#EEEBF2',
  },
  flagText: {
    fontSize: 18,
  },
  countryCode: {
    fontSize: 15,
    color: '#12101C',
    fontWeight: '600',
  },
  chevron: {
    fontSize: 11,
    color: '#A8A3B8',
    marginTop: 1,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 18,
    fontSize: 17,
    color: '#12101C',
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
    fontSize: 12,
    lineHeight: 18,
    color: '#A8A3B8',
    textAlign: 'center',
  },
})
