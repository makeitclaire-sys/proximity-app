import { SafeAreaView, View, Text, Pressable, StyleSheet } from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { RootStackParamList } from '../navigation/RootNavigator'

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>

export default function HomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View>
          <Text style={styles.title}>Welcome to Proximity</Text>
          <Text style={styles.subtitle}>
            You’re now inside the app. Let’s see who’s around you.
          </Text>
        </View>

        <Pressable
          style={styles.button}
          onPress={() => navigation.navigate('MainTabs')}
        >
          <Text style={styles.buttonText}>Start discovering</Text>
        </Pressable>
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
    justifyContent: 'space-between',
    padding: 24,
    paddingTop: 80,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#12101C',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    color: '#4A4458',
  },
  button: {
    backgroundColor: '#12101C',
    paddingVertical: 16,
    borderRadius: 999,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
})