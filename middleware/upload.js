const multer = require('multer');
const { Upload } = require('@aws-sdk/lib-storage');
const s3Client = require('../config/s3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure multer to use memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    console.log('File received:', file.originalname, 'Type:', file.mimetype);
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Custom middleware to handle S3 upload
const uploadToS3 = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    // Generate unique filename
    const fileExtension = path.extname(req.file.originalname);
    const fileName = `items/${uuidv4()}${fileExtension}`;

    console.log('Uploading to S3:', fileName);

    // Upload to S3 using AWS SDK v3 (no ACL - using bucket policy instead)
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype
        // No ACL needed - bucket policy handles public access
      }
    });

    const result = await upload.done();
    
    // Create the public URL (your bucket policy makes this publicly accessible)
    const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    
    // Add S3 information to req.file
    req.file.location = publicUrl;
    req.file.key = fileName;

    console.log('File uploaded successfully:', publicUrl);
    next();
  } catch (error) {
    console.error('S3 upload error:', error);
    res.status(500).json({ 
      message: 'Failed to upload image to S3',
      error: error.message 
    });
  }
};

module.exports = { upload, uploadToS3 };