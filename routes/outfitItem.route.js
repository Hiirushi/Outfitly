const express = require("express");
const router = express.Router();

const {
  getOutfitItems,
  getSingleOutfitItem,
  createOutfitItem,
  updateOutfitItem,
  deleteOutfitItem,
} = require("../controllers/outfitItem.controller");

router.get("/", getOutfitItems);
router.get("/:id", getSingleOutfitItem);
router.post("/", createOutfitItem);
router.put("/:id", updateOutfitItem);
router.delete("/:id", deleteOutfitItem);

module.exports = router;
