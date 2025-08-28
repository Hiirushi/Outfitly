const Item = require("../models/item.model.js");
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');
const s3Client = require('../config/s3');

const getItems = async (req, res) => {
  try {
    const items = await Item.find({});
    res.status(200).json(items);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getSingleItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.status(200).json(item);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const createItem = async (req, res) => {
  try {
    console.log('Create item request received');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    // Check if image was uploaded
    if (!req.file || !req.file.location) {
      return res.status(400).json({ message: "Image is required" });
    }

    // Create item with uploaded image URL
    const itemData = {
      ...req.body,
      image: req.file.location, // S3 URL
      backgroundRemoved: req.file.backgroundRemoved || false // Track if background was removed
    };

    console.log('Creating item with data:', itemData);
    const item = await Item.create(itemData);
    
    console.log('Item created successfully:', item._id);
    console.log('Background removal status:', req.file.backgroundRemoved);
    
    res.status(201).json({
      ...item.toObject(),
      backgroundRemoved: req.file.backgroundRemoved
    });
  } catch (error) {
    console.log('Error creating item:', error.message);
    
    // Clean up uploaded file if item creation fails
    if (req.file && req.file.key) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: req.file.key
        });
        await s3Client.send(deleteCommand);
        console.log('Cleaned up uploaded file due to error');
      } catch (deleteError) {
        console.log('Error deleting image from S3:', deleteError.message);
      }
    }
    
    res.status(500).json({ message: error.message });
  }
};

const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Update item request for ID:', id);
    
    const existingItem = await Item.findById(id);
    if (!existingItem) {
      return res.status(404).json({ message: `Item not found with ID ${id}` });
    }

    let updateData = { ...req.body };

    // If new image is uploaded
    if (req.file && req.file.location) {
      console.log('New image uploaded:', req.file.location);
      console.log('Background removal status:', req.file.backgroundRemoved);
      
      updateData.image = req.file.location;
      updateData.backgroundRemoved = req.file.backgroundRemoved || false;
      
      // Delete old image from S3 if it exists
      if (existingItem.image) {
        try {
          // Extract key from S3 URL
          const urlParts = existingItem.image.split('/');
          const oldImageKey = urlParts.slice(-2).join('/'); // gets "items/filename.jpg"
          
          const deleteCommand = new DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: oldImageKey
          });
          await s3Client.send(deleteCommand);
          console.log('Deleted old image:', oldImageKey);
        } catch (deleteError) {
          console.log('Error deleting old image from S3:', deleteError.message);
        }
      }
    }

    const item = await Item.findByIdAndUpdate(id, updateData, { new: true });
    console.log('Item updated successfully');
    
    res.status(200).json({
      ...item.toObject(),
      backgroundRemoved: req.file ? req.file.backgroundRemoved : item.backgroundRemoved
    });
  } catch (error) {
    console.log('Error updating item:', error.message);
    
    // Clean up uploaded file if update fails
    if (req.file && req.file.key) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: req.file.key
        });
        await s3Client.send(deleteCommand);
      } catch (deleteError) {
        console.log('Error deleting image from S3:', deleteError.message);
      }
    }
    
    res.status(500).json({ message: error.message });
  }
};

const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Item.findByIdAndDelete(id);
    
    if (!item) {
      return res.status(404).json({ message: `Item not found with ID ${id}` });
    }

    // Delete image from S3 if it exists
    if (item.image) {
      try {
        const urlParts = item.image.split('/');
        const imageKey = urlParts.slice(-2).join('/'); // gets "items/filename.jpg"
        
        const deleteCommand = new DeleteObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: imageKey
        });
        await s3Client.send(deleteCommand);
        console.log('Deleted image from S3:', imageKey);
      } catch (deleteError) {
        console.log('Error deleting image from S3:', deleteError.message);
      }
    }

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getItems,
  getSingleItem,
  createItem,
  updateItem,
  deleteItem,
};