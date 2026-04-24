import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { CameraView, useCameraPermissions } from 'expo-camera'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Selfie'>
type Stage = 'intro' | 'scanning' | 'verified'

const OVAL_W = 220
const OVAL_H = 280

export default function SelfieScreen({ navigation }: Props) {
  const [stage, setStage] = useState<Stage>('intro')
  const [permission, requestPermission] = useCameraPermissions()
  const pulseScale = useRef(new Animated.Value(1)).current
  const pulseOpacity = useRef(new Animated.Value(0.75)).current

  useEffect(() => {
    if (stage !== 'scanning') return

    pulseScale.setValue(1)
    pulseOpacity.setValue(0.75)

    const pulse = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseScale, {
          toValue: 1.28,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 1300,
          useNativeDriver: true,
        }),
      ])
    )
    pulse.start()

    const timer = setTimeout(() => {
      pulse.stop()
      setStage('verified')
    }, 3200)

    return () => {
      pulse.stop()
      clearTimeout(timer)
    }
  }, [stage])

  const handleStart = async () => {
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        Alert.alert(
          'Camera access needed',
          'Please allow camera access in Settings to verify your selfie.',
        )
        return
      }
    }
    setStage('scanning')
  }

  if (stage === 'intro') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.content}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <View style={styles.body}>
            <View style={styles.introCircle}>
              <Text style={styles.introEmoji}>🙂</Text>
            </View>
            <Text style={styles.title}>Verify it's you</Text>
            <Text style={styles.subtitle}>
              A quick face scan confirms you're a real person. Your selfie is never stored or shared.
            </Text>
          </View>

          <View style={styles.footer}>
            <Pressable style={styles.primaryButton} onPress={handleStart}>
              <Text style={styles.primaryButtonText}>Start scan</Text>
            </Pressable>
            <Text style={styles.helperText}>Takes less than 5 seconds.</Text>
          </View>
        </View>
      </SafeAreaView>
    )
  }

  if (stage === 'scanning') {
    return (
      <View style={styles.scanRoot}>
        <CameraView style={StyleSheet.absoluteFill} facing="front" />

        <View style={styles.scanDimmer}>
          <SafeAreaView style={styles.scanSafeArea} edges={['top', 'bottom']}>
            <Text style={styles.scanTitle}>Hold still…</Text>

            <View style={styles.ovalContainer}>
              <Animated.View
                style={[
                  styles.pulseRing,
                  { transform: [{ scale: pulseScale }], opacity: pulseOpacity },
                ]}
              />
              <View style={styles.oval} />
            </View>

            <Text style={styles.scanHint}>Scanning your face</Text>
          </SafeAreaView>
        </View>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <View style={styles.body}>
          <View style={styles.verifiedCircle}>
            <Text style={styles.verifiedCheck}>✓</Text>
          </View>
          <Text style={styles.title}>You're verified!</Text>
          <Text style={styles.subtitle}>
            Your identity is confirmed. Welcome to Proximity.
          </Text>
        </View>

        <View style={styles.footer}>
          <Pressable
            style={styles.primaryButton}
            onPress={() => navigation.navigate('ModePicker')}
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
  helperText: {
    fontSize: 12,
    lineHeight: 18,
    color: '#A8A3B8',
    textAlign: 'center',
  },

  // Intro illustration
  introCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEBF2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  introEmoji: {
    fontSize: 52,
  },

  // Scanning
  scanRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  scanSafeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 52,
  },
  scanTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  ovalContainer: {
    width: OVAL_W,
    height: OVAL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: OVAL_W,
    height: OVAL_H,
    borderRadius: OVAL_W / 2,
    borderWidth: 3,
    borderColor: '#06D6A0',
  },
  oval: {
    width: OVAL_W,
    height: OVAL_H,
    borderRadius: OVAL_W / 2,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  scanHint: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.65)',
  },

  // Verified
  verifiedCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(6, 214, 160, 0.1)',
    borderWidth: 2,
    borderColor: '#06D6A0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedCheck: {
    fontSize: 52,
    color: '#06D6A0',
    fontWeight: '700',
  },
})
