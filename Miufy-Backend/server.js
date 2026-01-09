const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());

/** * ✅ FIX: Taasan ang limit sa 10mb. 
 * Ito ang dahilan ng 'PayloadTooLargeError' sa terminal mo.
 */
app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// DATABASE CONNECTION
const atlasURI = "mongodb+srv://miufy_admin:admin123@cluster0.ahz8eue.mongodb.net/MiufyDB?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(atlasURI)
  .then(() => console.log('✅ MiufyDB Connected'))
  .catch(err => console.error('❌ Error:', err.message));

// MODELS
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  displayUsername: { type: String, required: true },
  password: { type: String, required: true }
}));

const Note = mongoose.model('Note', new mongoose.Schema({
  userId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
}));

// --- AUTH ROUTES ---
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
    // Handler para sa email_1 duplicate index error
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Database Conflict: Burahin ang email_1 index sa Atlas." });
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
    res.json({ userId: user._id, displayUsername: user.displayUsername });
  } catch (err) {
    res.status(500).json({ error: "Login error." });
  }
});

// --- NOTES ROUTES ---
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
    const { userId, content } = req.body;
    const newNote = new Note({ userId, content });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (err) {
    res.status(500).json({ error: "Add error." });
  }
});

app.put('/api/notes/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(req.params.id, { content: req.body.content }, { new: true });
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: "Update error." });
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

app.listen(5000, () => console.log(`🚀 Server live on port 5000`));