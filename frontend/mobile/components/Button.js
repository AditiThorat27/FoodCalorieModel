import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function Button({ title, onPress, loading, type = 'primary', style }) {
    const isPrimary = type === 'primary';
    const bgColors = isPrimary ? [COLORS.gradientStart, COLORS.gradientEnd] : [COLORS.surface, COLORS.surface];
    const textColor = isPrimary ? '#FFF' : COLORS.primary;

    return (
        <TouchableOpacity onPress={onPress} disabled={loading} activeOpacity={0.8} style={[styles.container, style]}>
            <LinearGradient
                colors={bgColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.gradient}
            >
                {loading ? (
                    <ActivityIndicator color={textColor} />
                ) : (
                    <Text style={[styles.text, { color: textColor }]}>{title}</Text>
                )}
            </LinearGradient>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        ...SHADOWS.medium,
    },
    gradient: {
        paddingVertical: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontSize: SIZES.medium,
        fontWeight: '600',
    },
});
