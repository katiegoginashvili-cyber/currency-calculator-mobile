export interface ThemeColors {
  // Backgrounds
  background: string;
  surface: string;
  surfaceSecondary: string;
  
  // Text
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Accents
  primary: string;
  success: string;
  error: string;
  warning: string;
  
  // UI Elements
  border: string;
  separator: string;
  inputBackground: string;
  
  // Legacy (for compatibility)
  pillBackground: string;
  pillText: string;
}

export const lightColors: ThemeColors = {
  // Backgrounds - clean whites
  background: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceSecondary: '#F8F9FA',
  
  // Text - dark grays
  text: '#1A1A1A',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  // Accents
  primary: '#0066FF',
  success: '#00C853',
  error: '#FF3B5C',
  warning: '#FFB800',
  
  // UI Elements
  border: '#E5E7EB',
  separator: '#F0F0F0',
  inputBackground: '#F3F4F6',
  
  // Legacy
  pillBackground: '#34C759',
  pillText: '#FFFFFF',
};

export const darkColors: ThemeColors = {
  // Backgrounds
  background: '#000000',
  surface: '#1C1C1E',
  surfaceSecondary: '#2C2C2E',
  
  // Text
  text: '#FFFFFF',
  textSecondary: '#8E8E93',
  textTertiary: '#636366',
  
  // Accents
  primary: '#0A84FF',
  success: '#30D158',
  error: '#FF453A',
  warning: '#FFD60A',
  
  // UI Elements
  border: '#38383A',
  separator: '#2C2C2E',
  inputBackground: '#2C2C2E',
  
  // Legacy
  pillBackground: '#30D158',
  pillText: '#FFFFFF',
};
