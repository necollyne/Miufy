import React, { useState, useCallback } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal, ActivityIndicator, Image, ScrollView, Pressable } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from 'expo-router';
import { API_ENDPOINTS } from '../../constants/config';

export default function NoteScreen() {
  const [noteContent, setNoteContent] = useState("");
  const [notesList, setNotesList] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);

  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Reload notes when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchNotes();
    }, [])
  );

  const fetchNotes = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      setFetchError(null);

      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setFetchError('Please login to view your notes');
        return;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const response = await fetch(API_ENDPOINTS.getUserNotes(userId), {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();
      // Filter only regular notes (no videoUrl)
      const regularNotes = data.filter((item: any) => !item.videoUrl);
      setNotesList(regularNotes.map((item: any) => ({
        id: item._id,
        content: item.content,
        images: item.images || []
      })));
    } catch (e: any) {
      if (e.name === 'AbortError') {
        setFetchError('Request timed out. Please check your connection.');
      } else {
        setFetchError('Unable to load notes. Please try again.');
      }
      console.log("Fetch error:", e.message);
    } finally {
      setIsLoading(false);
    }
  };

  // --- UNDO/REDO LOGIC ---
  const handleTextChange = (text: string) => {
    setNoteContent(text);
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(text);
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setCurrentIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setNoteContent(history[prevIndex]);
    }
  };

  const redo = () => {
    if (currentIndex < history.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setNoteContent(history[nextIndex]);
    }
  };

  // --- IMAGE PICKER ---
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
      base64: true
    });

    if (!result.canceled && result.assets[0].base64) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAttachedImages(prev => [...prev, base64Image]);
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    if (!noteContent.trim() && attachedImages.length === 0) {
      closeModal();
      return;
    }

    const userId = await AsyncStorage.getItem('userId');
    const url = editingNoteId ? API_ENDPOINTS.getNote(editingNoteId) : API_ENDPOINTS.ADD_NOTE;
    const method = editingNoteId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          content: noteContent,
          images: attachedImages
        }),
      });

      if (res.ok) {
        fetchNotes();
        closeModal();
      } else {
        const errData = await res.json();
        Alert.alert("Error", errData.msg || "Failed to save note.");
      }
    } catch (e) {
      Alert.alert("Connection Error", "Please check your network connection.");
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingNoteId(item.id);
      setNoteContent(item.content);
      setAttachedImages(item.images || []);
      setHistory([item.content]);
      setCurrentIndex(0);
    } else {
      setNoteContent("");
      setAttachedImages([]);
      setHistory([""]);
      setCurrentIndex(0);
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setNoteContent("");
    setEditingNoteId(null);
    setAttachedImages([]);
    setHistory([]);
    setCurrentIndex(-1);
  };

  const deleteNote = async (id: string) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await fetch(API_ENDPOINTS.getNote(id), { method: 'DELETE' });
              if (res.ok) {
                fetchNotes(false);
              } else {
                Alert.alert('Error', 'Failed to delete note. Please try again.');
              }
            } catch (e) {
              Alert.alert('Connection Error', 'Unable to delete note. Please check your connection.');
            }
          }
        }
      ]
    );
  };

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#41E2BA" /></View>;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Miufy Notes</Text>
        <TouchableOpacity style={styles.plusBtn} onPress={() => openModal()}>
          <Ionicons name="add" size={30} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notesList}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.noteCard}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => openModal(item)}>
              <View style={styles.cardContent}>
                {/* Image thumbnail if exists */}
                {item.images && item.images.length > 0 && (
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.cardImage}
                  />
                )}

                <Text numberOfLines={item.images?.length > 0 ? 3 : 6} style={styles.cardText}>{item.content}</Text>
                <TouchableOpacity onPress={() => deleteNote(item.id)} hitSlop={15}>
                  <Ionicons name="trash" size={18} color="red" style={{ alignSelf: 'flex-end' }} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={isModalVisible} animationType="fade">
        <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} hitSlop={20}>
              <Ionicons name="close" size={28} />
            </TouchableOpacity>

            <View style={styles.undoRedoGroup}>
              <TouchableOpacity onPress={undo} disabled={currentIndex <= 0}>
                <Ionicons name="arrow-undo" size={24} color={currentIndex <= 0 ? "#ccc" : "black"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={redo} disabled={currentIndex >= history.length - 1} style={{ marginLeft: 25 }}>
                <Ionicons name="arrow-redo" size={24} color={currentIndex >= history.length - 1 ? "#ccc" : "black"} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleSave} hitSlop={20}>
              <Ionicons name="checkmark" size={32} color="green" />
            </TouchableOpacity>
          </View>

          <ScrollView style={{ flex: 1 }}>
            <TextInput
              style={styles.input}
              multiline
              value={noteContent}
              onChangeText={handleTextChange}
              placeholder="Write your study notes..."
            />

            {/* Attached Images */}
            {attachedImages.length > 0 && (
              <View style={styles.imagesContainer}>
                <Text style={styles.imagesLabel}>Attached Images</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {attachedImages.map((img, index) => (
                    <View key={index} style={styles.imageWrapper}>
                      <Image source={{ uri: img }} style={styles.attachedImage} />
                      <Pressable style={styles.removeBtn} onPress={() => removeImage(index)}>
                        <Ionicons name="close-circle" size={24} color="red" />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>

          {/* Add Image Button */}
          <View style={styles.bottomBar}>
            <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
              <Ionicons name="image" size={24} color="#41E2BA" />
              <Text style={styles.addImageText}>Add Image</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20, alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold" },
  plusBtn: { backgroundColor: "#41E2BA", width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  noteCard: { backgroundColor: "#F2F4F7", flex: 1, margin: 8, borderRadius: 15, minHeight: 150, overflow: 'hidden' },
  cardContent: { padding: 15, flex: 1, justifyContent: 'space-between' },
  cardText: { fontSize: 14, color: "#333" },
  cardImage: {
    width: '100%',
    height: 70,
    borderRadius: 8,
    marginBottom: 8
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    backgroundColor: '#fff',
    zIndex: 10,
  },
  undoRedoGroup: { flexDirection: 'row', alignItems: 'center' },
  input: { flex: 1, padding: 20, fontSize: 18, textAlignVertical: 'top', minHeight: 200 },
  imagesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  imagesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  imageWrapper: {
    marginRight: 10,
    position: 'relative',
  },
  attachedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  removeBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  bottomBar: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  addImageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  addImageText: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});