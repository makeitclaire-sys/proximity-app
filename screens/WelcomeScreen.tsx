import { SafeAreaView, View, Text, Pressable, StyleSheet } from 'react-native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/RootNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundPink} />
      <View style={styles.backgroundBlue} />
      <View style={styles.backgroundLime} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.brand}>Proximity</Text>
        </View>

        <View style={styles.centerContent}>
          <Text style={styles.title}>
            Meet the people{'\n'}
            in the room.
          </Text>

          <Text style={styles.subtitle}>
            A quiet, opt-in way to discover and connect with the people
            physically near you at conferences, on campus, and in cafés.
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate('Phone')}
          >
            <Text style={styles.primaryButtonText}>Create your account</Text>
          </Pressable>

          <Pressable onPress={() => navigation.replace('MainTabs')}>
            <Text style={styles.secondaryButtonText}>Skip to the demo</Text>
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
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 32,
    justifyContent: 'space-between',
  },
  header: {
    paddingTop: 8,
  },
  brand: {
    fontSize: 28,
    fontWeight: '600',
    color: '#12101C',
  },
  centerContent: {
    gap: 20,
  },
  title: {
    fontSize: 44,
    lineHeight: 48,
    fontWeight: '700',
    color: '#12101C',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: '#4A4458',
    maxWidth: 300,
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
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  secondaryButtonText: {
    textAlign: 'center',
    color: '#4A4458',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  backgroundPink: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(255, 45, 135, 0.18)',
  },
  backgroundBlue: {
    position: 'absolute',
    bottom: -100,
    left: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(79, 70, 229, 0.10)',
  },
  backgroundLime: {
    position: 'absolute',
    top: '35%',
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(217, 246, 92, 0.18)',
  },
})