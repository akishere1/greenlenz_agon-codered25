const express = require("express");
const path = require("path");
const multer = require("multer");
require("dotenv").config(); // Load environment variables
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const { GridFsStorage } = require("multer-gridfs-storage");

const app = express();

// Set up EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Middleware for parsing request bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection setup
const mongoURI = process.env.DB_CONNECTION_STRING;

const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("uploads");
});

// Set up GridFS storage
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return {
      filename: `${Date.now()}-${file.originalname}`,
      bucketName: "uploads",
    };
  },
});

const upload = multer({ storage });

// Routes
app.get("/", (req, res) => {
  res.render("index"); // Ensure "index.ejs" is in the "views" folder
});
app.get("/admin", (req, res) => {
  res.render("admin"); // Ensure "admin.ejs" is in the "views" folder
});
app.get("/logout", (req, res) => {
  res.render("index"); // Ensure "index.ejs" is in the "views" folder
});

// Upload Route (Storing Image in MongoDB)
app.post("/api/upload", upload.single("photo"), async (req, res) => {
  try {
    const { description, location } = req.body;
    if (!req.file || !description || !location) {
      return res.status(400).json({ error: "Photo, description, and location are required." });
    }

    const locationData = JSON.parse(location);

    res.status(201).json({
      message: "Photo uploaded successfully!",
      fileId: req.file.id, // File ID in MongoDB
      filename: req.file.filename,
      description,
      location: {
        latitude: locationData.latitude,
        longitude: locationData.longitude,
      },
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

// Retrieve Image by ID
app.get("/api/image/:id", async (req, res) => {
  try {
    const file = await gfs.files.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });
    if (!file) {
      return res.status(404).json({ error: "File not found" });
    }

    const readStream = gfs.createReadStream(file.filename);
    readStream.pipe(res);
  } catch (error) {
    console.error("Error retrieving image:", error);
    res.status(500).json({ error: "Failed to retrieve image" });
  }
});

// Start the server
const PORT = process.env.PORT || 27017;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
