const mongoose = require("mongoose");

const outfitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    occasion: {
      type: String,
      required: [true, "Occasion is required"],
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
    plannedDate: {
      type: Date,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        x: { type: Number, required: true }, // canvas x coordinate
        y: { type: Number, required: true }, // canvas y coordinate
        width: { type: Number }, // optional, in case user resizes item
        height: { type: Number }, // optional
        rotation: { type: Number }, // optional for canvas rotation
        zIndex: { type: Number }, // optional for stacking order
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Outfit = mongoose.model("Outfit", outfitSchema);
module.exports = Outfit;
