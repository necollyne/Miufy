import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, FlatList, Alert, Modal, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context'; 
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = "http://192.168.1.15:5000/api/notes"; 

export default function NoteScreen() {
  const [noteContent, setNoteContent] = useState("");
  const [notesList, setNotesList] = useState<any[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // --- UNDO/REDO STATES ---
  const [history, setHistory] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => { fetchNotes(); }, []);

  const fetchNotes = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) return;
      const response = await fetch(`${BASE_URL}/${userId}`);
      const data = await response.json();
      if (response.ok) {
        setNotesList(data.map((item: any) => ({ id: item._id, content: item.content })));
      }
    } catch (e) { console.log("Fetch error"); }
    finally { setIsLoading(false); }
  };

  // --- UNDO/REDO LOGIC ---
  const handleTextChange = (text: string) => {
    setNoteContent(text);
    const newHistory = history.slice(0, currentIndex + 1);
    newHistory.push(text);
    
    // LIMIT: Hanggang 20 steps lang para hindi mag-"Payload Too Large" sa server
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

  // --- SAVE LOGIC ---
  const handleSave = async () => {
    if (!noteContent.trim()) { closeModal(); return; }
    
    const userId = await AsyncStorage.getItem('userId');
    const url = editingNoteId ? `${BASE_URL}/${editingNoteId}` : `${BASE_URL}/add`;
    const method = editingNoteId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, content: noteContent }),
      });

      if (res.ok) {
        fetchNotes(); 
        closeModal();
      } else {
        const errData = await res.json();
        Alert.alert("Error", errData.msg || "Hindi naisave.");
      }
    } catch (e) {
      Alert.alert("Connection Error", "Siguraduhing updated ang server.js limit mo.");
    }
  };

  const openModal = (item?: any) => {
    if (item) {
      setEditingNoteId(item.id);
      setNoteContent(item.content);
      setHistory([item.content]);
      setCurrentIndex(0);
    } else {
      setNoteContent("");
      setHistory([""]);
      setCurrentIndex(0);
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setNoteContent("");
    setEditingNoteId(null);
    setHistory([]);
    setCurrentIndex(-1);
  };

  const deleteNote = async (id: string) => {
    const res = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) fetchNotes();
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
            <TouchableOpacity style={{flex: 1}} onPress={() => openModal(item)}>
              <View style={styles.cardContent}>
                <Text numberOfLines={6} style={styles.cardText}>{item.content}</Text>
                <TouchableOpacity onPress={() => deleteNote(item.id)} hitSlop={15}>
                  <Ionicons name="trash" size={18} color="red" style={{alignSelf: 'flex-end'}} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />

      <Modal visible={isModalVisible} animationType="fade">
        <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
          <View style={styles.modalHeader}>
            {/* BACK: Exit lang */}
            <TouchableOpacity onPress={closeModal} hitSlop={20}>
              <Ionicons name="close" size={28} />
            </TouchableOpacity>
            
            <View style={styles.undoRedoGroup}>
              <TouchableOpacity onPress={undo} disabled={currentIndex <= 0}>
                <Ionicons name="arrow-undo" size={24} color={currentIndex <= 0 ? "#ccc" : "black"} />
              </TouchableOpacity>
              <TouchableOpacity onPress={redo} disabled={currentIndex >= history.length - 1} style={{marginLeft: 25}}>
                <Ionicons name="arrow-redo" size={24} color={currentIndex >= history.length - 1 ? "#ccc" : "black"} />
              </TouchableOpacity>
            </View>

            {/* SAVE: Mag-sa-save sa MongoDB Atlas */}
            <TouchableOpacity onPress={handleSave} hitSlop={20}>
              <Ionicons name="checkmark" size={32} color="green" />
            </TouchableOpacity>
          </View>

          <TextInput 
            style={styles.input} 
            multiline 
            value={noteContent} 
            onChangeText={handleTextChange} 
            placeholder="Write your study notes..."
            autoFocus 
          />
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
  noteCard: { backgroundColor: "#F2F4F7", flex: 1, margin: 8, borderRadius: 15, minHeight: 150 },
  cardContent: { padding: 15, flex: 1, justifyContent: 'space-between' },
  cardText: { fontSize: 14, color: "#333" },
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
  input: { flex: 1, padding: 20, fontSize: 18, textAlignVertical: 'top' }
});