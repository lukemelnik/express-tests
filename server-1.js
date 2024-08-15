const express = require("express");
const app = express();
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

// this buffers the whole file in memory which is not good for large files.
const storage = multer.memoryStorage();
const upload = multer({ storage });

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

// pull info from query params
app.get("/urlencoded-form", (req, res) => {
  console.log(req.query);
  res.redirect("/");
});

// pull info from urlencoded body
app.post("/urlencoded-form", (req, res) => {
  console.log(req.headers.origin);
  console.log(req.body);
  res.send(
    `<html><h1>Thanks for signing up ${req.body.name}!</h1>
    <a href="/">Head back to the form page -></a></html>`
  );
});

// pull data from multipart form, separating into file and body using multer. Then process with sharp.
app.post("/multipart-form", upload.single("photo"), async (req, res) => {
  if (!req.file) {
    res.status(400).send("You have to include a photo!");
  }
  const fileName = req.file.originalname;
  const filepath = path.join(__dirname, "public/uploads/", fileName);

  try {
    await sharp(req.file.buffer).png().toFile(filepath);
    console.log("photo saved!");
    res.send(
      `Thanks for uploading ${req.file.originalname}, we'll keep it safe :)`
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("something went wrong on our end!");
  }
});

app.listen(3500, () => {
  console.log("Server is running on port 3500");
});
