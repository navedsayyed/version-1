import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { colors } from './styles/colors';
import { LoginScreen } from './screens/LoginScreen';
import { UserDashboard } from './screens/UserDashboard';
import { TechnicianDashboard } from './screens/TechnicianDashboard';
import { AdminDashboard } from './screens/AdminDashboard';
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogin = (role) => {
    setCurrentUser(role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const renderCurrentScreen = () => {
    switch (currentUser) {
      case 'user':
        return <UserDashboard />;
      case 'technician':
        return <TechnicianDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <LoginScreen onLogin={handleLogin} />;
    }
  };

  return (
    <NavigationContainer>
      <View style={styles.container}>
        <StatusBar 
          barStyle="light-content" 
          backgroundColor={colors.surface} 
          translucent={false}
        />
        
        {renderCurrentScreen()}
        
        {currentUser && (
          <TouchableOpacity 
            style={styles.logoutButton} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        )}
      </View>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  logoutButton: {
    position: 'absolute',
    top: 50,
    right: 24,
    backgroundColor: colors.error,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1000,
  },
  logoutText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
});