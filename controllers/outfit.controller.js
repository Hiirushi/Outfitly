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
