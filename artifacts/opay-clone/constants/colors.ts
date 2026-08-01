/**
 * OPay brand color system — do not hardcode hex values in components.
 * Use useColors() hook which returns the active theme tokens.
 */
const colors = {
  light: {
    // Core aliases
    text: '#1A1A1A',
    tint: '#06C755',

    // Surfaces
    background: '#F5F6FA',
    foreground: '#1A1A1A',

    // Cards
    card: '#FFFFFF',
    cardForeground: '#1A1A1A',

    // Primary (OPay Green)
    primary: '#06C755',
    primaryForeground: '#FFFFFF',

    // Secondary
    secondary: '#E8F8EE',
    secondaryForeground: '#1A3A2A',

    // Muted
    muted: '#F0F0F0',
    mutedForeground: '#888888',

    // Accent
    accent: '#E8F8EE',
    accentForeground: '#06C755',

    // Destructive
    destructive: '#FF3B30',
    destructiveForeground: '#FFFFFF',

    // Borders
    border: '#E8E8E8',
    input: '#F5F5F5',

    // OPay-specific tokens
    headerGreen: '#06C755',
    darkGreen: '#04923E',
    darkNavy: '#1A3A2A',
    lightGreen: '#E8F8EE',
    warning: '#FF9500',
    info: '#007AFF',
    overlay: 'rgba(0,0,0,0.5)',
    greenOverlay: 'rgba(6,199,85,0.08)',
  },
  dark: {
    text: '#FFFFFF',
    tint: '#06C755',
    background: '#0D0D0D',
    foreground: '#FFFFFF',
    card: '#1C1C1E',
    cardForeground: '#FFFFFF',
    primary: '#06C755',
    primaryForeground: '#FFFFFF',
    secondary: '#1A2E21',
    secondaryForeground: '#06C755',
    muted: '#2C2C2E',
    mutedForeground: '#AEAEB2',
    accent: '#1A2E21',
    accentForeground: '#06C755',
    destructive: '#FF453A',
    destructiveForeground: '#FFFFFF',
    border: '#2C2C2E',
    input: '#2C2C2E',
    headerGreen: '#06C755',
    darkGreen: '#04923E',
    darkNavy: '#1A3A2A',
    lightGreen: '#1A2E21',
    warning: '#FF9F0A',
    info: '#0A84FF',
    overlay: 'rgba(0,0,0,0.7)',
    greenOverlay: 'rgba(6,199,85,0.12)',
  },
  radius: 12,
};

export default colors;
