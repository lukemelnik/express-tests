const express = require("express");
const app = express();
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const busboy = require("busboy");
const session = require("express-session");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 300000, secure: false },
    name: "sessionId",
  })
);

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "password") {
    req.session.user = username;
    req.session.save((err) => {
      if (err) {
        console.log("session save error");
        return res.status(500).send("Session save error");
      } else {
        res.redirect("/multipart-form");
      }
    });
  } else {
    res.status(401).send("Invalid username or password");
  }
});

app.get("/multipart-form", (req, res) => {
  console.log(req.session);
  if (!req.session.user) {
    return res.status(301).redirect("/login");
  } else {
    return res.sendFile(path.join(__dirname, "public", "multipart-form.html"));
  }
});

app.post("/multipart-form", async (req, res) => {
  console.log(req.session);
  if (req.session.user !== "admin") {
    return res.status(301).redirect("/login");
  }

  let bb = busboy({ headers: req.headers });

  bb.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;
    const writeableStream = fs.createWriteStream(
      path.join(__dirname, "public/uploads/", filename)
    );
    const transformer = sharp()
      .png()
      .resize(200)
      .on("info", ({ height }) => console.log(`Image height is ${height}`));

    file
      .pipe(transformer)
      .pipe(writeableStream)
      .on("finish", () => {
        return res.send(
          `Thanks for uploading ${filename}, we'll keep it safe :)`
        );
      })
      .on("error", (error) => {
        console.log(error);
        return res.status(500).send("Something went wrong on our end!");
      });
  });

  bb.on("error", (error) => {
    console.log(error);
    return res.status(500).send("Something went wrong on our end!");
  });

  req.pipe(bb);
});

app.listen(3500, () => {
  console.log("Server is running on port 3500");
});
