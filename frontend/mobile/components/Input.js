import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES } from '../constants/theme';

export default function Input({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, label }) {
    return (
        <View style={styles.container}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={styles.inputContainer}>
                {icon && <Ionicons name={icon} size={20} color={COLORS.textSecondary} style={styles.icon} />}
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textSecondary}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={secureTextEntry}
                    keyboardType={keyboardType}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SIZES.padding / 1.5,
    },
    label: {
        fontSize: SIZES.small,
        color: COLORS.textSecondary,
        marginBottom: 6,
        marginLeft: 4,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.inputBg,
        borderRadius: SIZES.radius,
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    icon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: SIZES.medium,
        color: COLORS.text,
    },
});
