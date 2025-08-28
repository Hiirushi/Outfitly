const mongoose = require("mongoose");

const itemSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [false],
    },
    color: {
      type: String,
      required: [true, "Color is required"],
      enum: {
        values: [
          "Red",
          "Blue",
          "Green",
          "Yellow",
          "Black",
          "White",
          "Gray",
          "Brown",
          "Pink",
          "Purple",
          "Orange",
          "Beige",
        ],
        message: "{VALUE} is not a valid color",
      },
    },
    dressCode: {
      type: String,
      required: [true, "Dress code is required"],
      enum: {
        values: [
          "Casual",
          "Business Casual",
          "Business Formal",
          "Formal",
          "Semi-Formal",
          "Party",
          "Athletic",
          "Beachwear",
          "Other",
        ],
        message: "{VALUE} is not a valid dress code",
      },
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
      enum: {
        values: [
          "Cotton",
          "Linen",
          "Silk",
          "Wool",
          "Polyester",
          "Nylon",
          "Denim",
          "Leather",
          "Velvet",
          "Satin",
          "Chiffon",
          "Other",
        ],
        message: "{VALUE} is not a valid material",
      },
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    dateAdded: {
      type: Date,
      default: Date.now,
    },
    itemType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ItemType",
      required: [true, "ItemType is required"],
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
