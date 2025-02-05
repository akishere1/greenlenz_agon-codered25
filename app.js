const express = require("express");
const path = require("path");
const multer = require("multer");
require("dotenv").config();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const { GridFSBucket } = require("mongodb");
const { Readable } = require("stream");

const app = express();

// Set up EJS as the template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Ensure DB_CONNECTION_STRING is defined in .env
if (!process.env.DB_CONNECTION_STRING) {
  console.error("DB_CONNECTION_STRING is not set in .env file.");
  process.exit(1);
}

// MongoDB connection
const mongoURI = process.env.DB_CONNECTION_STRING;
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Ensure connection is established before proceeding
conn.once("open", () => {
  console.log("🔥 MongoDB Atlas connected");
  bucket = new GridFSBucket(conn.db, { bucketName: "uploads" });
  gfs = conn.db.collection("uploads.files");
});

// Multer setup with validation for file type and size
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image files are allowed!"), false);
    }
    cb(null, true);
  },
});

// Serve index.ejs
app.get("/", (req, res) => {
  res.render("index");
});

// ✅ File Upload Route (Using GridFSBucket)
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded.");

  console.log("Received file:", req.file); // Log the uploaded file details

  try {
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);

    const uploadStream = bucket.openUploadStream(req.file.originalname);
    readableStream.pipe(uploadStream);

    uploadStream.on("finish", () => {
      console.log(`File uploaded successfully with ID: ${uploadStream.id}`);
      res.json({
        message: "File uploaded successfully",
        fileId: uploadStream.id,
        filename: req.file.originalname,
      });
    });

    uploadStream.on("error", (err) => {
      console.error("Upload error:", err);
      res.status(500).json({ error: "Upload failed.", details: err.message });
    });
  } catch (err) {
    console.error("Error during file upload:", err);
    res.status(500).json({ error: "Error during file upload.", details: err.message });
  }
});

// ✅ Retrieve Image by ID
app.get("/image/:id", async (req, res) => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const file = await gfs.findOne({ _id: fileId });

    if (!file) return res.status(404).send("File not found.");

    const downloadStream = bucket.openDownloadStream(fileId);
    res.set("Content-Type", file.contentType);
    downloadStream.pipe(res);
  } catch (err) {
    console.error("Error retrieving image:", err);
    res.status(500).json({ error: "Error retrieving image.", details: err.message });
  }
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  if (err.name === "ValidationError") {
    return res.status(400).json({ error: "Validation Error", details: err.message });
  }
  res.status(500).json({ error: "Something went wrong!", details: err.message });
});

// Graceful shutdown handling (to properly close DB connection)
process.on("SIGINT", () => {
  console.log("Gracefully shutting down...");
  conn.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});

// Start the server
const PORT = process.env.PORT || 27017;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
