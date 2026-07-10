const { v4: uuidv4 } = require('uuid');

// S3 is bypassed for local-only mode.
// Images are stored as base64 data URLs sent directly from the client.
// This service generates a local key and returns a mock presigned URL
// that the client will never actually call.

const generateUploadPresignedUrl = async (filename, contentType) => {
  const uniqueId = uuidv4();
  const fileExtension = filename.split('.').pop();
  const key = `local/${uniqueId}.${fileExtension}`;

  return {
    presignedUrl: 'local', // sentinel value — client skips S3 PUT
    key,
    publicUrl: ''           // client will supply the real base64 data URL
  };
};

// No-op: nothing to delete from S3 in local mode
const deleteS3Object = async (key) => {
  // local mode — no-op
};

module.exports = {
  generateUploadPresignedUrl,
  deleteS3Object
};
