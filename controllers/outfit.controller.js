const Outfit = require("../models/outfit.model");
const Item = require("../models/item.model");

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

    // Create outfit
    const outfit = await Outfit.create({
      name,
      occasion,
      plannedDate,
      user,
      items, // expects array of { item, x, y, width, height, rotation, zIndex }
    });

    // Increment usageCount by 1 for each unique item used in the outfit
    if (items && items.length > 0) {
      const itemIds = items
        .map((it) => it.item)
        .filter(Boolean)
        .map(String);
      const uniqueItemIds = [...new Set(itemIds)];

      // Build a list of update operations that increment usageCount by 1
      const usageIncrement = uniqueItemIds.map((id) => ({
        updateOne: {
          filter: { _id: id },
          update: { $inc: { usageCount: 1 } },
        },
      }));

      if (usageIncrement.length > 0) {
        await Item.bulkWrite(usageIncrement);
      }
    }

    res.status(201).json(outfit);
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
  deleteOutfit,
};
