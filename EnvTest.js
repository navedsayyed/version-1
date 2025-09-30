// Test file to verify that environment variables are working
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FIREBASE_PROJECT_ID } from '@env';

export default function EnvTest() {
  useEffect(() => {
    console.log('FIREBASE_PROJECT_ID:', FIREBASE_PROJECT_ID || 'Not loaded');
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Project ID: {FIREBASE_PROJECT_ID || 'Not loaded'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
  },
});