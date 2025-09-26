import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from './styles/colors';
import { LoginScreen } from './screens/LoginScreen';
import { UserDashboard } from './screens/UserDashboard';
import { TechnicianDashboard } from './screens/TechnicianDashboard';
import { AdminDashboard } from './screens/AdminDashboard';
import ProfileScreen from './screens/ProfileScreen';
import TasksScreen from './screens/TasksScreen';
import { FileTextIcon, UserIcon, SettingsIcon } from './components/icons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom tab navigator for user screens
const UserTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00BFFF', // Bright cyan color like in the screenshot
        tabBarInactiveTintColor: '#888888',
        tabBarStyle: {
          backgroundColor: '#1A1A1A', // Dark background like in screenshot
          borderTopWidth: 1,
          borderTopColor: '#333',
          elevation: 10,
          height: 60,
          paddingBottom: 10,
          paddingTop: 5,
          // Remove position absolute to fix overlap issues
        },
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={UserDashboard} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <FileTextIcon size={size} color={color} />
          ),
          tabBarLabel: 'Dashboard'
        }}
      />
      <Tab.Screen 
        name="Tasks" 
        component={TasksScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <UserIcon size={size} color={color} />
          ),
          tabBarLabel: 'Tasks'
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarIcon: ({ color, size }) => (
            <SettingsIcon size={size} color={color} />
          ),
          tabBarLabel: 'Profile'
        }}
      />
    </Tab.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar 
          barStyle="dark-content" 
          backgroundColor={colors.surface} 
          translucent={false}
        />
        
        <Stack.Navigator 
          initialRouteName="Login"
          screenOptions={{
            headerShown: false,
            cardStyle: { backgroundColor: colors.background }
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="UserDashboard" component={UserTabNavigator} />
          <Stack.Screen name="TechnicianDashboard" component={TechnicianDashboard} />
          <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        </Stack.Navigator>
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});