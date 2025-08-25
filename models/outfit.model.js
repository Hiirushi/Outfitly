const mongoose = require("mongoose");

const outfitSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    occassion: {
      type: String,
      required: [true, "occasion is required"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    createdDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const Outfit = mongoose.model("Outfit", outfitSchema);
module.exports = Outfit;
