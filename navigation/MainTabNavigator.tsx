import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import DiscoverScreen from '../screens/DiscoverScreen'
import ConnectionsScreen from '../screens/ConnectionsScreen'
import MessagesScreen from '../screens/MessagesScreen'
import MyProfileScreen from '../screens/MyProfileScreen'
import type { TabParamList } from './types'

const Tab = createBottomTabNavigator<TabParamList>()

type IconName = React.ComponentProps<typeof Ionicons>['name']

const TAB_ICONS: Record<keyof TabParamList, [focused: IconName, unfocused: IconName]> = {
  Discover:    ['compass',                 'compass-outline'],
  Connections: ['people',                  'people-outline'],
  Messages:    ['chatbubble-ellipses',     'chatbubble-ellipses-outline'],
  MyProfile:   ['person',                  'person-outline'],
}

export default function MainTabNavigator() {
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
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen
        name="MyProfile"
        component={MyProfileScreen}
        options={{ title: 'My Profile' }}
      />
    </Tab.Navigator>
  )
}
