const express = require('express');
const cors = require('cors');
require('dotenv').config();

const imageRoutes = require('./routes/imageRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Parse incoming JSON requests.
// Configured with a 10MB limit to support base64 blurDataUrl strings.
// 50MB limit to support base64-encoded WebP image data URLs (local mode, no S3)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Mount image gallery and upload API routes
app.use('/api', imageRoutes);

// Root endpoint health check
app.get('/', (req, res) => {
  res.send('Pic-a-boo Backend API is active.');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error handler triggered:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});