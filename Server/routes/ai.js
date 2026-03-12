const express = require('express');
const router = express.Router();
const { generateMediaTranscript } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');

const isAdmin = authorize('admin');

// Route sinh transcript cho media (Yêu cầu Admin)
router.post('/generate-transcript', protect, isAdmin, generateMediaTranscript);

module.exports = router;
