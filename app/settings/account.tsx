import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { API_ENDPOINTS } from '../../constants/config';

export default function AccountSettings() {
    const [displayName, setDisplayName] = useState('');
    const [originalName, setOriginalName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Password fields
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const name = await AsyncStorage.getItem('username');
            if (name) {
                setDisplayName(name);
                setOriginalName(name);
            }
        } catch (e) {
            Alert.alert('Error', 'Failed to load account data.');
        } finally {
            setLoading(false);
        }
    };

    const saveChanges = async () => {
        if (!displayName.trim()) {
            Alert.alert('Error', 'Display name cannot be empty.');
            return;
        }

        setSaving(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            await AsyncStorage.setItem('username', displayName.trim());

            // Sync with server for persistence across logins
            if (userId) {
                try {
                    await fetch(API_ENDPOINTS.updateUser(userId), {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ displayUsername: displayName.trim() })
                    });
                } catch (e) {
                    console.log('Error syncing with server:', e);
                }
            }

            setOriginalName(displayName.trim());
            Alert.alert('Success', 'Your name has been updated!');
        } catch (e) {
            Alert.alert('Error', 'Failed to save changes. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const changePassword = async () => {
        // Validation
        if (!oldPassword.trim()) {
            Alert.alert('Error', 'Please enter your current password.');
            return;
        }
        if (!newPassword.trim()) {
            Alert.alert('Error', 'Please enter a new password.');
            return;
        }
        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters.');
            return;
        }
        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match.');
            return;
        }
        if (oldPassword === newPassword) {
            Alert.alert('Error', 'New password must be different from old password.');
            return;
        }

        setSavingPassword(true);
        try {
            const userId = await AsyncStorage.getItem('userId');
            if (!userId) {
                Alert.alert('Error', 'Please log in again.');
                return;
            }

            const response = await fetch(API_ENDPOINTS.updateUser(userId), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    oldPassword: oldPassword,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to update password');
            }

            // Password changed - log out user so they must re-authenticate
            Alert.alert('Success', 'Your password has been updated! Please log in with your new password.', [
                {
                    text: 'OK',
                    onPress: async () => {
                        await AsyncStorage.clear();
                        router.replace('/login');
                    }
                }
            ]);
        } catch (e: any) {
            Alert.alert('Error', e.message || 'Failed to update password. Please check your current password and try again.');
        } finally {
            setSavingPassword(false);
        }
    };

    const hasNameChanges = displayName.trim() !== originalName;
    const hasPasswordInput = oldPassword.trim() && newPassword.trim() && confirmPassword.trim();

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#41E2BA" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Account Settings</Text>
                    <View style={{ width: 40 }} />
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Display Name Section */}
                    <Text style={styles.sectionTitle}>Profile</Text>
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Display Name</Text>
                            <TextInput
                                style={styles.input}
                                value={displayName}
                                onChangeText={setDisplayName}
                                placeholder="Enter your name"
                                placeholderTextColor="#999"
                                maxLength={30}
                            />
                            <Text style={styles.hint}>This is how your name appears in the app.</Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, !hasNameChanges && styles.saveButtonDisabled]}
                            onPress={saveChanges}
                            disabled={!hasNameChanges || saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save Name</Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Change Password Section */}
                    <Text style={styles.sectionTitle}>Change Password</Text>
                    <View style={styles.card}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Current Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={oldPassword}
                                    onChangeText={setOldPassword}
                                    placeholder="Enter current password"
                                    placeholderTextColor="#999"
                                    secureTextEntry={!showOldPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowOldPassword(!showOldPassword)}
                                >
                                    <Ionicons name={showOldPassword ? "eye-off" : "eye"} size={20} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>New Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={newPassword}
                                    onChangeText={setNewPassword}
                                    placeholder="Enter new password"
                                    placeholderTextColor="#999"
                                    secureTextEntry={!showNewPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowNewPassword(!showNewPassword)}
                                >
                                    <Ionicons name={showNewPassword ? "eye-off" : "eye"} size={20} color="#999" />
                                </TouchableOpacity>
                            </View>
                            <Text style={styles.hint}>Must be at least 6 characters.</Text>
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm New Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput
                                    style={styles.passwordInput}
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm new password"
                                    placeholderTextColor="#999"
                                    secureTextEntry={!showConfirmPassword}
                                />
                                <TouchableOpacity
                                    style={styles.eyeButton}
                                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="#999" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <TouchableOpacity
                            style={[styles.saveButton, styles.passwordButton, !hasPasswordInput && styles.saveButtonDisabled]}
                            onPress={changePassword}
                            disabled={!hasPasswordInput || savingPassword}
                        >
                            {savingPassword ? (
                                <ActivityIndicator color="#FFF" />
                            ) : (
                                <>
                                    <Ionicons name="lock-closed" size={18} color="#FFF" style={{ marginRight: 8 }} />
                                    <Text style={styles.saveButtonText}>Update Password</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Security Info */}
                    <View style={styles.infoCard}>
                        <Ionicons name="shield-checkmark" size={24} color="#41E2BA" />
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTitle}>Your Data is Secure</Text>
                            <Text style={styles.infoText}>Your account information is stored securely on your device and our encrypted servers.</Text>
                        </View>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#EEE',
        backgroundColor: '#FFF',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        marginBottom: 10,
        marginTop: 5,
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 16,
        color: '#000',
    },
    eyeButton: {
        padding: 14,
    },
    hint: {
        fontSize: 12,
        color: '#888',
        marginTop: 6,
    },
    saveButton: {
        backgroundColor: '#41E2BA',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    passwordButton: {
        backgroundColor: '#5A67D8',
    },
    saveButtonDisabled: {
        backgroundColor: '#CCC',
    },
    saveButtonText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#FFF',
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#E8FFF6',
        borderRadius: 12,
        padding: 16,
        gap: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1A7F64',
        marginBottom: 4,
    },
    infoText: {
        fontSize: 12,
        color: '#2A9D7F',
        lineHeight: 18,
    },
});
