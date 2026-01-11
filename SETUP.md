# Miufy Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd Miufy-Backend
node server.js
```

**Expected output:**
```
✅ MiufyDB Connected
🚀 Server live on 0.0.0.0:5000
📱 Access from your device using your local IP on port 5000
```

### 2. Frontend Setup

```bash
cd ..
npx expo start
```

Then scan the QR code with Expo Go app on your mobile device.

---

## Configuration

### Backend Environment Variables

The backend uses environment variables for configuration. Create a `.env` file in the `Miufy-Backend` folder:

```env
# MongoDB Connection String
MONGODB_URI=mongodb+srv://your-username:your-password@cluster.mongodb.net/database

# Server Configuration
PORT=5000
HOST=0.0.0.0
```

**Note:** A `.env.example` file is provided as a template.

### Frontend API Configuration

The frontend automatically detects the API URL based on environment:

- **Development mode**: Uses the IP from `constants/config.ts` (currently `192.168.1.15:5000`)
- **Production mode**: Uses your deployed backend URL

To change the development API URL:

1. Find your local IP address:
   - **Windows**: `ipconfig` (look for IPv4 Address under Wi-Fi or Ethernet)
   - **Mac/Linux**: `ifconfig` (look for inet under en0 or similar)

2. Update `constants/config.ts`:
   ```typescript
   if (__DEV__) {
     return 'http://YOUR_LOCAL_IP:5000/api';
   }
   ```

---

## Network Connectivity

### Why the backend binds to `0.0.0.0`

The server listens on `0.0.0.0` instead of `localhost` or `127.0.0.1` to allow:
- ✅ Mobile devices on the same Wi-Fi network to connect
- ✅ Expo Go app to communicate with your local backend
- ✅ Testing from multiple devices simultaneously

### Troubleshooting Connection Issues

1. **Make sure both devices are on the same Wi-Fi network**
2. **Check your firewall settings** - allow Node.js through Windows Firewall
3. **Verify the IP address** in `constants/config.ts` matches your current local IP
4. **Restart the backend** after any `.env` changes

---

## Features Implemented

✅ **Centralized API Configuration**
- Single source of truth for API endpoints
- Easy switching between local and production environments
- Environment variable support

✅ **Backend Environment Variables**
- MongoDB URI configuration via `.env`
- Flexible PORT and HOST configuration
- Network-accessible server binding

✅ **Improved Payload Handling**
- 10MB payload limit for large notes and future image uploads

---

## Next Steps (Future Enhancements)

The following features are designed but not yet implemented:

### 📹 Video-Linked Timestamped Notes
- Watch educational videos while taking notes
- Automatic timestamp capture when creating notes
- Click a note to jump back to that exact moment in the video
- Store video URL with each note

### 🖼️ Image Attachments
- Upload images to accompany notes
- Integrate with image picker for diagrams and visual aids
- Cloud storage for images (Cloudinary/AWS S3)

To implement these features, see `implementation_plan.md` Phase 3 and Phase 4.

---

## Testing Your Setup

1. **Start the backend server** (should see "✅ MiufyDB Connected")
2. **Start Expo** and open the app on your device
3. **Navigate to Login** and try logging in
4. **Create a note** in the Notes tab
5. **Verify it persists** by closing and reopening the app

If you encounter any "Cannot connect to server" errors, verify:
- Backend is running
- IP address in `config.ts` is correct
- Both devices are on the same network
