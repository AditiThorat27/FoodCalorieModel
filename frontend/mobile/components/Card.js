import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

export default function Card({ children, style }) {
    return (
        <View style={[styles.container, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        padding: SIZES.padding / 1.5,
        ...SHADOWS.light,
        marginBottom: SIZES.base,
    },
});
