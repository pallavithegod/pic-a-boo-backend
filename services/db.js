const fs = require('fs');
const path = require('path');

const dbDir = path.join(__dirname, '../data');
const dbFilePath = path.join(dbDir, 'images.json');

// Ensure database directory and file exist
const initDb = () => {
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify([], null, 2), 'utf-8');
  }
};

// Read all image records
const getAllImages = () => {
  initDb();
  try {
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    const images = JSON.parse(data);
    // Sort descending by timestamp (newest first)
    return images.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error reading database:', error);
    return [];
  }
};

// Save an image record
const saveImage = (imageData) => {
  initDb();
  try {
    const images = getAllImages();
    const newImage = {
      id: imageData.id,
      key: imageData.key,
      publicUrl: imageData.publicUrl,
      filename: imageData.filename,
      width: Number(imageData.width),
      height: Number(imageData.height),
      aspectRatio: Number(imageData.aspectRatio),
      blurDataUrl: imageData.blurDataUrl || '',
      timestamp: imageData.timestamp || new Date().toISOString()
    };
    images.push(newImage);
    fs.writeFileSync(dbFilePath, JSON.stringify(images, null, 2), 'utf-8');
    return newImage;
  } catch (error) {
    console.error('Error writing to database:', error);
    throw new Error('Failed to save image metadata');
  }
};

// Delete an image record by ID
const deleteImage = (id) => {
  initDb();
  try {
    const images = getAllImages();
    const filteredImages = images.filter(img => img.id !== id);
    const deletedImage = images.find(img => img.id === id);
    fs.writeFileSync(dbFilePath, JSON.stringify(filteredImages, null, 2), 'utf-8');
    return deletedImage;
  } catch (error) {
    console.error('Error deleting from database:', error);
    throw new Error('Failed to delete image metadata');
  }
};

module.exports = {
  getAllImages,
  saveImage,
  deleteImage
};
