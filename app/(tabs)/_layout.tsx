import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarShowLabel: false,
      tabBarActiveTintColor: '#000',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        // Fixed at bottom, not floating
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 70 + insets.bottom,
        paddingBottom: insets.bottom,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      tabBarItemStyle: {
        flex: 1,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
      }
    }}>
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeContainer]}>
              <Ionicons name={focused ? "home" : "home-outline"} size={24} color={focused ? "#000" : "#666"} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="note"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeContainer]}>
              <Ionicons name={focused ? "document-text" : "document-text-outline"} size={24} color={focused ? "#000" : "#666"} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="videos"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeContainer]}>
              <Ionicons name={focused ? "videocam" : "videocam-outline"} size={24} color={focused ? "#000" : "#666"} />
            </View>
          )
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={[styles.iconContainer, focused && styles.activeContainer]}>
              <Ionicons name={focused ? "person" : "person-outline"} size={24} color={focused ? "#000" : "#666"} />
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
  iconContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 24,
  },
  activeContainer: {
    backgroundColor: '#99FF33',
  }
});