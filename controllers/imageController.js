const s3Service = require('../services/s3Service');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand, ScanCommand, DeleteCommand, GetCommand } = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'eu-north-1' });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = 'PicabooImages';

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

    const newImage = {
      id, key, publicUrl, filename, width, height, aspectRatio, blurDataUrl, timestamp: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: newImage
    }));

    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error saving image metadata:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

// List all images
const getImages = async (req, res) => {
  try {
    const { Items } = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME
    }));
    
    // Sort by timestamp descending (newest first)
    const images = (Items || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
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

    // Get the image first to find its S3 key
    const { Item } = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }));

    if (!Item) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete from DynamoDB
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }));

    // Delete from S3
    try {
      if (Item.key) {
        await s3Service.deleteS3Object(Item.key);
      }
    } catch (s3Error) {
      console.error('Failed to delete S3 object:', s3Error.message);
    }
    
    const image = Item;

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
