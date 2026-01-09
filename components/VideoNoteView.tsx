import React from 'react';
import { View, Text, StyleSheet, Image, TextInput, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface VideoNoteViewProps {
  onBack: () => void;
}

export default function VideoNoteView({ onBack }: VideoNoteViewProps) {
  return (
    <View style={styles.container}>
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <Pressable onPress={onBack}>
          <Ionicons name="return-up-back" size={28} color="#99FF33" />
        </Pressable>
        <Text style={styles.headerTitle}>Video : Taking notes while video ...</Text>
      </View>

      {/* VIDEO SECTION */}
      <View style={styles.videoWrapper}>
        <Image 
          source={{ uri: 'https://via.placeholder.com/400x225' }} 
          style={styles.videoImage}
        />
      </View>

      {/* VIDEO DETAILS */}
      <View style={styles.infoContainer}>
        <Text style={styles.videoTitle}>HOW TO DRAW BACKGROUND IN 1 HOUR</Text>
        <Text style={styles.authorText}>By PotatoBunn</Text>
      </View>

      {/* INPUT BOX */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="|"
          multiline
        />
      </View>

      {/* PREVIOUS NOTES LIST */}
      <View style={styles.notesSection}>
        <Text style={styles.sectionLabel}>Your Notes</Text>
        <View style={styles.notePlaceholder} />
        <View style={styles.notePlaceholder} />
        <View style={styles.notePlaceholder} />
        <View style={styles.notePlaceholder} />
      </View>
    </View>
  );
}

// PINAGSAMA NA LAHAT NG STYLES SA ISANG BLOCK
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF' 
  },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15,
    paddingTop: 10,
  },
  headerTitle: { 
    fontSize: 14, 
    color: '#666', 
    marginLeft: 10 
  },
  videoWrapper: { 
    width: '100%', 
    height: 200, 
    backgroundColor: '#000', 
    borderRadius: 5, 
    overflow: 'hidden' 
  },
  videoImage: { 
    width: '100%', 
    height: '100%' 
  },
  infoContainer: { 
    marginTop: 15 
  },
  videoTitle: { 
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#000'
  },
  authorText: { 
    fontSize: 12, 
    color: '#666' 
  },
  inputContainer: { 
    marginTop: 15 
  },
  textInput: { 
    height: 120, 
    borderWidth: 1, 
    borderColor: '#333', 
    borderRadius: 15, 
    padding: 15, 
    textAlignVertical: 'top' 
  },
  notesSection: { 
    marginTop: 20 
  },
  sectionLabel: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    marginBottom: 10 
  },
  notePlaceholder: { 
    width: '100%', 
    height: 35, 
    backgroundColor: '#D9D9D9', 
    borderRadius: 5, 
    marginBottom: 8 
  },
});