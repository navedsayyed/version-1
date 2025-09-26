import React from 'react';
import { View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export const SettingsIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <MaterialIcons name="settings" size={size} color={color} />
);