const express = require("express");
const router = express.Router();

const {
  getOutfits,
  getSingleOutfit,
  createOutfit,
  updateOutfit,
  deleteOutfit,
} = require("../controllers/outfit.controller");

router.get("/", getOutfits);
router.get("/:id", getSingleOutfit);
router.post("/", createOutfit);
router.put("/:id", updateOutfit);
router.delete("/:id", deleteOutfit);

module.exports = router;
