import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import WelcomeScreen from '../screens/WelcomeScreen'
import PhoneScreen from '../screens/PhoneEntry'
import CodeScreen from '../screens/CodeScreen'
import UsernameScreen from '../screens/UsernameScreen'
import BirthdayScreen from '../screens/BirthdayScreen'
import SelfieScreen from '../screens/SelfieScreen'
import ModePickerScreen from '../screens/ModePickerScreen'

export type RootStackParamList = {
  Welcome: undefined
  Phone: undefined
  Code: undefined
  Username: undefined
  Birthday: undefined
  Selfie: undefined
  ModePicker: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Phone" component={PhoneScreen} />
        <Stack.Screen name="Code" component={CodeScreen} />
        <Stack.Screen name="Username" component={UsernameScreen} />
        <Stack.Screen name="Birthday" component={BirthdayScreen} />
        <Stack.Screen name="Selfie" component={SelfieScreen} />
        <Stack.Screen name="ModePicker" component={ModePickerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}