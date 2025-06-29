const outfitItem = require("../models/outfitItem.model");

const getOutfitItems = async (req, res) => {
  try {
    const outfitItems = await outfitItem.find({});
    res.status(200).json(outfitItems);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getSingleOutfitItem = async (req, res) => {
  try {
    const outfitItem = await outfitItem.findById(req.params.id);
    if (!outfitItem) {
      return res.status(404).json({ message: "OutfitItem not found" });
    }
    res.status(200).json(outfitItem);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const createOutfitItem = async (req, res) => {
  try {
    const outfitItem = await outfitItem.create(req.body);
    res.status(201).json(outfitItem);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateOutfitItem = async (req, res) => {
  try {
    const { id } = req.params;
    const outfitItem = await outfitItem.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!outfitItem) {
      return res
        .status(404)
        .json({ message: `OutfitItem not found with ID ${id}` });
    }
    res.status(200).json(outfitItem);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteOutfitItem = async (req, res) => {
  try {
    const { id } = req.params;
    const outfitItem = await outfitItem.findByIdAndDelete(id);
    if (!outfitItem) {
      return res
        .status(404)
        .json({ message: `OutfitItem not found with ID ${id}` });
    }
    res.status(200).json({ message: "OutfitItem deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOutfitItems,
  getSingleOutfitItem,
  createOutfitItem,
  updateOutfitItem,
  deleteOutfitItem,
};
