// app/(tabs)/videos.tsx
import React, { useState, useCallback } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, View, Text, TextInput, Pressable, Image, Alert, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import VideoNoteView from '../../components/VideoNoteView';
import { API_ENDPOINTS } from '../../constants/config';

interface VideoItem {
  id: string;
  url: string;
  title: string;
  author: string;
  thumbnail?: string;
  addedAt: Date;
}

export default function VideosScreen() {
  const [isTakingNotes, setIsTakingNotes] = useState(false);
  const [currentVideo, setCurrentVideo] = useState<VideoItem | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [videoLibrary, setVideoLibrary] = useState<VideoItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [username, setUsername] = useState('Unknown');

  // Reload videos when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadVideoLibrary();
      loadUsername();
    }, [])
  );

  const loadUsername = async () => {
    try {
      const name = await AsyncStorage.getItem('username');
      if (name) setUsername(name);
    } catch (e) {
      console.log('Error loading username:', e);
    }
  };

  const loadVideoLibrary = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        // Fall back to local storage if not logged in
        const saved = await AsyncStorage.getItem('videoLibrary');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setVideoLibrary(parsed);
        }
        return;
      }

      // Fetch from server for persistence across logins
      const response = await fetch(API_ENDPOINTS.getUserVideos(userId));
      if (response.ok) {
        const data = await response.json();
        const videos = data.map((item: any) => ({
          id: item._id,
          url: item.url,
          title: item.title,
          author: item.author,
          thumbnail: item.thumbnail,
          addedAt: new Date(item.addedAt)
        }));
        setVideoLibrary(videos);
        // Also update local cache
        await AsyncStorage.setItem('videoLibrary', JSON.stringify(videos));
      }
    } catch (e) {
      console.log('Error loading video library:', e);
      // Fall back to local storage
      const saved = await AsyncStorage.getItem('videoLibrary');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setVideoLibrary(parsed);
      }
    }
  };

  // Extract video ID from YouTube URL
  const getYouTubeThumbnail = (url: string) => {
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[7].length === 11) ? match[7] : null;
    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
    return null;
  };

  const addVideo = async () => {
    if (!videoUrl.trim()) {
      Alert.alert('Error', 'Please enter a video URL');
      return;
    }

    const userId = await AsyncStorage.getItem('userId');
    const currentUsername = await AsyncStorage.getItem('username') || 'Unknown';
    const thumbnail = getYouTubeThumbnail(videoUrl);

    const newVideo: VideoItem = {
      id: Date.now().toString(),
      url: videoUrl.trim(),
      title: videoTitle.trim() || 'Untitled Video',
      author: currentUsername,
      thumbnail: thumbnail || undefined,
      addedAt: new Date()
    };

    if (userId) {
      try {
        const response = await fetch(API_ENDPOINTS.ADD_VIDEO, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            url: newVideo.url,
            title: newVideo.title,
            author: newVideo.author,
            thumbnail: newVideo.thumbnail
          })
        });

        if (response.ok) {
          const savedVideo = await response.json();
          newVideo.id = savedVideo._id;
        }
      } catch (e) {
        console.log('Error saving to server:', e);
      }
    }

    const updatedLibrary = [newVideo, ...videoLibrary];
    setVideoLibrary(updatedLibrary);
    await AsyncStorage.setItem('videoLibrary', JSON.stringify(updatedLibrary));

    await AsyncStorage.setItem('lastWatchedVideo', JSON.stringify({
      id: newVideo.id,
      url: newVideo.url,
      title: newVideo.title,
      author: newVideo.author,
      thumbnail: thumbnail,
      addedAt: newVideo.addedAt
    }));

    setVideoUrl('');
    setVideoTitle('');
    setShowAddForm(false);
    Alert.alert('Success!', 'Video added to your library');
  };

  const openVideo = (video: VideoItem) => {
    setCurrentVideo(video);
    setIsTakingNotes(true);
  };

  const deleteVideo = async (id: string) => {
    Alert.alert(
      'Delete Video',
      'Are you sure you want to remove this video from your library?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Delete from server
            try {
              await fetch(API_ENDPOINTS.getVideo(id), { method: 'DELETE' });
            } catch (e) {
              console.log('Error deleting from server:', e);
            }

            const updated = videoLibrary.filter(v => v.id !== id);
            setVideoLibrary(updated);
            await AsyncStorage.setItem('videoLibrary', JSON.stringify(updated));
          }
        }
      ]
    );
  };

  const renderVideoCard = ({ item }: { item: VideoItem }) => (
    <View style={styles.videoCard}>
      <Pressable style={styles.videoContent} onPress={() => openVideo(item)}>
        {item.thumbnail ? (
          <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <Ionicons name="videocam" size={40} color="#999" />
          </View>
        )}
        <View style={styles.videoInfo}>
          <Text style={styles.videoCardTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.videoCardUrl} numberOfLines={1}>{item.url}</Text>
        </View>
      </Pressable>
      <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteVideo(item.id)}>
        <Ionicons name="trash-outline" size={20} color="#ff6b6b" />
      </TouchableOpacity>
    </View>
  );

  if (isTakingNotes && currentVideo) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.noteViewContainer}>
          <VideoNoteView
            onBack={() => setIsTakingNotes(false)}
            videoUrl={currentVideo.url}
            videoTitle={currentVideo.title}
            videoAuthor={currentVideo.author}
          />
        </View>
        <View style={{ height: 100 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.mainTitle}>Video Library</Text>
          <Text style={styles.subTitle}>Watch educational videos and take synchronized notes</Text>
        </View>

        {/* Add Video Section */}
        <Pressable
          style={styles.addVideoBtn}
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Ionicons name={showAddForm ? "close" : "add-circle"} size={24} color="#99FF33" />
          <Text style={styles.addVideoBtnText}>
            {showAddForm ? 'Cancel' : 'Add New Video'}
          </Text>
        </Pressable>

        {showAddForm && (
          <View style={styles.addForm}>
            <TextInput
              style={styles.urlInput}
              placeholder="Paste video URL here..."
              placeholderTextColor="#999"
              value={videoUrl}
              onChangeText={setVideoUrl}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.urlInput}
              placeholder="Video title (optional)"
              placeholderTextColor="#999"
              value={videoTitle}
              onChangeText={setVideoTitle}
            />
            <Pressable style={styles.confirmBtn} onPress={addVideo}>
              <Ionicons name="checkmark" size={20} color="#000" />
              <Text style={styles.confirmBtnText}>Add to Library</Text>
            </Pressable>
          </View>
        )}

        {/* Video Library */}
        <Text style={styles.libraryTitle}>
          My Videos ({videoLibrary.length})
        </Text>

        {videoLibrary.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="videocam-off" size={60} color="#ddd" />
            <Text style={styles.emptyText}>No videos yet</Text>
            <Text style={styles.emptySubtext}>Add your first educational video to start learning!</Text>
          </View>
        ) : (
          <FlatList
            data={videoLibrary}
            renderItem={renderVideoCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        )}


        <View style={{ height: 120 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff'
  },
  scrollContent: {
    padding: 25,
    paddingTop: 50
  },
  noteViewContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000'
  },
  subTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5
  },
  addVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  addVideoBtnText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  addForm: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  urlInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    fontSize: 15,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#99FF33',
    padding: 15,
    borderRadius: 12,
  },
  confirmBtnText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  libraryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
    marginTop: 10,
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 12,
    overflow: 'hidden',
  },
  videoContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  thumbnail: {
    width: 120,
    height: 80,
    backgroundColor: '#ddd',
  },
  placeholderThumbnail: {
    width: 120,
    height: 80,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoInfo: {
    flex: 1,
    padding: 12,
  },
  videoCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  videoCardUrl: {
    fontSize: 12,
    color: '#999',
  },
  deleteBtn: {
    padding: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
    marginTop: 5,
    textAlign: 'center',
  },
  sampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 30,
    marginBottom: 12,
  },
  sampleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
    padding: 15,
    borderRadius: 12,
  },
  sampleInfo: {
    marginLeft: 15,
    flex: 1,
  },
  sampleCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  sampleCardDesc: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 3,
  },
});