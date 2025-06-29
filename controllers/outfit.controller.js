const Outfit = require("../models/Outfit.model");

const getOutfits = async (req, res) => {
  try {
    const outfits = await Outfit.find({});
    res.status(200).json(outfits);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const getSingleOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findById(req.params.id);
    if (!outfit) {
      return res.status(404).json({ message: "Outfit not found" });
    }
    res.status(200).json(outfit);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const createOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.create(req.body);
    res.status(201).json(outfit);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const updateOutfit = async (req, res) => {
  try {
    const { id } = req.params;
    const outfit = await Outfit.findByIdAndUpdate(id, req.body, { new: true });
    if (!outfit) {
      return res
        .status(404)
        .json({ message: `Outfit not found with ID ${id}` });
    }
    res.status(200).json(outfit);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

const deleteOutfit = async (req, res) => {
  try {
    const { id } = req.params;
    const outfit = await Outfit.findByIdAndDelete(id);
    if (!outfit) {
      return res
        .status(404)
        .json({ message: `Outfit not found with ID ${id}` });
    }
    res.status(200).json({ message: "Outfit deleted successfully" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getOutfits,
  getSingleOutfit,
  createOutfit,
  updateOutfit,
  deleteOutfit,
};
