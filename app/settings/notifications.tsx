import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface NotificationSettings {
    studyReminders: boolean;
    newVideoAlerts: boolean;
    appUpdates: boolean;
    dailyDigest: boolean;
}

const defaultSettings: NotificationSettings = {
    studyReminders: true,
    newVideoAlerts: true,
    appUpdates: true,
    dailyDigest: false,
};

export default function NotificationSettingsScreen() {
    const [settings, setSettings] = useState<NotificationSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const saved = await AsyncStorage.getItem('notificationSettings');
            if (saved) {
                setSettings(JSON.parse(saved));
            }
        } catch (e) {
            console.log('Error loading notification settings');
        } finally {
            setLoading(false);
        }
    };

    const updateSetting = async (key: keyof NotificationSettings, value: boolean) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);

        try {
            await AsyncStorage.setItem('notificationSettings', JSON.stringify(newSettings));
        } catch (e) {
            Alert.alert('Error', 'Failed to save notification settings.');
            // Revert the change
            setSettings(settings);
        }
    };

    const SettingRow = ({
        title,
        description,
        settingKey,
        icon
    }: {
        title: string;
        description: string;
        settingKey: keyof NotificationSettings;
        icon: string;
    }) => (
        <View style={styles.settingRow}>
            <View style={styles.settingIcon}>
                <Ionicons name={icon as any} size={22} color="#41E2BA" />
            </View>
            <View style={styles.settingContent}>
                <Text style={styles.settingTitle}>{title}</Text>
                <Text style={styles.settingDescription}>{description}</Text>
            </View>
            <Switch
                value={settings[settingKey]}
                onValueChange={(value) => updateSetting(settingKey, value)}
                trackColor={{ false: '#E0E0E0', true: '#99FF33' }}
                thumbColor={settings[settingKey] ? '#41E2BA' : '#FFF'}
            />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications</Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView style={styles.content}>
                <Text style={styles.sectionTitle}>Study Notifications</Text>
                <View style={styles.settingsCard}>
                    <SettingRow
                        title="Study Reminders"
                        description="Get reminders to review your notes"
                        settingKey="studyReminders"
                        icon="alarm-outline"
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        title="Daily Digest"
                        description="Receive a daily summary of your progress"
                        settingKey="dailyDigest"
                        icon="calendar-outline"
                    />
                </View>

                <Text style={styles.sectionTitle}>Content Notifications</Text>
                <View style={styles.settingsCard}>
                    <SettingRow
                        title="New Video Alerts"
                        description="Notified when new study videos are available"
                        settingKey="newVideoAlerts"
                        icon="videocam-outline"
                    />
                    <View style={styles.divider} />
                    <SettingRow
                        title="App Updates"
                        description="Learn about new features and improvements"
                        settingKey="appUpdates"
                        icon="sparkles-outline"
                    />
                </View>

                <View style={styles.infoCard}>
                    <Ionicons name="information-circle" size={20} color="#666" />
                    <Text style={styles.infoText}>
                        Notification preferences are saved automatically when you make changes.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
        marginTop: 10,
        letterSpacing: 0.5,
    },
    settingsCard: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 15,
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    settingIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#E8FFF6',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    settingContent: {
        flex: 1,
    },
    settingTitle: {
        fontSize: 15,
        fontWeight: '500',
        color: '#000',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 12,
        color: '#888',
    },
    divider: {
        height: 1,
        backgroundColor: '#F0F0F0',
        marginLeft: 68,
    },
    infoCard: {
        flexDirection: 'row',
        backgroundColor: '#F0F0F0',
        borderRadius: 12,
        padding: 14,
        gap: 10,
        marginTop: 10,
    },
    infoText: {
        flex: 1,
        fontSize: 12,
        color: '#666',
        lineHeight: 18,
    },
});
