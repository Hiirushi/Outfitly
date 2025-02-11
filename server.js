const express = require("express");
const mongoose = require("mongoose");
const app = express();

app.get("/", (req, res) => {
  res.send("Hello Node");
});

app.get("/api", (req, res) => {
  res.send("Hi");
});

mongoose.set("strictQuery", false);
mongoose
  .connect(
    "mongodb+srv://hirushiaramandeniya23:1111@outfitly.lllvj.mongodb.net/Node-API"
  )
  .then(() => {
    app.listen(3000, () => {
      console.log("Node API app is running on port 3000");
    });
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.error("Could not connect to MongoDB", err));
