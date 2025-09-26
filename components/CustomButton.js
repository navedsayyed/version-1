import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { colors } from '../styles/colors';

export const CustomButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  size = 'medium', 
  icon: IconComponent, 
  disabled = false,
  style = {} 
}) => {
  const getButtonStyle = () => {
    const baseStyle = {
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    };

    const sizeStyles = {
      small: { 
        paddingVertical: 8, 
        paddingHorizontal: 16,
        gap: 6
      },
      medium: { 
        paddingVertical: 12, 
        paddingHorizontal: 24,
        gap: 8
      },
      large: { 
        paddingVertical: 16, 
        paddingHorizontal: 32,
        gap: 10
      }
    };

    const variantStyles = {
      primary: { backgroundColor: colors.primary },
      secondary: { backgroundColor: colors.secondary },
      outline: { 
        backgroundColor: 'transparent', 
        borderWidth: 2, 
        borderColor: colors.primary 
      },
      success: { backgroundColor: colors.success },
      error: { backgroundColor: colors.error }
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      opacity: disabled ? 0.6 : 1,
      ...style
    };
  };

  const getTextStyle = () => ({
    color: variant === 'outline' ? colors.primary : colors.text,
    fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
    fontWeight: '600'
  });

  const getIconColor = () => variant === 'outline' ? colors.primary : colors.text;
  const getIconSize = () => size === 'small' ? 16 : size === 'large' ? 24 : 20;

  return (
    <TouchableOpacity 
      style={getButtonStyle()} 
      onPress={onPress} 
      disabled={disabled}
      activeOpacity={0.8}
    >
      {IconComponent && (
        <IconComponent 
          size={getIconSize()} 
          color={getIconColor()} 
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};