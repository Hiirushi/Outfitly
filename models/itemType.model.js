const mongoose = require("mongoose");

const itemTypeSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
  },
});

const ItemType = mongoose.model("ItemType", itemTypeSchema);
module.exports = ItemType;