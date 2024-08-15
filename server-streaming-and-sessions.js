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
    // by default the sessions are stored in memory i.e RAM, you would swap this out to use a database like Redis. Note that this middleware will automatically query the database for matching sessions and append the data to the request object.
    secret: "secret",
    // resave is used to force the session to be saved back to the session store, even if the session was not modified during the request.
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 300000, secure: false },
    name: "sessionId",
  })
);

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.post("/login", (req, res) => {
  // pull out the submitted info
  const { username, password } = req.body;
  // set them on the session object
  req.session.username = username;
  req.session.password = password;
  // special permissions for the admin. note that logging in a second time will overwrite the current session data. i.e. logging in with an other user other than 'admin' will set req.session.authorized to false.
  if (username === "admin" && password === "password") {
    req.session.authorized = true;
    return res.redirect("/multipart-form");
  } else {
    req.session.authorized = false;
    return res.redirect("/multipart-form");
  }
});

app.get("/multipart-form", (req, res) => {
  // this allows all users at this point. could restrict it by doing if (!req.session.authorized) { return res.status(301).redirect("/login"); } but I wanted to test authorization on upload.
  console.log(req.session);
  if (!req.session) {
    return res.status(301).redirect("/login");
  } else {
    return res.sendFile(path.join(__dirname, "public", "multipart-form.html"));
  }
});

app.post("/multipart-form", async (req, res) => {
  console.log(req.session);
  // only authenticated users can upload photos
  if (!req.session.authorized) {
    return res.send("Only admins can upload photos");
  }

  let bb = busboy({ headers: req.headers });

  bb.on("file", (name, file, info) => {
    const { filename, encoding, mimeType } = info;

    // check that the file is an image (technically this is trusting the filetype set by the browser but someone could just improperly label a file)
    const supportedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!supportedMimeTypes.includes(mimeType)) {
      return res.status(400).send("Unsupported file type");
    }
    // create writable stream to save the file
    const writeableStream = fs.createWriteStream(
      path.join(__dirname, "public/uploads/", filename)
    );
    // create intermediate process (transformer) to resize the image on the way
    const transformer = sharp()
      .png()
      .resize(200)
      .on("info", ({ height }) => console.log(`Image height is ${height}`));

    // pipe the file through the transformer and then to the writable stream
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

  // earlier we only set up the event listeners for the busboy instance, now we have to pipe the request into it.
  req.pipe(bb);
});

app.listen(3500, () => {
  console.log("Server is running on port 3500");
});
