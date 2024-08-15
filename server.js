const express = require("express");
const app = express();
const multer = require("multer");
const upload = multer({ dest: "public/uploads/" });

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/urlencoded-form", (req, res) => {
  console.log(req.query);
  res.redirect("/");
});

app.post("/urlencoded-form", (req, res) => {
  console.log(req.headers.origin);
  console.log(req.body);
  res.send(
    `<html><h1>Thanks for signing up ${req.body.name}!</h1>
    <a href="/">Head back to the form page -></a></html>`
  );
});

app.post("/multipart-form", upload.single("photo"), (req, res) => {
  console.log(req.body);
  console.log(req.file);
  res.send("Thanks for your photo!");
});

app.listen(3500, () => {
  console.log("Server is running on port 3500");
});
