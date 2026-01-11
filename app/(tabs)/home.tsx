import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions, Pressable, TouchableOpacity } from 'react-native';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, router } from 'expo-router';
import { API_ENDPOINTS } from '../../constants/config';

const { width } = Dimensions.get('window');

// Study tips array for the rotating tips feature
const STUDY_TIPS = [
  { icon: 'bulb-outline', tip: 'Break your study sessions into 25-minute focused intervals with 5-minute breaks.', category: 'Productivity' },
  { icon: 'time-outline', tip: 'Review your notes within 24 hours to boost retention by up to 60%.', category: 'Memory' },
  { icon: 'musical-notes-outline', tip: 'Try studying with instrumental music to improve focus and concentration.', category: 'Focus' },
  { icon: 'water-outline', tip: 'Stay hydrated! Drinking water improves brain function and memory.', category: 'Health' },
  { icon: 'moon-outline', tip: 'Get 7-8 hours of sleep. Your brain consolidates memories while you rest.', category: 'Sleep' },
  { icon: 'create-outline', tip: 'Writing notes by hand improves understanding and recall compared to typing.', category: 'Notes' },
  { icon: 'repeat-outline', tip: 'Use spaced repetition to review material at increasing intervals.', category: 'Memory' },
  { icon: 'walk-outline', tip: 'Take a short walk between study sessions to refresh your mind.', category: 'Break' },
];

interface Note {
  id: string;
  content: string;
  images: string[];
  videoUrl?: string;
  timestamp?: number;
}

export default function HomeScreen() {
  const [username, setUsername] = useState('Student');
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [recentNotes, setRecentNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalNotes, setTotalNotes] = useState(0);
  const [totalVideos, setTotalVideos] = useState(0);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Rotate study tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Fetch data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchUserData(),
        fetchRecentNotes(),
        fetchVideoCount()
      ]);
    } catch (e) {
      // Individual errors are handled in each function
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const storedName = await AsyncStorage.getItem('username');
      if (storedName) {
        setUsername(storedName);
      }

      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      };
      const dayOptions: Intl.DateTimeFormatOptions = {
        weekday: 'long'
      };

      setCurrentDate(now.toLocaleDateString('en-US', dateOptions));
      setCurrentDay(now.toLocaleDateString('en-US', dayOptions));
    } catch (error) {
      console.log('Error fetching user data:', error);
      // Don't show error to user for this, use defaults
    }
  };

  const fetchRecentNotes = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        // Not logged in, don't show error
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(API_ENDPOINTS.getUserNotes(userId), {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }

      const data = await response.json();
      // Set total count
      const allNotes = data.filter((item: any) => !item.videoUrl);
      setTotalNotes(allNotes.length);
      // Get the 3 most recent notes (excluding video notes)
      const regularNotes = allNotes
        .slice(0, 3)
        .map((item: any) => ({
          id: item._id,
          content: item.content,
          images: item.images || [],
        }));
      setRecentNotes(regularNotes);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        console.log('Notes fetch timeout');
      } else {
        console.log('Error fetching notes:', e.message);
      }
      // Don't block the UI, just show empty
    }
  };

  const fetchVideoCount = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');

      if (userId) {
        try {
          const response = await fetch(API_ENDPOINTS.getUserVideos(userId));
          if (response.ok) {
            const videos = await response.json();
            if (Array.isArray(videos)) {
              setTotalVideos(videos.length);
            }
          }
        } catch (e) {
          console.log('Error fetching video count:', e);
        }
      }

      // Fallback to local storage
      const saved = await AsyncStorage.getItem('videoLibrary');
      if (saved) {
        const videos = JSON.parse(saved);
        if (Array.isArray(videos)) {
          setTotalVideos(videos.length);
        }
      }
    } catch (e) {
      console.log('Error fetching video count:', e);
    }
  };

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % STUDY_TIPS.length);
  };

  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + STUDY_TIPS.length) % STUDY_TIPS.length);
  };

  const getTipColor = (category: string): string => {
    const colors: { [key: string]: string } = {
      'Productivity': '#41E2BA',
      'Memory': '#FF9800',
      'Focus': '#2196F3',
      'Health': '#4CAF50',
      'Sleep': '#9C27B0',
      'Notes': '#E91E63',
      'Break': '#00BCD4',
    };
    return colors[category] || '#41E2BA';
  };

  const navigateToNotes = () => {
    router.push('/(tabs)/note');
  };

  const navigateToVideos = () => {
    router.push('/(tabs)/videos');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.welcomeText}>Welcome</Text>
          <Text style={styles.userName}>{username}!</Text>
          <Text style={styles.dateText}>{currentDate}</Text>
          <Text style={styles.dayText}>{currentDay}</Text>
        </View>
        <Ionicons name="paw" size={80} color="rgba(0,0,0,0.1)" style={styles.headerIcon} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <TouchableOpacity style={styles.actionCard} onPress={navigateToNotes}>
            <View style={[styles.actionIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="add-circle" size={28} color="#41E2BA" />
            </View>
            <Text style={styles.actionLabel}>New Note</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={navigateToVideos}>
            <View style={[styles.actionIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="videocam" size={28} color="#FF9800" />
            </View>
            <Text style={styles.actionLabel}>Add Video</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard} onPress={() => router.push('/(tabs)/profile')}>
            <View style={[styles.actionIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="person" size={28} color="#2196F3" />
            </View>
            <Text style={styles.actionLabel}>Profile</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Notes */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Notes</Text>
          <TouchableOpacity onPress={navigateToNotes}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentNotes.length > 0 ? (
          <View style={styles.notesGrid}>
            {recentNotes.map((note) => (
              <Pressable key={note.id} style={styles.noteBox} onPress={navigateToNotes}>
                {note.images && note.images.length > 0 ? (
                  <Image source={{ uri: note.images[0] }} style={styles.noteImage} />
                ) : null}
                <Text numberOfLines={note.images?.length > 0 ? 2 : 4} style={styles.noteText}>
                  {note.content}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Pressable style={styles.emptyNotesBox} onPress={navigateToNotes}>
            <Ionicons name="document-text-outline" size={40} color="#ccc" />
            <Text style={styles.emptyText}>No notes yet</Text>
            <Text style={styles.emptySubtext}>Tap to create your first note</Text>
          </Pressable>
        )}
      </View>

      {/* Study Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Study Tips 💡</Text>
        <View style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <View style={[styles.tipIconContainer, { backgroundColor: getTipColor(STUDY_TIPS[currentTipIndex].category) }]}>
              <Ionicons name={STUDY_TIPS[currentTipIndex].icon as any} size={24} color="#fff" />
            </View>
            <Text style={styles.tipCategory}>{STUDY_TIPS[currentTipIndex].category}</Text>
          </View>
          <Text style={styles.tipText}>{STUDY_TIPS[currentTipIndex].tip}</Text>
          <View style={styles.tipNavigation}>
            <TouchableOpacity onPress={prevTip} style={styles.tipNavButton}>
              <Ionicons name="chevron-back" size={20} color="#666" />
            </TouchableOpacity>
            <View style={styles.tipDots}>
              {STUDY_TIPS.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.tipDot,
                    currentTipIndex === index && styles.tipDotActive
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity onPress={nextTip} style={styles.tipNavButton}>
              <Ionicons name="chevron-forward" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Study Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Study Statistics</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="document-text" size={24} color="#41E2BA" />
            </View>
            <Text style={styles.statNumber}>{totalNotes}</Text>
            <Text style={styles.statLabel}>Notes</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#FFF3E0' }]}>
              <Ionicons name="videocam" size={24} color="#FF9800" />
            </View>
            <Text style={styles.statNumber}>{totalVideos}</Text>
            <Text style={styles.statLabel}>Videos</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="calendar" size={24} color="#2196F3" />
            </View>
            <Text style={styles.statNumber}>{new Date().getDate()}</Text>
            <Text style={styles.statLabel}>{new Date().toLocaleDateString('en-US', { month: 'short' })}</Text>
          </View>
        </View>
      </View>

      <View style={{ height: 120 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary.brightSnow,
  },
  header: {
    backgroundColor: '#99FF33',
    padding: 25,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 200,
  },
  headerTextContainer: {
    zIndex: 1,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  userName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#000',
    marginTop: -5,
  },
  dateText: {
    fontSize: 14,
    color: '#000',
    marginTop: 10,
  },
  dayText: {
    fontSize: 14,
    color: '#000',
  },
  headerIcon: {
    position: 'absolute',
    right: 10,
    bottom: 20,
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.spaceIndigo,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: 'gray',
    marginTop: 2,
  },
  seeAllText: {
    fontSize: 14,
    color: '#99FF33',
    fontWeight: '600',
  },
  videoCard: {
    width: '100%',
    height: 180,
    backgroundColor: '#2a2a3e',
    borderRadius: 15,
    overflow: 'hidden',
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: '#3d3d5c',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  videoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyVideoCard: {
    width: '100%',
    height: 150,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 10,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#bbb',
    marginTop: 4,
  },
  notesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },
  noteBox: {
    width: (width - 60) / 3,
    height: 120,
    backgroundColor: '#F2F4F7',
    borderRadius: 12,
    padding: 10,
    overflow: 'hidden',
  },
  noteImage: {
    width: '100%',
    height: 50,
    borderRadius: 6,
    marginBottom: 5,
  },
  noteText: {
    fontSize: 11,
    color: '#333',
    lineHeight: 14,
  },
  emptyNotesBox: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#eee',
    borderStyle: 'dashed',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  actionCard: {
    alignItems: 'center',
    width: (width - 60) / 3,
  },
  actionIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 15,
    width: (width - 60) / 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statIcon: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  tipCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipCategory: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 16,
  },
  tipNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  tipNavButton: {
    padding: 8,
  },
  tipDots: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
  },
  tipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ddd',
    marginHorizontal: 3,
  },
  tipDotActive: {
    backgroundColor: '#41E2BA',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});