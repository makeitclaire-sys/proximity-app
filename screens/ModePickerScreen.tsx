import { useState } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'ModePicker'>
type Mode = 'social' | 'professional'

const MODES: { id: Mode; emoji: string; title: string; desc: string; tint: string }[] = [
  {
    id: 'social',
    emoji: '👋',
    title: 'Social',
    desc: 'Meet people at events, parties, and coffee shops. Show your vibe and start conversations.',
    tint: 'rgba(255, 45, 135, 0.05)',
  },
  {
    id: 'professional',
    emoji: '💼',
    title: 'Professional',
    desc: "Network at conferences and coworking spaces. Show your role and what you're building.",
    tint: 'rgba(79, 70, 229, 0.05)',
  },
]

export default function ModePickerScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<Mode | null>(null)

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.body}>
          <Text style={styles.title}>How do you want{'\n'}to show up?</Text>
          <Text style={styles.subtitle}>
            Pick your primary mode. You can switch anytime from your profile.
          </Text>

          <View style={styles.cards}>
            {MODES.map((mode) => (
              <Pressable
                key={mode.id}
                style={[
                  styles.card,
                  { backgroundColor: mode.tint },
                  selected === mode.id && styles.cardSelected,
                ]}
                onPress={() => setSelected(mode.id)}
              >
                <Text style={styles.cardEmoji}>{mode.emoji}</Text>
                <Text style={styles.cardTitle}>{mode.title}</Text>
                <Text style={styles.cardDesc}>{mode.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={[styles.primaryButton, !selected && styles.primaryButtonDisabled]}
            onPress={() => {
              if (selected) {
                // navigate to home / main app
                alert(`Mode set: ${selected}. Next: home screen.`)
              }
            }}
          >
            <Text style={styles.primaryButtonText}>Continue</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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
  cards: {
    gap: 14,
    marginTop: 8,
  },
  card: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#EEEBF2',
    padding: 20,
    gap: 8,
  },
  cardSelected: {
    borderColor: '#12101C',
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#12101C',
  },
  cardDesc: {
    fontSize: 14,
    lineHeight: 21,
    color: '#4A4458',
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
