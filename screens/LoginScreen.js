import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, Modal, TouchableOpacity } from 'react-native';
import { colors } from '../styles/colors';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import { SettingsIcon, UserIcon, UsersIcon } from '../components/icons';

export const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const handleLogin = () => {
    if (email && password) {
      setShowRoleSelection(true);
    } else {
      Alert.alert('Error', 'Please enter email and password');
    }
  };

  const selectRole = (role) => {
    setShowRoleSelection(false);
    
    switch (role) {
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
        break;
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
            />
          </View>

          <CustomButton
            title="Sign In"
            onPress={handleLogin}
            size="large"
            icon={UserIcon}
          />
        </Card>
      </View>

      <Modal visible={showRoleSelection} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Your Role</Text>
            <Text style={styles.modalSubtitle}>Choose how you want to access the app</Text>

            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={styles.roleCard} 
                onPress={() => selectRole('user')}
                activeOpacity={0.8}
              >
                <UserIcon size={40} color={colors.primary} />
                <Text style={styles.roleTitle}>User</Text>
                <Text style={styles.roleDescription}>Submit and track complaints</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.roleCard} 
                onPress={() => selectRole('technician')}
                activeOpacity={0.8}
              >
                <SettingsIcon size={40} color={colors.secondary} />
                <Text style={styles.roleTitle}>Technician</Text>
                <Text style={styles.roleDescription}>Solve assigned complaints</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.roleCard} 
                onPress={() => selectRole('admin')}
                activeOpacity={0.8}
              >
                <UsersIcon size={40} color={colors.accent} />
                <Text style={styles.roleTitle}>Admin</Text>
                <Text style={styles.roleDescription}>Manage all complaints</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 32,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  roleContainer: {
    gap: 16,
  },
  roleCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 12,
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});