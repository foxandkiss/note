const express = require('express');
const noteController = require('../controllers/noteController');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/notes', isAuthenticated, noteController.getNotes);
router.post('/notes', isAuthenticated, noteController.createNote);
router.put('/notes/:id', isAuthenticated, noteController.updateNote);
router.delete('/notes/:id', isAuthenticated, noteController.deleteNote);

module.exports = router;