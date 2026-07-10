const express = require('express');
const router = express.Router();
const imageController = require('../controllers/imageController');

// Presigned URL generation for client PUT to S3
router.post('/upload/presign', imageController.getPresignedUrl);

// Image metadata operations
router.post('/images', imageController.createImage);
router.get('/images', imageController.getImages);
router.delete('/images/:id', imageController.deleteImage);

module.exports = router;
