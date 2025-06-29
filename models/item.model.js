const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [false],
    },
    type: {
      type: String,
      required: [true, "Type is required"],
    },
    color: {
      type: String,
      required: [true, "Color is required"],
    },
    dressCode: {
      type: String,
      required: [true, "Dress code is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    brand: {
      type: String,
      required: [true, "Brand is required"],
    },
    material: {
      type: String,
      required: [true, "Material is required"],
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Item = mongoose.model("Item", itemSchema);
module.exports = Item;
