import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  TextInput,
  StyleSheet,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'
import { useSignup } from '../context/SignupContext'

type Props = NativeStackScreenProps<RootStackParamList, 'Basics'>

export default function BasicsScreen({ navigation, route }: Props) {
  const { setStatus: saveStatus, setBio: saveBio } = useSignup()
  // Try to read mode from route params; default to 'social'
  const mode = route.params?.mode || 'social'
  const accent = mode === 'professional' ? '#4F46E5' : '#FF2D87'

  const [status, setStatus] = useState('')
  const [affiliation, setAffiliation] = useState('')
  const [bio, setBio] = useState('')

  const canContinue =
    status.trim().length > 0 &&
    affiliation.trim().length > 0 &&
    bio.trim().length > 0

  const affiliationLabel =
    mode === 'professional' ? 'Where you work' : 'Notable affiliation'
  const affiliationPlaceholder =
    mode === 'professional'
      ? 'Company, role'
      : 'School, team, community, church'

  const statusPlaceholder =
    mode === 'professional'
      ? 'e.g. Founder, seed-stage'
      : 'e.g. New in town'

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior="padding">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View style={styles.content}>
            <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
              <Text style={styles.backText}>← Back</Text>
            </Pressable>

            <ScrollView
              style={styles.flex}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View
                style={[
                  styles.modeChip,
                  { backgroundColor: `${accent}15` },
                ]}
              >
                <Text style={[styles.modeChipText, { color: accent }]}>
                  {mode === 'professional' ? '💼' : '💫'} {mode} profile
                </Text>
              </View>

              <Text style={styles.title}>
                Tell us a little{'\n'}about yourself.
              </Text>
              <Text style={styles.subtitle}>You can edit any of this later.</Text>

              <View style={styles.field}>
                <Text style={styles.label}>STATUS</Text>
                <TextInput
                  placeholder={statusPlaceholder}
                  placeholderTextColor="#A8A3B8"
                  style={styles.input}
                  value={status}
                  onChangeText={setStatus}
                  maxLength={60}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>{affiliationLabel.toUpperCase()}</Text>
                <TextInput
                  placeholder={affiliationPlaceholder}
                  placeholderTextColor="#A8A3B8"
                  style={styles.input}
                  value={affiliation}
                  onChangeText={setAffiliation}
                  maxLength={80}
                  returnKeyType="next"
                />
              </View>

              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>BIO</Text>
                  <Text style={styles.charCounter}>{bio.length}/160</Text>
                </View>
                <TextInput
                  placeholder="What should people know about you?"
                  placeholderTextColor="#A8A3B8"
                  style={[styles.input, styles.bioInput]}
                  value={bio}
                  onChangeText={setBio}
                  maxLength={160}
                  multiline
                  textAlignVertical="top"
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                  blurOnSubmit
                />
              </View>
            </ScrollView>

            <View style={styles.footer}>
              <Pressable
                style={[
                  styles.primaryButton,
                  { backgroundColor: canContinue ? accent : '#A8A3B8' },
                ]}
                onPress={() => {
                  if (canContinue) {
                    Keyboard.dismiss()
                    saveStatus(status)
                    saveBio(bio)
                    navigation.navigate('Done', { mode })
                  }
                }}
              >
                <Text style={styles.primaryButtonText}>
                  Finish my {mode} profile
                </Text>
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
  scrollContent: {
    paddingTop: 8,
    paddingBottom: 20,
    gap: 18,
  },
  modeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  modeChipText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: '#12101C',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: '#4A4458',
    maxWidth: 320,
  },
  field: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#12101C',
    letterSpacing: 1,
  },
  charCounter: {
    fontSize: 11,
    color: '#A8A3B8',
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EEEBF2',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#12101C',
  },
  bioInput: {
    minHeight: 90,
    paddingTop: 14,
  },
  footer: {
    paddingTop: 10,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
})