import type { Person } from '../data/mockPeople'

export type RootStackParamList = {
  Welcome: undefined
  Signup: undefined
  EmailVerify: undefined
  PasswordSetup: { mode?: 'setup' | 'reset' } | undefined
  Login: undefined
  Username: undefined
  Birthday: undefined
  Selfie: undefined
  ModePicker: undefined
  Basics: { mode?: 'social' | 'professional' } | undefined
  Done: { mode: 'social' | 'professional' }
  Home: undefined
  MainTabs: undefined
  ProfileDetail: { personId: string; profile?: Person }
  EditProfile: undefined
  Chat: { personId: string; name: string }
  Paywall: undefined
  CreateRoom: undefined
  JoinRoom: undefined
}

export type TabParamList = {
  Discover: undefined
  Connections: undefined
  Messages: undefined
  MyProfile: undefined
}
