import { useEffect, useState } from 'react'
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { RootStackParamList } from '../navigation/RootNavigator'
import { useSignup } from '../context/SignupContext'
import { createProfile, updateProfile } from '../services/profileService'

type Props = NativeStackScreenProps<RootStackParamList, 'Done'>
type Stage = 'creating' | 'error'

export default function DoneScreen({ navigation }: Props) {
  const { userId, email, username, age, mode, status, bio, reset } = useSignup()

  const [stage, setStage]       = useState<Stage>('creating')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    create()
  }, [])

  const create = async () => {
    setStage('creating')
    try {
      if (!userId) throw new Error('No user session. Please start over.')
      await createProfile(userId, { name: username, age: age ?? 0, bio, mode, email })
      if (status) {
        await updateProfile(userId, { status }).catch(() => {})
      }
      reset()
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong.')
      setStage('error')
    }
  }

  if (stage === 'creating') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#12101C" />
          <Text style={styles.loadingText}>Setting up your profile…</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.centered}>
        <Text style={styles.errorText}>{errorMsg}</Text>
        <Pressable onPress={() => navigation.navigate('Welcome')} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Start over</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFB' },
  centered: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    gap: 16, paddingHorizontal: 24,
  },
  loadingText: { fontSize: 15, color: '#4A4458' },
  errorText: { fontSize: 15, color: '#FF2D87', textAlign: 'center' },
  backBtn: { marginTop: 8 },
  backBtnText: { fontSize: 15, color: '#4A4458', textDecorationLine: 'underline' },
})
