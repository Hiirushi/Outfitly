const express = require("express");
const router = express.Router();
const { upload, uploadToS3 } = require('../middleware/upload');

const {
  getItems,
  getSingleItem,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/item.controller");

router.get("/", getItems);
router.get("/:id", getSingleItem);
router.post("/", upload.single('image'), uploadToS3, createItem);
router.put("/:id", upload.single('image'), uploadToS3, updateItem);
router.delete("/:id", deleteItem);

module.exports = router;