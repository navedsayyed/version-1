import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../styles/colors';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import { SettingsIcon, UserIcon, UsersIcon } from '../components/icons';
import { loginUser } from '../firebase/firebase';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    // Reset error
    setError('');
    
    // Form validation
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    
    // Start login process
    setIsLoading(true);
    
    try {
      const { user, error } = await loginUser(email, password);
      
      setIsLoading(false);
      
      if (error) {
        setError(error.message || 'Failed to login. Please check your credentials.');
        return;
      } 
      
      if (!user) {
        setError('No user found with these credentials');
        return;
      }
      
      // Login successful - navigate based on user role
      switch (user.role) {
        case 'user':
          navigation.navigate('UserDashboard');
          break;
        case 'technician':
          navigation.navigate('TechnicianDashboard');
          break;
        case 'admin':
          navigation.navigate('AdminDashboard');
          break;
        default:
          setError('Invalid user role. Please contact support.');
          break;
      }
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <View style={styles.logoContainer}>
          <SettingsIcon size={60} color="#00BFFF" />
          <Text style={styles.logoText}>ComplaintPro</Text>
          <Text style={styles.logoSubtext}>Efficient Complaint Management</Text>
        </View>

        <Card>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.textSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              placeholderTextColor={colors.textSecondary}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            size="large"
            icon={UserIcon}
            disabled={isLoading}
          />
          
          {isLoading && (
            <View style={styles.loaderContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.signupLinkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loginContainer: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 16,
  },
  logoSubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  errorText: {
    color: colors.error,
    marginVertical: 10,
    textAlign: 'center',
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  signupText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  signupLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});