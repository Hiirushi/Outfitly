const express = require("express");
const router = express.Router();

const {
  getItems,
  getSingleItem,
  createItem,
  updateItem,
  deleteItem,
} = require("../controllers/item.controller");

router.get("/", getItems);
router.get("/:id", getSingleItem);
router.post("/", createItem);
router.put("/:id", updateItem);
router.delete("/:id", deleteItem);

module.exports = router;
