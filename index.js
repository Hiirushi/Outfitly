require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const app = express();
const userRoutes = require("./routes/user.route.js");
const itemRoutes = require("./routes/item.route.js");
const outfitRoutes = require("./routes/outfit.route.js");
const outfitItemRoutes = require("./routes/outfitItem.route.js");
const itemTypeRoutes = require("./routes/itemType.route.js");

//middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS configuration for React Native
app.use(cors({
  origin: ["http://localhost:8081", "http://localhost:19006", "exp://localhost:19000"], // Expo dev server URLs
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

//routes
app.use("/users", userRoutes);
app.use("/items", itemRoutes);
app.use("/outfits", outfitRoutes);
app.use("/outfitItems", outfitItemRoutes);
app.use("/itemType", itemTypeRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("Hello from Node API Server");
});

//Connect to MongoDB
mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://hirushiaramandeniya23:1111@outfitly.lllvj.mongodb.net/Outfitly"
  )
  .then(() => {
    app.listen(3000, () => {
      console.log("Node API app is running on port 3000");
      
      // Debug: Check if environment variables are loaded
      console.log("\n=== Environment Variables Check ===");
      console.log("AWS_REGION:", process.env.AWS_REGION);
      console.log("AWS_BUCKET_NAME:", process.env.AWS_BUCKET_NAME);
      console.log("AWS_ACCESS_KEY_ID:", process.env.AWS_ACCESS_KEY_ID ? "✓ Set" : "✗ Not set");
      console.log("AWS_SECRET_ACCESS_KEY:", process.env.AWS_SECRET_ACCESS_KEY ? "✓ Set" : "✗ Not set");
      console.log("=====================================\n");
    });
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));