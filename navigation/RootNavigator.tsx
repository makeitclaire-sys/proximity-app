import HomeScreen from '../screens/HomeScreen'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { navigationRef } from './navigationRef'
import { supabase } from '../lib/supabase'
import WelcomeScreen from '../screens/WelcomeScreen'
import SignupScreen from '../screens/SignupScreen'
import EmailVerifyScreen from '../screens/EmailVerifyScreen'
import PasswordSetupScreen from '../screens/PasswordSetupScreen'
import LoginScreen from '../screens/LoginScreen'
import UsernameScreen from '../screens/UsernameScreen'
import BirthdayScreen from '../screens/BirthdayScreen'
import SelfieScreen from '../screens/SelfieScreen'
import ModePickerScreen from '../screens/ModePickerScreen'
import BasicsScreen from '../screens/BasicsScreen'
import DoneScreen from '../screens/DoneScreen'
import ProfileDetailScreen from '../screens/ProfileDetailScreen'
import EditProfileScreen from '../screens/EditProfileScreen'
import ChatScreen from '../screens/ChatScreen'
import PaywallScreen from '../screens/PaywallScreen'
import CreateRoomScreen from '../screens/CreateRoomScreen'
import JoinRoomScreen from '../screens/JoinRoomScreen'
import RoomCodeScreen from '../screens/RoomCodeScreen'
import MainTabNavigator from './MainTabNavigator'
import type { RootStackParamList } from './types'

export type { RootStackParamList }

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={async () => {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          navigationRef.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
        }
      }}
    >
      <Stack.Navigator initialRouteName="Welcome" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome"    component={WelcomeScreen} />
        <Stack.Screen name="Signup"     component={SignupScreen} />
        <Stack.Screen name="EmailVerify"    component={EmailVerifyScreen} />
        <Stack.Screen name="PasswordSetup"  component={PasswordSetupScreen} />
        <Stack.Screen name="Login"          component={LoginScreen} />
        <Stack.Screen name="Username"   component={UsernameScreen} />
        <Stack.Screen name="Birthday"   component={BirthdayScreen} />
        <Stack.Screen name="Selfie"     component={SelfieScreen} />
        <Stack.Screen name="ModePicker" component={ModePickerScreen} />
        <Stack.Screen name="Basics"     component={BasicsScreen} />
        <Stack.Screen name="Done"       component={DoneScreen} />
        <Stack.Screen name="Home"       component={HomeScreen} />
        <Stack.Screen name="MainTabs"   component={MainTabNavigator} />
        <Stack.Screen name="ProfileDetail" component={ProfileDetailScreen} />
        <Stack.Screen name="EditProfile"   component={EditProfileScreen} />
        <Stack.Screen name="Chat"          component={ChatScreen} />
        <Stack.Screen name="Paywall"        component={PaywallScreen} />
        <Stack.Screen name="CreateRoom"     component={CreateRoomScreen} />
        <Stack.Screen name="JoinRoom"       component={JoinRoomScreen} />
        <Stack.Screen name="RoomCode"       component={RoomCodeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
