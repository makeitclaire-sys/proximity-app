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

type Props = NativeStackScreenProps<RootStackParamList, 'Birthday'>

export default function BirthdayScreen({ navigation }: Props) {
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')

  const dayInput = useRef<TextInput>(null)
  const yearInput = useRef<TextInput>(null)

  // Check if user is 18+
  const getAge = () => {
    const m = parseInt(month, 10)
    const d = parseInt(day, 10)
    const y = parseInt(year, 10)
    if (!m || !d || !y) return null

    const today = new Date()
    const birth = new Date(y, m - 1, d)
    let age = today.getFullYear() - birth.getFullYear()
    const beforeBirthday =
      today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
    if (beforeBirthday) age--
    return age
  }

  const age = getAge()
  const isValidDate =
    month.length >= 1 &&
    day.length >= 1 &&
    year.length === 4 &&
    parseInt(month, 10) >= 1 &&
    parseInt(month, 10) <= 12 &&
    parseInt(day, 10) >= 1 &&
    parseInt(day, 10) <= 31

  const isAdult = age !== null && age >= 18
  const isTooYoung = age !== null && age < 18 && year.length === 4

  const canContinue = isValidDate && isAdult

  const handleMonthChange = (v: string) => {
    const digits = v.replace(/[^0-9]/g, '').slice(0, 2)
    setMonth(digits)
    if (digits.length === 2) dayInput.current?.focus()
  }

  const handleDayChange = (v: string) => {
    const digits = v.replace(/[^0-9]/g, '').slice(0, 2)
    setDay(digits)
    if (digits.length === 2) yearInput.current?.focus()
  }

  const handleYearChange = (v: string) => {
    const digits = v.replace(/[^0-9]/g, '').slice(0, 4)
    setYear(digits)
    if (digits.length === 4) Keyboard.dismiss()
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
              <Text style={styles.title}>When's your birthday?</Text>
              <Text style={styles.subtitle}>
                You must be 18 or older to use Proximity. Your age shows; your exact date stays private.
              </Text>

              <View style={styles.inputsRow}>
                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>MONTH</Text>
                  <TextInput
                    placeholder="MM"
                    placeholderTextColor="#A8A3B8"
                    keyboardType="number-pad"
                    maxLength={2}
                    style={styles.input}
                    value={month}
                    onChangeText={handleMonthChange}
                    returnKeyType="next"
                  />
                </View>

                <View style={styles.inputBox}>
                  <Text style={styles.inputLabel}>DAY</Text>
                  <TextInput
                    ref={dayInput}
                    placeholder="DD"
                    placeholderTextColor="#A8A3B8"
                    keyboardType="number-pad"
                    maxLength={2}
                    style={styles.input}
                    value={day}
                    onChangeText={handleDayChange}
                    returnKeyType="next"
                  />
                </View>

                <View style={[styles.inputBox, styles.yearBox]}>
                  <Text style={styles.inputLabel}>YEAR</Text>
                  <TextInput
                    ref={yearInput}
                    placeholder="YYYY"
                    placeholderTextColor="#A8A3B8"
                    keyboardType="number-pad"
                    maxLength={4}
                    style={styles.input}
                    value={year}
                    onChangeText={handleYearChange}
                    returnKeyType="done"
                    onSubmitEditing={Keyboard.dismiss}
                  />
                </View>
              </View>

              {isTooYoung && (
                <Text style={styles.errorText}>
                  You must be 18 or older to use Proximity.
                </Text>
              )}

              {isAdult && (
                <Text style={styles.hintText}>
                  You'll appear as {age} on your profile.
                </Text>
              )}
            </View>

            <View style={styles.footer}>
              <Pressable
                style={[styles.primaryButton, !canContinue && styles.primaryButtonDisabled]}
                onPress={() => {
                  if (canContinue) {
                    Keyboard.dismiss()
                    navigation.navigate('Selfie')
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
  inputsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  inputBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEBF2',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
  },
  yearBox: {
    flex: 1.3,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#A8A3B8',
    letterSpacing: 1,
    marginBottom: 2,
  },
  input: {
    fontSize: 17,
    color: '#12101C',
    fontWeight: '500',
    padding: 0,
  },
  errorText: {
    color: '#FF2D87',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
    marginTop: 4,
  },
  hintText: {
    color: '#06D6A0',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 4,
    marginTop: 4,
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