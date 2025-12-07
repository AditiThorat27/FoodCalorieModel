import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { login, register } from '../services/api';
import { COLORS, SIZES } from '../constants/theme';
import Button from '../components/Button';
import Input from '../components/Input';

export default function AuthScreen({ setIsAuthenticated }) {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [dob, setDob] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [gender, setGender] = useState('male');
    const [height, setHeight] = useState('');
    const [weight, setWeight] = useState('');

    const handleSubmit = async () => {
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                const profile = {
                    dob: dob,
                    gender: gender,
                    height: parseInt(height) || 0,
                    weight: parseInt(weight) || 0
                };
                await register(email, password, profile);
            }
            setIsAuthenticated(true);
        } catch (error) {
            Alert.alert('Error', error.response?.data?.msg || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.header}>
                        <Text style={styles.title}>{isLogin ? 'Welcome Back!' : 'Create Account'}</Text>
                        <Text style={styles.subtitle}>
                            {isLogin ? 'Sign in to track your healthy lifestyle.' : 'Join us to start your journey.'}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <Input
                            label="Email"
                            icon="mail-outline"
                            placeholder="hello@example.com"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                        <Input
                            label="Password"
                            icon="lock-closed-outline"
                            placeholder="••••••••"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        {!isLogin && (
                            <>
                                <View style={styles.row}>
                                    <View style={{ flex: 1, marginRight: 10 }}>
                                        <Input
                                            label="Height (cm)"
                                            placeholder="175"
                                            value={height}
                                            onChangeText={setHeight}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Input
                                            label="Weight (kg)"
                                            placeholder="70"
                                            value={weight}
                                            onChangeText={setWeight}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>

                                {/* Gender Selection */}
                                <Text style={styles.label}>Gender</Text>
                                <View style={styles.genderContainer}>
                                    <TouchableOpacity
                                        style={[styles.genderButton, gender === 'male' && styles.genderButtonActive]}
                                        onPress={() => setGender('male')}
                                    >
                                        <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>Male</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.genderButton, gender === 'female' && styles.genderButtonActive]}
                                        onPress={() => setGender('female')}
                                    >
                                        <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>Female</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Date of Birth */}
                                <Text style={styles.label}>Date of Birth</Text>
                                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                                    <Text style={styles.dateText}>{dob.toDateString()}</Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={dob}
                                        mode="date"
                                        display="default"
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (selectedDate) setDob(selectedDate);
                                        }}
                                        maximumDate={new Date()}
                                    />
                                )}
                            </>
                        )}

                        <Button
                            title={isLogin ? 'Sign In' : 'Sign Up'}
                            onPress={handleSubmit}
                            loading={loading}
                            style={{ marginTop: 20 }}
                        />

                        <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={styles.switchContainer}>
                            <Text style={styles.switchText}>
                                {isLogin ? "Don't have an account? " : "Already have an account? "}
                                <Text style={styles.switchTextBold}>{isLogin ? 'Sign Up' : 'Sign In'}</Text>
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollContent: {
        padding: SIZES.padding,
        flexGrow: 1,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: SIZES.medium,
        color: COLORS.textSecondary,
    },
    form: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
    },
    switchContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    switchText: {
        color: COLORS.textSecondary,
        fontSize: SIZES.font,
    },
    switchTextBold: {
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 14,
        color: COLORS.textSecondary,
        marginBottom: 8,
        marginLeft: 5
    },
    genderContainer: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    genderButton: {
        flex: 1,
        padding: 15,
        backgroundColor: COLORS.inputBg,
        borderRadius: SIZES.radius,
        alignItems: 'center',
        marginRight: 10,
    },
    genderButtonActive: {
        backgroundColor: COLORS.primary,
    },
    genderText: {
        color: COLORS.textSecondary,
        fontWeight: '600',
    },
    genderTextActive: {
        color: 'white',
    },
    dateButton: {
        backgroundColor: COLORS.inputBg,
        padding: 15,
        borderRadius: SIZES.radius,
        marginBottom: 20,
    },
    dateText: {
        color: COLORS.text,
        fontSize: 16,
    },
});
