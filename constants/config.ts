// API Configuration for Miufy
// This centralizes all API endpoint URLs for easy switching between local and production

import Constants from 'expo-constants';

/**
 * Determine the API base URL based on environment
 * Priority:
 * 1. Environment variable from app.json extra config
 * 2. Development mode: use local network IP
 * 3. Production: use deployed backend URL
 */
const getApiBaseUrl = (): string => {
    // Check if there's a custom API URL in app.json extra config
    const customApiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (customApiUrl) {
        return customApiUrl;
    }

    // For local development, you can update this IP address to match your machine
    // Or deploy your backend and update this to your production URL
    if (__DEV__) {
        // TODO: Update this IP to your local machine's IP address
        // Find your IP: Run `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
        return 'http://192.168.1.15:5000/api';
    }

    // Production URL - Update this when you deploy your backend
    return 'https://your-production-backend.com/api';
};

export const API_BASE_URL = getApiBaseUrl();

// Specific API endpoints
export const API_ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,

    // User profile endpoints
    getUser: (userId: string) => `${API_BASE_URL}/auth/user/${userId}`,
    updateUser: (userId: string) => `${API_BASE_URL}/auth/user/${userId}`,

    // Notes endpoints
    NOTES: `${API_BASE_URL}/notes`,
    ADD_NOTE: `${API_BASE_URL}/notes/add`,

    // Helper function to get user notes
    getUserNotes: (userId: string) => `${API_BASE_URL}/notes/${userId}`,

    // Helper function to update/delete note
    getNote: (noteId: string) => `${API_BASE_URL}/notes/${noteId}`,
    deleteUserNotes: (userId: string) => `${API_BASE_URL}/notes/user/${userId}`,

    // Video library endpoints (persistent storage)
    VIDEOS: `${API_BASE_URL}/videos`,
    ADD_VIDEO: `${API_BASE_URL}/videos/add`,
    getUserVideos: (userId: string) => `${API_BASE_URL}/videos/${userId}`,
    getVideo: (videoId: string) => `${API_BASE_URL}/videos/${videoId}`,
    deleteUserVideos: (userId: string) => `${API_BASE_URL}/videos/user/${userId}`,
};

// Export for debugging
export const logApiConfig = () => {
    console.log('🔧 API Configuration:', {
        baseUrl: API_BASE_URL,
        isDev: __DEV__,
        endpoints: API_ENDPOINTS,
    });
};

