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

const PHASES = [
  { hint: 'Center your face in the oval',  color: 'rgba(255,255,255,0.85)' },
  { hint: 'Face found — hold still',       color: '#06D6A0' },
  { hint: 'Verifying your identity…',      color: '#06D6A0' },
] as const

export default function SelfieScreen({ navigation }: Props) {
  const [stage, setStage]   = useState<Stage>('intro')
  const [phase, setPhase]   = useState(0)
  const [permission, requestPermission] = useCameraPermissions()

  const scanLineY     = useRef(new Animated.Value(0)).current
  const pulseScale    = useRef(new Animated.Value(1)).current
  const pulseOpacity  = useRef(new Animated.Value(0.6)).current

  useEffect(() => {
    if (stage !== 'scanning') return

    // Scan line sweeps top → bottom → top, continuously
    const sweepAnim = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineY, {
          toValue: OVAL_H,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineY, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    )

    // Pulse ring expands and fades
    const pulseAnim = Animated.loop(
      Animated.parallel([
        Animated.timing(pulseScale,   { toValue: 1.22, duration: 950, useNativeDriver: true }),
        Animated.timing(pulseOpacity, { toValue: 0,    duration: 950, useNativeDriver: true }),
      ])
    )

    const resetPulse = () => {
      pulseScale.setValue(1)
      pulseOpacity.setValue(0.6)
    }

    sweepAnim.start()
    pulseAnim.start()

    // Phase 1: face found
    const t1 = setTimeout(() => {
      resetPulse()
      setPhase(1)
    }, 1600)

    // Phase 2: verifying
    const t2 = setTimeout(() => {
      resetPulse()
      setPhase(2)
    }, 2900)

    // Done
    const t3 = setTimeout(() => {
      sweepAnim.stop()
      pulseAnim.stop()
      setStage('verified')
    }, 4100)

    return () => {
      sweepAnim.stop()
      pulseAnim.stop()
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
      scanLineY.setValue(0)
      pulseScale.setValue(1)
      pulseOpacity.setValue(0.6)
      setPhase(0)
    }
  }, [stage])

  const handleStart = async () => {
    if (!permission?.granted) {
      const result = await requestPermission()
      if (!result.granted) {
        Alert.alert('Camera access needed', 'Please allow camera access in Settings.')
        return
      }
    }
    setStage('scanning')
  }

  // ─── Intro ───────────────────────────────────────────────────────────────
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

  // ─── Scanning ─────────────────────────────────────────────────────────────
  if (stage === 'scanning') {
    const { hint, color } = PHASES[phase]

    return (
      <View style={styles.scanRoot}>
        <CameraView style={StyleSheet.absoluteFill} facing="front" />

        <View style={styles.scanDimmer}>
          <SafeAreaView style={styles.scanSafeArea} edges={['top', 'bottom']}>

            <Text style={styles.scanTitle}>
              {phase === 0 ? 'Hold still…' : phase === 1 ? 'Face found!' : 'Verifying…'}
            </Text>

            {/* Oval + scan line + decorations */}
            <View style={styles.ovalContainer}>

              {/* Pulse ring */}
              <Animated.View
                style={[
                  styles.pulseRing,
                  {
                    borderColor: color,
                    transform: [{ scale: pulseScale }],
                    opacity: pulseOpacity,
                  },
                ]}
              />

              {/* Scan line clipped to oval shape */}
              <View style={styles.ovalClip}>
                <Animated.View
                  style={[
                    styles.scanLine,
                    { backgroundColor: color, transform: [{ translateY: scanLineY }] },
                  ]}
                />
              </View>

              {/* Oval border */}
              <View style={[styles.oval, { borderColor: color }]} />

              {/* Corner brackets */}
              <View style={[styles.corner, styles.cornerTL, { borderColor: color }]} />
              <View style={[styles.corner, styles.cornerTR, { borderColor: color }]} />
              <View style={[styles.corner, styles.cornerBL, { borderColor: color }]} />
              <View style={[styles.corner, styles.cornerBR, { borderColor: color }]} />
            </View>

            <Text style={styles.scanHint}>{hint}</Text>

          </SafeAreaView>
        </View>
      </View>
    )
  }

  // ─── Verified ─────────────────────────────────────────────────────────────
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

  // ── Scanning ──────────────────────────────────────
  scanRoot: {
    flex: 1,
    backgroundColor: '#000',
  },
  scanDimmer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
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
    letterSpacing: 0.2,
  },
  ovalContainer: {
    width: OVAL_W,
    height: OVAL_H,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Clips the scan line to the oval pill shape
  ovalClip: {
    position: 'absolute',
    width: OVAL_W,
    height: OVAL_H,
    borderRadius: OVAL_W / 2,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    width: OVAL_W,
    height: 2,
    opacity: 0.55,
  },
  oval: {
    position: 'absolute',
    width: OVAL_W,
    height: OVAL_H,
    borderRadius: OVAL_W / 2,
    borderWidth: 3,
  },
  pulseRing: {
    position: 'absolute',
    width: OVAL_W,
    height: OVAL_H,
    borderRadius: OVAL_W / 2,
    borderWidth: 3,
  },
  // Corner tracking brackets
  corner: {
    position: 'absolute',
    width: 22,
    height: 22,
  },
  cornerTL: {
    top: 12,
    left: 12,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 4,
  },
  cornerTR: {
    top: 12,
    right: 12,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 4,
  },
  cornerBL: {
    bottom: 12,
    left: 12,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 4,
  },
  cornerBR: {
    bottom: 12,
    right: 12,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 4,
  },
  scanHint: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 0.1,
  },

  // ── Verified ──────────────────────────────────────
  verifiedCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(6,214,160,0.1)',
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
