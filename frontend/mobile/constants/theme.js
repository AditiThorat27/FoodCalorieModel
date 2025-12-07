export const COLORS = {
    primary: '#4F46E5', // Indigo 600
    secondary: '#10B981', // Emerald 500
    accent: '#F59E0B', // Amber 500
    background: '#F9FAFB', // Gray 50
    surface: '#FFFFFF',
    text: '#1F2937', // Gray 800
    textSecondary: '#6B7280', // Gray 500
    error: '#EF4444', // Red 500
    success: '#10B981',
    border: '#E5E7EB', // Gray 200
    inputBg: '#F3F4F6', // Gray 100
    gradientStart: '#4F46E5',
    gradientEnd: '#818CF8',
};

export const SIZES = {
    base: 8,
    small: 12,
    font: 14,
    medium: 16,
    large: 18,
    extraLarge: 24,
    radius: 12,
    padding: 24,
};

export const FONTS = {
    regular: 'System', // Use system font for now, can add custom fonts later
    medium: 'System',
    bold: 'System',
};

export const SHADOWS = {
    light: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.text,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
};
