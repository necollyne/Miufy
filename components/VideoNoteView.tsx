import React, { useState, useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TextInput, Pressable, Alert, ScrollView, Image, TouchableOpacity, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer, { YoutubeIframeRef } from 'react-native-youtube-iframe';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_ENDPOINTS } from '../constants/config';

interface TimestampedNote {
  id: string;
  content: string;
  timestamp: number;
  images: string[];
  createdAt?: Date;
}

interface VideoNoteViewProps {
  onBack: () => void;
  videoUrl?: string;
  videoTitle?: string;
  videoAuthor?: string;
}

// Extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string): string | null => {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
};

export default function VideoNoteView({
  onBack,
  videoUrl = '',
  videoTitle = 'Educational Video',
  videoAuthor = 'Miufy'
}: VideoNoteViewProps) {
  const playerRef = useRef<YoutubeIframeRef>(null);
  const [noteContent, setNoteContent] = useState('');
  const [notes, setNotes] = useState<TimestampedNote[]>([]);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get YouTube video ID
  const videoId = extractYouTubeId(videoUrl);

  useEffect(() => {
    fetchVideoNotes();
    saveAsRecentlyWatched();
  }, []);

  const saveAsRecentlyWatched = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId || !videoUrl) return;

      const extractId = (url: string): string | null => {
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
          /^([a-zA-Z0-9_-]{11})$/
        ];
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match && match[1]) return match[1];
        }
        return null;
      };

      const ytVideoId = extractId(videoUrl);
      const thumbnailUrl = ytVideoId ? `https://img.youtube.com/vi/${ytVideoId}/hqdefault.jpg` : null;

      const recentVideo = {
        id: Date.now().toString(),
        url: videoUrl,
        title: videoTitle,
        author: videoAuthor,
        thumbnail: thumbnailUrl,
        addedAt: new Date()
      };

      await AsyncStorage.setItem('lastWatchedVideo', JSON.stringify(recentVideo));
    } catch (e) {
      console.log('Error saving recently watched:', e);
    }
  };

  useEffect(() => {
    const interval = setInterval(async () => {
      if (playerRef.current && isPlaying) {
        const time = await playerRef.current.getCurrentTime();
        setCurrentTime(Math.floor(time));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const fetchVideoNotes = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;

      const response = await fetch(API_ENDPOINTS.getUserNotes(userId));
      const data = await response.json();

      if (response.ok) {
        // Filter notes that belong to this video
        const videoNotes = data
          .filter((note: any) => note.videoUrl === videoUrl)
          .map((note: any) => ({
            id: note._id,
            content: note.content,
            timestamp: note.timestamp || 0,
            images: note.images || [],
            createdAt: note.createdAt
          }));
        setNotes(videoNotes);
      }
    } catch (e) {
      console.log('Fetch error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const onStateChange = useCallback((state: string) => {
    if (state === 'playing') {
      setIsPlaying(true);
    } else if (state === 'paused' || state === 'ended') {
      setIsPlaying(false);
    }
  }, []);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Save note with current timestamp
  const saveNote = async () => {
    if (!noteContent.trim() && attachedImages.length === 0) {
      Alert.alert('Empty Note', 'Please write something or attach an image.');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'Please log in first');
        return;
      }

      const response = await fetch(API_ENDPOINTS.ADD_NOTE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          content: noteContent,
          videoUrl: videoUrl,
          timestamp: currentTime,
          images: attachedImages
        })
      });

      if (response.ok) {
        const savedNote = await response.json();
        setNotes(prev => [{
          id: savedNote._id,
          content: savedNote.content,
          timestamp: savedNote.timestamp || 0,
          images: savedNote.images || [],
          createdAt: savedNote.createdAt
        }, ...prev]);
        setNoteContent('');
        setAttachedImages([]);
        Alert.alert('Saved!', `Note saved at ${formatTime(currentTime)}`);
      } else {
        Alert.alert('Error', 'Failed to save note');
      }
    } catch (e) {
      Alert.alert('Connection Error', 'Please check your network connection');
    }
  };

  // Seek video to note's timestamp
  const seekToTimestamp = async (timestamp: number) => {
    if (playerRef.current) {
      await playerRef.current.seekTo(timestamp, true);
      setCurrentTime(timestamp);
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Don't force crop
      quality: 0.7,
      base64: true
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAttachedImages(prev => [...prev, base64Image]);
    }
  };

  // Remove attached image
  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  // Delete note
  const deleteNote = async (noteId: string) => {
    try {
      const response = await fetch(API_ENDPOINTS.getNote(noteId), { method: 'DELETE' });
      if (response.ok) {
        setNotes(prev => prev.filter(note => note.id !== noteId));
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to delete note');
    }
  };

  // Check if video URL is valid
  if (!videoId) {
    return (
      <View style={styles.errorContainer}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#99FF33" />
        </Pressable>
        <Ionicons name="warning" size={60} color="#ff6b6b" />
        <Text style={styles.errorTitle}>Invalid Video URL</Text>
        <Text style={styles.errorText}>Please paste a valid YouTube video link.</Text>
        <Text style={styles.errorHint}>Example: https://youtube.com/watch?v=xxxxx</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Ionicons name="arrow-back" size={28} color="#99FF33" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>Video Notes</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* YOUTUBE PLAYER */}
      <View style={styles.videoWrapper}>
        <YoutubePlayer
          ref={playerRef}
          height={220}
          videoId={videoId}
          play={isPlaying}
          onChangeState={onStateChange}
        />
      </View>

      {/* VIDEO INFO */}
      <View style={styles.infoContainer}>
        <Text style={styles.videoTitle}>{videoTitle}</Text>
        <Text style={styles.authorText}>By {videoAuthor}</Text>
        <View style={styles.timestampBadge}>
          <Ionicons name="time" size={14} color="#666" />
          <Text style={styles.timestampText}>{formatTime(currentTime)}</Text>
        </View>
      </View>

      {/* NOTE INPUT */}
      <View style={styles.inputSection}>
        <Text style={styles.sectionLabel}>Take a note at {formatTime(currentTime)}</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Write your thoughts here..."
          placeholderTextColor="#999"
          multiline
          value={noteContent}
          onChangeText={setNoteContent}
        />

        {/* Attached Images Preview */}
        {attachedImages.length > 0 && (
          <ScrollView horizontal style={styles.imagePreviewRow}>
            {attachedImages.map((img, index) => (
              <View key={index} style={styles.imagePreviewContainer}>
                <Image source={{ uri: img }} style={styles.imagePreview} />
                <Pressable style={styles.removeImageBtn} onPress={() => removeImage(index)}>
                  <Ionicons name="close-circle" size={20} color="red" />
                </Pressable>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Pressable style={styles.attachBtn} onPress={pickImage}>
            <Ionicons name="image" size={22} color="#666" />
            <Text style={styles.attachText}>Add Image</Text>
          </Pressable>

          <Pressable style={styles.saveBtn} onPress={saveNote}>
            <Ionicons name="save" size={20} color="#fff" />
            <Text style={styles.saveBtnText}>Save Note</Text>
          </Pressable>
        </View>
      </View>

      {/* NOTES LIST */}
      <View style={styles.notesSection}>
        <Text style={styles.sectionLabel}>Your Notes ({notes.length})</Text>

        {notes.length === 0 && !isLoading && (
          <Text style={styles.emptyText}>No notes yet. Start taking notes while watching!</Text>
        )}

        {notes.map((note) => (
          <Pressable
            key={note.id}
            style={styles.noteCard}
            onPress={() => seekToTimestamp(note.timestamp)}
          >
            <View style={styles.noteHeader}>
              <View style={styles.timestampChip}>
                <Ionicons name="play-circle" size={16} color="#99FF33" />
                <Text style={styles.chipText}>{formatTime(note.timestamp)}</Text>
              </View>
              <TouchableOpacity onPress={() => deleteNote(note.id)}>
                <Ionicons name="trash" size={18} color="#ff6b6b" />
              </TouchableOpacity>
            </View>

            <Text style={styles.noteText}>{note.content}</Text>

            {note.images && note.images.length > 0 && (
              <ScrollView horizontal style={styles.noteImagesRow}>
                {note.images.map((img, idx) => (
                  <TouchableOpacity key={idx} onPress={() => setSelectedImage(img)}>
                    <Image source={{ uri: img }} style={styles.noteImage} />
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.tapHint}>Tap to jump to this moment</Text>
          </Pressable>
        ))}
      </View>

      {/* Bottom spacing for tab bar */}
      <View style={{ height: 120 }} />

      {/* Full-screen image viewer modal */}
      <Modal visible={!!selectedImage} transparent animationType="fade">
        <Pressable style={styles.imageViewerOverlay} onPress={() => setSelectedImage(null)}>
          <TouchableOpacity style={styles.closeImageBtn} onPress={() => setSelectedImage(null)}>
            <Ionicons name="close" size={30} color="#fff" />
          </TouchableOpacity>
          {selectedImage && (
            <Image source={{ uri: selectedImage }} style={styles.fullscreenImage} resizeMode="contain" />
          )}
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  backButton: {
    position: 'absolute',
    top: 10,
    left: 0,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#999',
    marginTop: 10,
    fontStyle: 'italic',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  videoWrapper: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  infoContainer: {
    marginTop: 15,
    marginBottom: 10,
  },
  videoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  timestampBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  timestampText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
    fontWeight: '600',
  },
  inputSection: {
    marginTop: 20,
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 15,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  textInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 15,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
    fontSize: 16,
  },
  imagePreviewRow: {
    marginTop: 10,
  },
  imagePreviewContainer: {
    marginRight: 10,
    position: 'relative',
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImageBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  attachText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#99FF33',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  saveBtnText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#000',
    fontSize: 14,
  },
  notesSection: {
    marginTop: 25,
  },
  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
  noteCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#99FF33',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  timestampChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  chipText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  noteText: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  noteImagesRow: {
    marginTop: 10,
  },
  noteImage: {
    width: 100,
    height: 75,
    borderRadius: 8,
    marginRight: 8,
  },
  tapHint: {
    fontSize: 11,
    color: '#99FF33',
    marginTop: 10,
    fontStyle: 'italic',
  },
  imageViewerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeImageBtn: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 10,
  },
  fullscreenImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height * 0.8,
  },
});