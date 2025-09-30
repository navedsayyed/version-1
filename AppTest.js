import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import EnvTest from './EnvTest';

// Temporarily using the EnvTest component to test environment variables
export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <EnvTest />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});