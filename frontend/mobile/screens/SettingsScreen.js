import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { getProfile, updateProfile, changePassword } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import Button from '../components/Button';
import Input from '../components/Input';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const [profile, setProfile] = useState(null);
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    // Modals
    const [editProfileVisible, setEditProfileVisible] = useState(false);
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);

    // Edit Profile State
    const [editDob, setEditDob] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [editGender, setEditGender] = useState('male');
    const [editHeight, setEditHeight] = useState('');
    const [editWeight, setEditWeight] = useState('');
    const [loading, setLoading] = useState(false);

    // Change Password State
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        loadProfile();
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const notif = await AsyncStorage.getItem('notifications');
            const dark = await AsyncStorage.getItem('darkMode');
            if (notif !== null) setNotifications(JSON.parse(notif));
            if (dark !== null) setDarkMode(JSON.parse(dark));
        } catch (e) {
            console.error(e);
        }
    };

    const saveSettings = async (key, value) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(e);
        }
    };

    const loadProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
            if (data.profile) {
                if (data.profile.dob) setEditDob(new Date(data.profile.dob));
                if (data.profile.gender) setEditGender(data.profile.gender);
                setEditHeight(data.profile.height ? data.profile.height.toString() : '');
                setEditWeight(data.profile.weight ? data.profile.weight.toString() : '');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        try {
            const updatedProfile = {
                dob: editDob,
                gender: editGender,
                height: parseInt(editHeight) || 0,
                weight: parseInt(editWeight) || 0
            };
            const res = await updateProfile(updatedProfile);
            setProfile(res);
            setEditProfileVisible(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error) {
            Alert.alert('Error', 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async () => {
        setLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            setChangePasswordVisible(false);
            setCurrentPassword('');
            setNewPassword('');
            Alert.alert('Success', 'Password changed successfully');
        } catch (error) {
            Alert.alert('Error', error.response?.data?.msg || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Logout",
                    style: "destructive",
                    onPress: async () => {
                        await SecureStore.deleteItemAsync('token');
                        alert('Logged out. Please restart the app.');
                    }
                }
            ]
        );
    };

    const SettingItem = ({ icon, title, value, type = 'arrow', onPress }) => (
        <TouchableOpacity style={styles.settingItem} onPress={onPress} disabled={type === 'switch'}>
            <View style={styles.settingLeft}>
                <View style={styles.iconContainer}>
                    <Ionicons name={icon} size={20} color={COLORS.primary} />
                </View>
                <Text style={styles.settingTitle}>{title}</Text>
            </View>
            <View style={styles.settingRight}>
                {type === 'switch' ? (
                    <Switch
                        value={value}
                        onValueChange={(val) => {
                            onPress(val);
                            if (title === 'Notifications') {
                                setNotifications(val);
                                saveSettings('notifications', val);
                            } else if (title === 'Dark Mode') {
                                setDarkMode(val);
                                saveSettings('darkMode', val);
                            }
                        }}
                        trackColor={{ false: '#767577', true: COLORS.primary }}
                    />
                ) : (
                    <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
                )}
            </View>
        </TouchableOpacity>
    );

    const calculateAge = (dob) => {
        if (!dob) return '-';
        const birthDate = new Date(dob);
        const ageDifMs = Date.now() - birthDate.getTime();
        const ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.headerTitle}>Settings</Text>

                {/* Profile Card */}
                <View style={styles.profileCard}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {profile?.email?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.profileName}>{profile?.email?.split('@')[0] || 'User'}</Text>
                        <Text style={styles.profileEmail}>{profile?.email || 'Loading...'}</Text>
                    </View>
                    <TouchableOpacity onPress={loadProfile}>
                        <Ionicons name="reload-circle" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                {/* Stats Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile?.profile?.weight || '-'}</Text>
                        <Text style={styles.statLabel}>kg</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{profile?.profile?.height || '-'}</Text>
                        <Text style={styles.statLabel}>cm</Text>
                    </View>
                    <View style={styles.statDivider} />
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{calculateAge(profile?.profile?.dob)}</Text>
                        <Text style={styles.statLabel}>yrs</Text>
                    </View>
                </View>

                {/* Settings Sections */}
                <Text style={styles.sectionHeader}>Preferences</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="notifications-outline"
                        title="Notifications"
                        type="switch"
                        value={notifications}
                        onPress={() => { }}
                    />
                    <SettingItem
                        icon="moon-outline"
                        title="Dark Mode"
                        type="switch"
                        value={darkMode}
                        onPress={() => { }}
                    />
                </View>

                <Text style={styles.sectionHeader}>Account</Text>
                <View style={styles.section}>
                    <SettingItem icon="person-outline" title="Edit Profile" onPress={() => setEditProfileVisible(true)} />
                    <SettingItem icon="lock-closed-outline" title="Change Password" onPress={() => setChangePasswordVisible(true)} />
                    <SettingItem icon="help-circle-outline" title="Help & Support" onPress={() => Alert.alert('Support', 'Contact us at support@caloriespro.com')} />
                </View>

                <Button
                    title="Logout"
                    onPress={handleLogout}
                    style={{ marginTop: 20, backgroundColor: COLORS.error }}
                    type="secondary"
                />

                <Text style={styles.version}>Version 1.0.0</Text>
            </ScrollView>

            {/* Edit Profile Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={editProfileVisible}
                onRequestClose={() => setEditProfileVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Edit Profile</Text>

                        {/* Gender Selection */}
                        <Text style={styles.label}>Gender</Text>
                        <View style={styles.genderContainer}>
                            <TouchableOpacity
                                style={[styles.genderButton, editGender === 'male' && styles.genderButtonActive]}
                                onPress={() => setEditGender('male')}
                            >
                                <Text style={[styles.genderText, editGender === 'male' && styles.genderTextActive]}>Male</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.genderButton, editGender === 'female' && styles.genderButtonActive]}
                                onPress={() => setEditGender('female')}
                            >
                                <Text style={[styles.genderText, editGender === 'female' && styles.genderTextActive]}>Female</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Date of Birth */}
                        <Text style={styles.label}>Date of Birth</Text>
                        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
                            <Text style={styles.dateText}>{editDob.toDateString()}</Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={editDob}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) setEditDob(selectedDate);
                                }}
                                maximumDate={new Date()}
                            />
                        )}

                        <Input label="Height (cm)" value={editHeight} onChangeText={setEditHeight} keyboardType="numeric" />
                        <Input label="Weight (kg)" value={editWeight} onChangeText={setEditWeight} keyboardType="numeric" />

                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={() => setEditProfileVisible(false)} type="secondary" style={{ flex: 1, marginRight: 10 }} />
                            <Button title="Save" onPress={handleUpdateProfile} loading={loading} style={{ flex: 1 }} />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Change Password Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={changePasswordVisible}
                onRequestClose={() => setChangePasswordVisible(false)}
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Change Password</Text>

                        <Input label="Current Password" value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry />
                        <Input label="New Password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />

                        <View style={styles.modalButtons}>
                            <Button title="Cancel" onPress={() => setChangePasswordVisible(false)} type="secondary" style={{ flex: 1, marginRight: 10 }} />
                            <Button title="Update" onPress={handleChangePassword} loading={loading} style={{ flex: 1 }} />
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    scrollContent: { padding: SIZES.padding },
    headerTitle: { fontSize: 30, fontWeight: 'bold', color: COLORS.text, marginBottom: 20 },

    profileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: 15,
        borderRadius: SIZES.radius,
        ...SHADOWS.medium,
        marginBottom: 20,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    avatarText: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 18, fontWeight: 'bold', color: COLORS.text },
    profileEmail: { fontSize: 14, color: COLORS.textSecondary },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: COLORS.surface,
        padding: 20,
        borderRadius: SIZES.radius,
        ...SHADOWS.light,
        marginBottom: 30,
    },
    statItem: { alignItems: 'center', flex: 1 },
    statValue: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
    statLabel: { fontSize: 12, color: COLORS.textSecondary },
    statDivider: { width: 1, backgroundColor: COLORS.border },

    sectionHeader: { fontSize: 16, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 10, marginLeft: 5 },
    section: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radius,
        overflow: 'hidden',
        marginBottom: 20,
        ...SHADOWS.light,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.inputBg,
    },
    settingLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    iconContainer: {
        width: 35,
        height: 35,
        borderRadius: 8,
        backgroundColor: COLORS.inputBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    settingTitle: { fontSize: 16, color: COLORS.text },
    version: { textAlign: 'center', color: COLORS.textSecondary, marginTop: 20, fontSize: 12 },

    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 20,
    },
    modalContent: {
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radius,
        padding: 20,
        ...SHADOWS.medium,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButtons: {
        flexDirection: 'row',
        marginTop: 20,
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
