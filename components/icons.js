import React from 'react';
import { View } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

// Wrapper components for consistent icon usage
export const CameraIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Ionicons name="camera" size={size} color={color} />
);

export const FileTextIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="file-text" size={size} color={color} />
);

export const CheckCircleIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="check-circle" size={size} color={color} />
);

export const ClockIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="clock" size={size} color={color} />
);

export const UsersIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="users" size={size} color={color} />
);

export const UserIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="user" size={size} color={color} />
);

export const SettingsIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="settings" size={size} color={color} />
);

export const MapPinIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="map-pin" size={size} color={color} />
);

export const CalendarIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="calendar" size={size} color={color} />
);

export const UploadIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="upload" size={size} color={color} />
);

export const BellIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="bell" size={size} color={color} />
);

export const FilterIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="filter" size={size} color={color} />
);

export const SearchIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <Feather name="search" size={size} color={color} />
);