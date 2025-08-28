const express = require("express");
const router = express.Router();

const {
  getOutfits,
  getSingleOutfit,
  createOutfit,
  deleteOutfit,
} = require("../controllers/outfit.controller");

router.get("/", getOutfits);
router.get("/:id", getSingleOutfit);
router.post("/", createOutfit);
router.delete("/:id", deleteOutfit);

module.exports = router;
