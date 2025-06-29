const mongoose = require("mongoose");

const outfitItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    outfit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Outfit",
    },
  },
  { timestamps: true }
);

const OutfitItem = mongoose.model("OutfitItem", outfitItemSchema);
module.exports = OutfitItem;
