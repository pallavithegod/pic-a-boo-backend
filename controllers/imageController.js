const s3Service = require('../services/s3Service');
const db = require('../services/db');

// Generate a presigned URL (returns local sentinel in local mode)
const getPresignedUrl = async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename and contentType are required' });
    }
    const presignedData = await s3Service.generateUploadPresignedUrl(filename, contentType);
    res.status(200).json(presignedData);
  } catch (error) {
    console.error('Error generating presigned URL:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Save uploaded image metadata (publicUrl may be a base64 data URL in local mode)
const createImage = async (req, res) => {
  try {
    const { id, key, publicUrl, filename, width, height, aspectRatio, blurDataUrl, timestamp } = req.body;

    if (!id || !filename) {
      return res.status(400).json({ error: 'id and filename are required' });
    }

    const newImage = db.saveImage({
      id,
      key: key || '',
      publicUrl: publicUrl || '',
      filename,
      width: Number(width) || 0,
      height: Number(height) || 0,
      aspectRatio: Number(aspectRatio) || 1,
      blurDataUrl: blurDataUrl || '',
      timestamp: timestamp || new Date().toISOString()
    });

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error saving image metadata:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// List all images
const getImages = async (req, res) => {
  try {
    const images = db.getAllImages();
    res.status(200).json(images);
  } catch (error) {
    console.error('Error retrieving images:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// Delete an image from the DB (S3 delete is a no-op in local mode)
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Image ID is required' });
    }

    const image = db.deleteImage(id);
    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // S3 delete is a no-op in local mode (silent)
    try {
      await s3Service.deleteS3Object(image.key);
    } catch (s3Error) {
      // Intentionally silent
    }

    res.status(200).json({ message: 'Image deleted successfully', image });
  } catch (error) {
    console.error('Error deleting image:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

module.exports = {
  getPresignedUrl,
  createImage,
  getImages,
  deleteImage
};
