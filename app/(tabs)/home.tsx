import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Dimensions } from 'react-native';
import Colors from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [username, setUsername] = useState('Student');
  const [currentDate, setCurrentDate] = useState('');
  const [currentDay, setCurrentDay] = useState('');

  useEffect(() => {
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
        console.error(error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
        <Text style={styles.sectionTitle}>Recently Watch Video</Text>
        <Text style={styles.sectionSubtitle}>Jump back in the video your were watching</Text>
        
        <View style={styles.videoCard}>
          <Image 
            source={{ uri: 'https://via.placeholder.com/400x200' }} 
            style={styles.videoThumbnail} 
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notes</Text>
        {/* BINAGO: Mula <div> naging <View> na ito */}
        <View style={styles.notesGrid}>
          <View style={styles.noteBox} />
          <View style={styles.noteBox} />
          <View style={styles.noteBox} />
        </View>
      </View>
      
      <View style={{ height: 100 }} />
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary.spaceIndigo,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: 'gray',
    marginBottom: 15,
  },
  videoCard: {
    width: '100%',
    height: 180,
    backgroundColor: '#FFF',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  notesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  noteBox: {
    width: (width - 60) / 3,
    height: 120,
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
  },
});