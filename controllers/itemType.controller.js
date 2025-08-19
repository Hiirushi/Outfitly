const ItemType = require("../models/itemType.model.js");


const createItemType = async (req,res) => {
    try {
        const itemType = await ItemType.create(req.body);
        res.status(201).json(itemType);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};

const getItemTypes = async (req, res) => {
    try {
        const itemTypes = await ItemType.find({});
        res.status(200).json(itemTypes);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createItemType,
    getItemTypes
};