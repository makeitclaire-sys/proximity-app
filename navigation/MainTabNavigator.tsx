import { useState, useEffect } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import DiscoverScreen from '../screens/DiscoverScreen'
import ConnectionsScreen from '../screens/ConnectionsScreen'
import MessagesScreen from '../screens/MessagesScreen'
import MyProfileScreen from '../screens/MyProfileScreen'
import type { TabParamList } from './types'
import { useUser } from '../context/UserContext'
import { supabase } from '../lib/supabase'

const Tab = createBottomTabNavigator<TabParamList>()

type IconName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<keyof TabParamList, [focused: IconName, unfocused: IconName]> = {
  Discover:    ['compass',                 'compass-outline'],
  Connections: ['people',                  'people-outline'],
  Messages:    ['chatbubble-ellipses',     'chatbubble-ellipses-outline'],
  MyProfile:   ['person',                  'person-outline'],
}

export default function MainTabNavigator() {
  const { profile } = useUser()
  const myId = profile.supabaseId
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!myId) return
    const channel = supabase
      .channel(`unread-${myId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const row = payload.new as Record<string, unknown>
          if (row.receiver_id === myId) setUnread(n => n + 1)
        }
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [myId])

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#12101C',
        tabBarInactiveTintColor: '#A8A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EEEBF2',
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const [active, inactive] = TAB_ICONS[route.name as keyof TabParamList]
          return <Ionicons name={focused ? active : inactive} size={size} color={color} />
        },
      })}
    >
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="Connections" component={ConnectionsScreen} />
      <Tab.Screen
        name="Messages"
        component={MessagesScreen}
        options={{ tabBarBadge: unread > 0 ? unread : undefined }}
        listeners={{ focus: () => setUnread(0) }}
      />
      <Tab.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  )
}
