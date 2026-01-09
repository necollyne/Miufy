import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: '#000',
      tabBarStyle: { 
        position: 'absolute',
        bottom: 30, 
        left: 30,
        right: 30,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FFF',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        paddingBottom: 0,
        borderTopWidth: 0,
        overflow: 'hidden',
      },
      tabBarItemStyle: {
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
      }
    }}>
      <Tabs.Screen 
        name="home" 
        options={{ 
          tabBarIcon: ({focused}) => (
            <View style={[styles.iconWrapper, focused && styles.activeBg]}>
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color="black" />
            </View>
          )
        }} 
      />
      <Tabs.Screen 
        name="note" 
        options={{ 
          tabBarIcon: ({focused}) => (
            <View style={[styles.iconWrapper, focused && styles.activeBg]}>
              <Ionicons name={focused ? "document-text" : "document-text-outline"} size={24} color="black" />
            </View>
          )
        }} 
      />
      <Tabs.Screen 
        name="videos" 
        options={{ 
          tabBarIcon: ({focused}) => (
            <View style={[styles.iconWrapper, focused && styles.activeBg]}>
              <Ionicons name={focused ? "videocam" : "videocam-outline"} size={24} color="black" />
            </View>
          )
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          tabBarIcon: ({focused}) => (
            <View style={[styles.iconWrapper, focused && styles.activeBg]}>
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color="black" />
            </View>
          )
        }} 
      />
      
      <Tabs.Screen name="dashboard" options={{ href: null }} />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 60, 
    height: 40, 
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  activeBg: {
    backgroundColor: '#99FF33',
  }
});