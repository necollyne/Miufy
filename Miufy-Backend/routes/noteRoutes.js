const express = require('express');
const router = express.Router();
const Note = require('../models/Note');

router.get('/:userId', async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/add', async (req, res) => {
  try {
    const { userId, content } = req.body;
    const newNote = new Note({ userId, content });
    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { content: req.body.content },
      { new: true }
    );
    res.json(updatedNote);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all notes for a user
router.delete('/user/:userId', async (req, res) => {
  try {
    const result = await Note.deleteMany({ userId: req.params.userId });
    res.json({ message: `Deleted ${result.deletedCount} notes` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;