import { useState } from 'react'
import {
  View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'
import { useUser } from '../context/UserContext'
import { PRO_COLOR, SOCIAL_COLOR } from '../constants/modes'

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>

const PERKS = [
  { icon: '💼', title: 'Professional Mode', body: 'A separate identity for networking — kept apart from your social connections.' },
  { icon: '🔒', title: 'Separate conversations', body: 'Professional contacts never mix with social ones.' },
  { icon: '🎨', title: 'Distinct look', body: 'Navy colour scheme signals to others you\'re here to connect professionally.' },
  { icon: '🔄', title: 'Switch any time', body: 'Toggle between modes instantly from Discover or your profile.' },
]

export default function PaywallScreen({ navigation }: Props) {
  const { unlockProMode } = useUser()
  const [loading, setLoading] = useState(false)

  const handlePurchase = async () => {
    setLoading(true)
    try {
      /*
       * STRIPE INTEGRATION — wire up here when ready:
       *   1. Install: npx expo install @stripe/stripe-react-native
       *   2. Wrap App with <StripeProvider publishableKey={STRIPE_PK}>
       *   3. Call your Supabase Edge Function to create a PaymentIntent:
       *        const { clientSecret } = await fetch('/functions/v1/create-payment-intent', {
       *          method: 'POST', headers: { Authorization: `Bearer ${session.access_token}` },
       *          body: JSON.stringify({ amount: 499, currency: 'usd' })
       *        }).then(r => r.json())
       *   4. Present the sheet:
       *        const { error } = await initPaymentSheet({ paymentIntentClientSecret: clientSecret, ... })
       *        const { error: confirmError } = await presentPaymentSheet()
       *   5. On success, call unlockProMode() below.
       *
       * For now this simulates a successful purchase.
       */
      await unlockProMode()
      Alert.alert(
        'Professional Mode unlocked!',
        'Switch to Professional mode from Discover or your profile.',
        [{ text: 'Got it', onPress: () => navigation.goBack() }]
      )
    } catch (err) {
      Alert.alert('Purchase failed', err instanceof Error ? err.message : 'Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>PRO</Text>
        </View>

        <Text style={styles.title}>Unlock Professional Mode</Text>
        <Text style={styles.subtitle}>
          Build a second, completely separate professional network — without crossing wires with your social life.
        </Text>

        <View style={styles.perksBox}>
          {PERKS.map(perk => (
            <View key={perk.title} style={styles.perk}>
              <Text style={styles.perkIcon}>{perk.icon}</Text>
              <View style={styles.perkText}>
                <Text style={styles.perkTitle}>{perk.title}</Text>
                <Text style={styles.perkBody}>{perk.body}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.price}>$4.99</Text>
          <Text style={styles.priceSub}>one-time purchase</Text>
        </View>

        <Pressable
          style={[styles.buyButton, loading && styles.disabled]}
          onPress={handlePurchase}
          disabled={loading}
        >
          {loading
            ? <ActivityIndicator color="#FFFFFF" />
            : <Text style={styles.buyButtonText}>Unlock Professional Mode</Text>
          }
        </Pressable>

        <Text style={styles.legal}>
          Payment processed securely. No subscription — yours permanently.
        </Text>
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  scroll: { paddingHorizontal: 24, paddingBottom: 40, gap: 24 },
  backButton: { alignSelf: 'flex-start', paddingVertical: 12 },
  backText: { fontSize: 16, color: '#12101C', fontWeight: '500' },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: PRO_COLOR,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF', letterSpacing: 1.5 },
  title: { fontSize: 34, lineHeight: 40, fontWeight: '700', color: '#12101C' },
  subtitle: { fontSize: 15, lineHeight: 23, color: '#4A4458' },
  perksBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEEBF2',
    borderRadius: 20,
    padding: 20,
    gap: 20,
  },
  perk: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  perkIcon: { fontSize: 22, lineHeight: 28 },
  perkText: { flex: 1, gap: 3 },
  perkTitle: { fontSize: 15, fontWeight: '700', color: '#12101C' },
  perkBody: { fontSize: 13, lineHeight: 19, color: '#4A4458' },
  priceRow: { alignItems: 'center', gap: 4 },
  price: { fontSize: 40, fontWeight: '800', color: '#12101C' },
  priceSub: { fontSize: 14, color: '#A8A3B8' },
  buyButton: {
    backgroundColor: PRO_COLOR,
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  disabled: { opacity: 0.5 },
  buyButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  legal: { fontSize: 12, color: '#A8A3B8', textAlign: 'center', lineHeight: 18 },
})
