const Note = require('../models/Note');

exports.createNote = async (req, res) => {
  const { content } = req.body;
  try {
    const note = new Note({
      userId: req.session.userId,
      content,
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).send('Error creating note');
  }
};

exports.getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.session.userId });
    res.json(notes);
  } catch (error) {
    res.status(500).send('Error fetching notes');
  }
};

exports.updateNote = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  try {
    const note = await Note.findOneAndUpdate({ _id: id, userId: req.session.userId }, { content }, { new: true });
    if (!note) {
      return res.status(404).send('Note not found');
    }
    res.json(note);
  } catch (error) {
    res.status(500).send('Error updating note');
  }
};

exports.deleteNote = async (req, res) => {
  const { id } = req.params;
  try {
    const note = await Note.findOneAndDelete({ _id: id, userId: req.session.userId });
    if (!note) {
      return res.status(404).send('Note not found');
    }
    res.status(204).send();
  } catch (error) {
    res.status(500).send('Error deleting note');
  }
};