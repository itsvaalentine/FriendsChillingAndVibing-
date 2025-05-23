import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import FriendsScreen from '../screens/FriendsScreen';
import IAScreen from '../screens/IAScreen';
import MainScreen from '../screens/MainScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#2f1d1a',
          borderTopColor: '#3b2a28',
        },
        tabBarActiveTintColor: '#f5e8da',
        tabBarInactiveTintColor: '#a18677',
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Inicio') iconName = 'home';
          else if (route.name === 'Amigos') iconName = 'people';
          else if (route.name === 'Perfil') iconName = 'person';
          else if (route.name === 'IA Friend') iconName = 'rocket';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Inicio" component={MainScreen} />
      <Tab.Screen name="IA Friend" component={IAScreen} />
      <Tab.Screen name="Amigos" component={FriendsScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
