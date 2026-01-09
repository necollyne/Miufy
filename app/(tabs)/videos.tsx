// app/(tabs)/videos.tsx
import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, ScrollView, View, Text, TextInput, Pressable } from 'react-native';
import VideoNoteView from '../../components/VideoNoteView'; 

export default function VideosScreen() {
  // State para sa paglipat ng screen (Library vs Note View)
  const [isTakingNotes, setIsTakingNotes] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {isTakingNotes ? (
          // Kapag nag-back sa VideoNoteView, babalik dito sa Library
          <VideoNoteView onBack={() => setIsTakingNotes(false)} />
        ) : (
          <View>
            {/* Header Section - Dito yung error mo kanina, heto ang fix */}
            <View style={styles.header}>
              <Text style={styles.mainTitle}>Add New Video</Text>
              <Text style={styles.subTitle}>Enter the URL of your video</Text>
            </View>
            
            <TextInput 
              style={styles.urlInput} 
              placeholder="|" 
              placeholderTextColor="#999"
            />

            <Text style={styles.libraryTitle}>Video Library</Text>
            
            {/* Kapag pinindot ang video box, lilipat sa Note Taking */}
            <Pressable style={styles.videoBox} onPress={() => setIsTakingNotes(true)} />
            <Pressable style={styles.videoBox} onPress={() => setIsTakingNotes(true)} />
            <Pressable style={styles.videoBox} onPress={() => setIsTakingNotes(true)} />
          </View>
        )}

        {/* Space para sa capsule tab bar */}
        <View style={{ height: 100 }} />
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
  // ETO ANG FIX: Definition para sa styles.header
  header: {
    marginBottom: 10,
  },
  mainTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#000' 
  },
  subTitle: { 
    fontSize: 12, 
    color: '#000', 
    marginBottom: 15 
  },
  urlInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  libraryTitle: { 
    fontSize: 18, 
    fontWeight: 'bold', 
    color: '#000', 
    marginBottom: 15 
  },
  videoBox: {
    width: '100%',
    height: 160,
    backgroundColor: '#D9D9D9',
    borderRadius: 5,
    marginBottom: 15,
  }
});