const Outfit = require("../models/Outfit.model");

// GET all outfits
const getOutfits = async (req, res) => {
  try {
    const outfits = await Outfit.find({})
      .populate("items.item") // populate item details
      .sort({ createdAt: -1 });

    res.status(200).json(outfits);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

// GET single outfit by ID
const getSingleOutfit = async (req, res) => {
  try {
    const outfit = await Outfit.findById(req.params.id).populate("items.item");
    if (!outfit) {
      return res.status(404).json({ message: "Outfit not found" });
    }
    res.status(200).json(outfit);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

// CREATE new outfit
const createOutfit = async (req, res) => {
  try {
    const { name, occasion, plannedDate, user, items } = req.body;

    if (!name || !occasion || !user || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const outfit = await Outfit.create({
      name,
      occasion,
      plannedDate,
      user,
      items, // expects array of { item, x, y, width, height, rotation, zIndex }
    });

    res.status(201).json(outfit);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

// UPDATE outfit
const updateOutfit = async (req, res) => {
  try {
    const { id } = req.params;
    const outfit = await Outfit.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("items.item");

    if (!outfit) {
      return res
        .status(404)
        .json({ message: `Outfit not found with ID ${id}` });
    }

    res.status(200).json(outfit);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
  }
};

// DELETE outfit
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
    console.error(error.message);
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
