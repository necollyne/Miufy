const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
app.use(cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

const atlasURI = process.env.MONGODB_URI || "mongodb+srv://miufy_admin:admin123@cluster0.ahz8eue.mongodb.net/MiufyDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(atlasURI)
  .then(() => console.log('MiufyDB Connected'))
  .catch(err => console.error('Error:', err.message));

const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  displayUsername: { type: String, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: null }
}));

const Note = mongoose.model('Note', new mongoose.Schema({
  userId: { type: String, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String, default: null },
  timestamp: { type: Number, default: null },
  images: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
}));

const Video = mongoose.model('Video', new mongoose.Schema({
  userId: { type: String, required: true },
  url: { type: String, required: true },
  title: { type: String, default: 'Untitled Video' },
  author: { type: String, default: 'Unknown' },
  thumbnail: { type: String, default: null },
  addedAt: { type: Date, default: Date.now }
}));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, displayUsername, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ msg: "Email taken." });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, displayUsername, password: hashedPassword });
    await user.save();
    res.status(201).json({ userId: user._id });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Database Conflict: Please delete the email_1 index in Atlas." });
    }
    res.status(500).json({ msg: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: "User not found." });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Wrong password." });
    res.json({
      userId: user._id,
      displayUsername: user.displayUsername,
      profilePicture: user.profilePicture
    });
  } catch (err) {
    res.status(500).json({ error: "Login error." });
  }
});

app.get('/api/auth/user/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ msg: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Fetch error." });
  }
});

app.put('/api/auth/user/:userId', async (req, res) => {
  try {
    const { displayUsername, profilePicture, oldPassword, newPassword } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) return res.status(404).json({ message: "User not found." });

    if (oldPassword && newPassword) {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect." });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters." });
      }

      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (displayUsername) user.displayUsername = displayUsername;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;

    await user.save();

    res.json({
      message: "User updated successfully",
      displayUsername: user.displayUsername
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/notes/:userId', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: "Fetch error." });
  }
});

app.post('/api/notes/add', async (req, res) => {
  try {
    const { userId, content, videoUrl, timestamp, images } = req.body;
    const newNote = new Note({
      userId,
      content,
      videoUrl: videoUrl || null,
      timestamp: timestamp || null,
      images: images || []
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: "Add error." });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const { content, videoUrl, timestamp, images } = req.body;
    const updateData = { content };
    if (videoUrl !== undefined) updateData.videoUrl = videoUrl;
    if (timestamp !== undefined) updateData.timestamp = timestamp;
    if (images !== undefined) updateData.images = images;

    const updatedNote = await Note.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: "Update error." });
  }
});

app.delete('/api/notes/user/:userId', async (req, res) => {
  try {
    const result = await Note.deleteMany({ userId: req.params.userId });
    console.log(`Deleted ${result.deletedCount} notes for user ${req.params.userId}`);
    res.json({ message: `Deleted ${result.deletedCount} notes` });
  } catch (err) {
    console.error('Error deleting notes:', err);
    res.status(500).json({ error: "Delete error." });
  }
});

app.delete('/api/notes/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted." });
  } catch (err) {
    res.status(500).json({ error: "Delete error." });
  }
});

app.get('/api/videos/:userId', async (req, res) => {
  try {
    const videos = await Video.find({ userId: req.params.userId }).sort({ addedAt: -1 });
    res.json(videos);
  } catch (err) {
    res.status(500).json({ error: "Fetch error." });
  }
});

app.post('/api/videos/add', async (req, res) => {
  try {
    const { userId, url, title, author, thumbnail } = req.body;
    const newVideo = new Video({
      userId,
      url,
      title: title || 'Untitled Video',
      author: author || 'Unknown',
      thumbnail: thumbnail || null
    });
    await newVideo.save();
    res.status(201).json(newVideo);
  } catch (err) {
    res.status(500).json({ error: "Add error." });
  }
});

app.delete('/api/videos/:id', async (req, res) => {
  try {
    await Video.findByIdAndDelete(req.params.id);
    res.json({ msg: "Deleted." });
  } catch (err) {
    res.status(500).json({ error: "Delete error." });
  }
});

app.delete('/api/videos/user/:userId', async (req, res) => {
  try {
    await Video.deleteMany({ userId: req.params.userId });
    res.json({ msg: "All videos deleted." });
  } catch (err) {
    res.status(500).json({ error: "Delete error." });
  }
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Server live on ${HOST}:${PORT}`);
  console.log(`Access from your device using your local IP on port ${PORT}`);
});
