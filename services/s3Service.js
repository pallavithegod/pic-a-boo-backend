const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { v4: uuidv4 } = require('uuid');

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1'
});

const generateUploadPresignedUrl = async (filename, contentType) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error('S3_BUCKET_NAME environment variable is not set');
  }

  const uniqueId = uuidv4();
  const fileExtension = filename.split('.').pop();
  const key = `uploads/${uniqueId}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;

  return {
    presignedUrl,
    key,
    publicUrl
  };
};

const deleteS3Object = async (key) => {
  const bucketName = process.env.S3_BUCKET_NAME;
  if (!bucketName) return;
  
  // CRITICAL SECURITY FIX: Prevent empty keys from turning into a DELETE / (DeleteBucket) request
  if (!key || key.trim() === '') {
    console.warn('Attempted to delete S3 object with empty key. Aborting to prevent bucket deletion.');
    return;
  }

  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key
  });

  await s3Client.send(command);
};

module.exports = {
  generateUploadPresignedUrl,
  deleteS3Object
};
