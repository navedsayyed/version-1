import React from 'react';
import { View } from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';

// Wrapper components for consistent icon usage
export const CameraIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Ionicons name="camera" size={size} color={color} />
  </View>
);

export const FileTextIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="file-text" size={size} color={color} />
  </View>
);

export const CheckCircleIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="check-circle" size={size} color={color} />
  </View>
);

export const ClockIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="clock" size={size} color={color} />
  </View>
);

export const UsersIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="users" size={size} color={color} />
  </View>
);

export const UserIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="user" size={size} color={color} />
  </View>
);

export const SettingsIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="settings" size={size} color={color} />
  </View>
);

export const MapPinIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="map-pin" size={size} color={color} />
  </View>
);

export const CalendarIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="calendar" size={size} color={color} />
  </View>
);

export const LayersIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="layers" size={size} color={color} />
  </View>
);

export const UploadIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="upload" size={size} color={color} />
  </View>
);

export const BellIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="bell" size={size} color={color} />
  </View>
);

export const FilterIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="filter" size={size} color={color} />
  </View>
);

export const SearchIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="search" size={size} color={color} />
  </View>
);

export const ArrowLeftIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="arrow-left" size={size} color={color} />
  </View>
);

export const StarIcon = ({ size = 24, color = '#FFFFFF' }) => (
  <View>
    <Feather name="star" size={size} color={color} />
  </View>
);