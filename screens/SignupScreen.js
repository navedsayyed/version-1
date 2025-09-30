import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { colors } from '../styles/colors';
import { CustomButton } from '../components/CustomButton';
import { Card } from '../components/Card';
import { SettingsIcon, UserIcon, ArrowLeftIcon } from '../components/icons';
import { registerUser } from '../firebase/firebase';

const SignupScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    department: 'General'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);

  const roles = [
    { label: 'User', value: 'user' },
    { label: 'Technician', value: 'technician' }
  ];

  const departments = [
    { label: 'General', value: 'General' },
    { label: 'Electrical', value: 'Electrical' },
    { label: 'Plumbing', value: 'Plumbing' },
    { label: 'IT', value: 'IT' },
    { label: 'Maintenance', value: 'Maintenance' }
  ];

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSignup = async () => {
    // Reset error
    setError('');
    
    // Form validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    // Start registration process
    setIsLoading(true);
    
    try {
      const { user, error } = await registerUser(
        formData.email,
        formData.password,
        formData.name,
        formData.role,
        formData.department
      );
      
      setIsLoading(false);
      
      if (error) {
        setError(error.message || 'Failed to register. Please try again.');
      } else {
        // Registration successful
        navigation.navigate('Login');
      }
    } catch (err) {
      setIsLoading(false);
      setError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeftIcon size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Account</Text>
        <View style={{ width: 24 }} /> {/* Empty view for centering */}
      </View>

      <View style={styles.logoContainer}>
        <SettingsIcon size={48} color="#00BFFF" />
        <Text style={styles.logoText}>ComplaintPro</Text>
      </View>

      <Card>
        <Text style={styles.title}>Sign Up</Text>
        <Text style={styles.subtitle}>Fill in your details to register</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => handleChange('name', text)}
            placeholder="Enter your full name"
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
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
            value={formData.password}
            onChangeText={(text) => handleChange('password', text)}
            placeholder="Create a password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={formData.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
            placeholder="Confirm your password"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Role</Text>
          <TouchableOpacity
            style={styles.selectInput}
            onPress={() => setShowRoleModal(true)}
          >
            <Text style={styles.selectText}>
              {formData.role === 'user' ? 'User' : 'Technician'}
            </Text>
          </TouchableOpacity>
        </View>

        {formData.role === 'technician' ? (
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Department</Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowDeptModal(true)}
            >
              <Text style={styles.selectText}>
                {formData.department || 'Select Department'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <CustomButton
          title="Sign Up"
          onPress={handleSignup}
          size="large"
          disabled={isLoading}
          icon={UserIcon}
        />
        
        {isLoading && (
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLinkText}>Log In</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <Text style={styles.disclaimerText}>
        By signing up, you agree to our Terms of Service and Privacy Policy.
      </Text>

      {/* Role Selection Modal */}
      <Modal
        visible={showRoleModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Role</Text>
            {roles.map((role) => (
              <TouchableOpacity
                key={role.value}
                style={[
                  styles.modalOption,
                  formData.role === role.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  handleChange('role', role.value);
                  setShowRoleModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    formData.role === role.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {role.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowRoleModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Department Selection Modal */}
      <Modal
        visible={showDeptModal}
        transparent={true}
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Department</Text>
            {departments.map((dept) => (
              <TouchableOpacity
                key={dept.value}
                style={[
                  styles.modalOption,
                  formData.department === dept.value && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  handleChange('department', dept.value);
                  setShowDeptModal(false);
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    formData.department === dept.value && styles.modalOptionTextSelected,
                  ]}
                >
                  {dept.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.modalCancel}
              onPress={() => setShowDeptModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    color: colors.text,
    height: 48,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  selectInput: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  selectText: {
    color: colors.text,
    fontSize: 16,
  },
  errorText: {
    color: colors.error,
    marginBottom: 10,
    textAlign: 'center',
  },
  loaderContainer: {
    marginTop: 20,
    alignItems: 'center'
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  loginText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLinkText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  disclaimerText: {
    color: colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 24,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalOption: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalOptionSelected: {
    backgroundColor: `${colors.primary}20`,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
  },
  modalOptionTextSelected: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  modalCancel: {
    marginTop: 20,
    paddingVertical: 15,
    backgroundColor: colors.card,
    borderRadius: 8,
  },
  modalCancelText: {
    fontSize: 16,
    color: colors.error,
    textAlign: 'center',
    fontWeight: 'bold',
  }
});

export default SignupScreen;