const express = require("express");
const router = express.Router();

const {
    createItemType,
    getItemTypes
} = require("../controllers/itemType.controller");

router.post("/", createItemType);
router.get("/", getItemTypes);

module.exports = router;