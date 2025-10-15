const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Configuration constants
const jsonBodyLimit = process.env.JSON_BODY_LIMIT || '10mb';
const uploadsDir = path.join(__dirname, 'uploads');
const audioMimeTypes = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
};
const audioExtensions = new Set(Object.keys(audioMimeTypes));

app.disable('x-powered-by');

// Core middleware stack
app.use(cors());
app.use(express.json({ limit: jsonBodyLimit }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded assets (audio/images) while keeping audio inline-only
app.use('/uploads', express.static(uploadsDir, {
  setHeaders: (res, filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    if (!audioExtensions.has(ext)) {
      return;
    }
    if (!res.getHeader('Content-Disposition')) {
      res.setHeader('Content-Disposition', 'inline');
    }
    if (!res.getHeader('Content-Type')) {
      res.setHeader('Content-Type', audioMimeTypes[ext] || 'application/octet-stream');
    }
    res.setHeader('Accept-Ranges', 'bytes');
  },
}));

// Database connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
  .catch((error) => console.log('MongoDB connection error:', error));

// Application routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/placement-tests', require('./routes/placementTest'));

// Fallback error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// 404 handler for any unmatched route
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
