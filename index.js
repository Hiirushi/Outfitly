const express = require("express");
const mongoose = require("mongoose");
const app = express();
const userRoutes = require("./routes/user.route");
const itemRoutes = require("./routes/item.route");
const outfitRoutes = require("./routes/outfit.route");
const outfitItemRoutes = require("./routes/outfitItem.route");

//middleware
app.use(express.json());

//routes
app.use("/users", userRoutes);
app.use("/items", itemRoutes);
app.use("/outfits", outfitRoutes);
app.use("/outfitItems", outfitItemRoutes);

//Connect to MongoDB
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://hirushiaramandeniya23:1111@outfitly.lllvj.mongodb.net/Outfitly"
  )
  .then(() => {
    app.listen(3000, () => {
      console.log("Node API app is running on port 3000");
    });
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));
