const express = require("express");
const app = express();
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const busboy = require("busboy");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.post("/multipart-form", async (req, res) => {
  // create a new busboy instance
  let bb = busboy({ headers: req.headers });

  // define the busboy event listeners
  bb.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    // create a writable stream to save the file to disk
    const writeableStream = fs.createWriteStream(
      path.join(__dirname, "public/uploads/", filename)
    );
    // create a transformer that resizes the image using sharp
    const transformer = sharp()
      .png()
      .resize(200)
      .on("info", ({ height }) => console.log(`Image height is ${height}`));

    // pipe the file stream through the transformer and then to the writable stream
    file
      .pipe(transformer)
      .pipe(writeableStream)
      .on("finish", () => {
        res.send(`Thanks for uploading ${filename}, we'll keep it safe :)`);
      })
      .on("error", (error) => {
        console.log(error);
        res.status(500).send("something went wrong on our end!");
      });
  });
  // seprarate error handling for other parts of the busboy process
  bb.on("error", (error) => {
    console.log(error);
    res.status(500).send("something went wrong on our end!");
  });
  // we defined event listeners but didn't actually pipe the request to busboy yet, do that here:
  req.pipe(bb);
});

app.listen(3500, () => {
  console.log("Server is running on port 3500");
});
