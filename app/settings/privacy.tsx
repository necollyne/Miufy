import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function PrivacySettings() {
    const [clearing, setClearing] = useState(false);

    const clearNotesData = async () => {
        Alert.alert(
            'Clear Notes',
            'This will delete all your saved notes. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        setClearing(true);
                        try {
                            const userId = await AsyncStorage.getItem('userId');

                            if (!userId) {
                                Alert.alert('Error', 'Please log in to clear notes.');
                                setClearing(false);
                                return;
                            }

                            // Delete from server
                            const { API_ENDPOINTS } = require('../../constants/config');
                            const response = await fetch(API_ENDPOINTS.deleteUserNotes(userId), {
                                method: 'DELETE'
                            });

                            if (!response.ok) {
                                throw new Error('Failed to delete notes from server');
                            }

                            const result = await response.json();
                            Alert.alert('Success', result.message || 'All notes have been deleted.');
                        } catch (e) {
                            console.log('Error deleting notes:', e);
                            Alert.alert('Error', 'Failed to clear notes. Please try again.');
                        } finally {
                            setClearing(false);
                        }
                    }
                }
            ]
        );
    };

    const clearVideoLibrary = async () => {
        Alert.alert(
            'Clear Video Library',
            'This will remove all videos from your library. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // Clear local storage
                            await AsyncStorage.removeItem('videoLibrary');

                            // Also delete from server
                            const userId = await AsyncStorage.getItem('userId');
                            if (userId) {
                                try {
                                    const { API_ENDPOINTS } = require('../../constants/config');
                                    await fetch(API_ENDPOINTS.deleteUserVideos(userId), {
                                        method: 'DELETE'
                                    });
                                } catch (e) {
                                    console.log('Error deleting from server:', e);
                                }
                            }

                            Alert.alert('Success', 'Video library has been cleared.');
                        } catch (e) {
                            Alert.alert('Error', 'Failed to clear video library.');
                        }
                    }
                }
            ]
        );
    };


    const clearAllData = async () => {
        Alert.alert(
            'Clear All App Data',
            'This will log you out and delete all local data including notes, videos, and preferences. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Clear Everything',
                    style: 'destructive',
                    onPress: async () => {
                        setClearing(true);
                        try {
                            await AsyncStorage.clear();
                            Alert.alert('Data Cleared', 'All app data has been removed. You will be logged out.', [
                                { text: 'OK', onPress: () => router.replace('/login') }
                            ]);
                        } catch (e) {
                            Alert.alert('Error', 'Failed to clear app data.');
                        } finally {
                            setClearing(false);
                        }
                    }
                }
            ]
        );
    };

    const ActionButton = ({
        title,
        description,
        icon,
        onPress,
        danger = false
    }: {
        title: string;
        description: string;
        icon: string;
        onPress: () => void;
        danger?: boolean;
    }) => (
        <TouchableOpacity style={styles.actionButton} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.actionIcon, danger && styles.dangerIcon]}>
                <Ionicons name={icon as any} size={22} color={danger ? '#FF5A5A' : '#41E2BA'} />
            </View>
            <View style={styles.actionContent}>
                <Text style={[styles.actionTitle, danger && styles.dangerTitle]}>{title}</Text>
                <Text style={styles.actionDescription}>{description}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CCC" />
        </TouchableOpacity>
    );

    if (clearing) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#41E2BA" />
                <Text style={styles.loadingText}>Clearing data...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Privacy & Security</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                {/* Data Security Info */}
                <View style={styles.securityCard}>
                    <View style={styles.securityIconContainer}>
                        <Ionicons name="shield-checkmark" size={32} color="#41E2BA" />
                    </View>
                    <Text style={styles.securityTitle}>Your Data is Protected</Text>
                    <Text style={styles.securityText}>
                        Your account data is stored securely. Notes are synced to encrypted servers,
                        and your personal information is never shared with third parties.
                    </Text>
                </View>

                {/* Data Management */}
                <Text style={styles.sectionTitle}>Data Management</Text>
                <View style={styles.actionsCard}>
                    <ActionButton
                        title="Clear Video Library"
                        description="Remove all saved videos"
                        icon="videocam-off-outline"
                        onPress={clearVideoLibrary}
                    />
                    <View style={styles.divider} />
                    <ActionButton
                        title="Clear Notes Cache"
                        description="Refresh notes from server"
                        icon="document-outline"
                        onPress={clearNotesData}
                    />
                </View>

                {/* Danger Zone */}
                <Text style={[styles.sectionTitle, { color: '#FF5A5A' }]}>Danger Zone</Text>
                <View style={styles.actionsCard}>
                    <ActionButton
                        title="Clear All App Data"
                        description="Logs you out and removes all local data"
                        icon="trash-outline"
                        onPress={clearAllData}
                        danger
                    />
                </View>

                {/* Privacy Policy */}
                <TouchableOpacity style={styles.linkButton}>
                    <Ionicons name="document-text-outline" size={20} color="#41E2BA" />
                    <Text style={styles.linkText}>View Privacy Policy</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.linkButton}>
                    <Ionicons name="help-circle-outline" size={20} color="#41E2BA" />
                    <Text style={styles.linkText}>Help & Support</Text>
                </TouchableOpacity>
            </ScrollView>
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
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
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
    securityCard: {
        backgroundColor: '#E8FFF6',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 25,
    },
    securityIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    securityTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A7F64',
        marginBottom: 8,
    },
    securityText: {
        fontSize: 13,
        color: '#2A9D7F',
        textAlign: 'center',
        lineHeight: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#888',
        textTransform: 'uppercase',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    actionsCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#E8FFF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    dangerIcon: {
        backgroundColor: '#FFEDED',
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
        marginBottom: 2,
    },
    dangerTitle: {
        color: '#FF5A5A',
    },
    actionDescription: {
        fontSize: 12,
        color: '#888',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 68,
    },
    linkButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        gap: 10,
    },
    linkText: {
        fontSize: 15,
        color: '#41E2BA',
        fontWeight: '500',
    },
});
