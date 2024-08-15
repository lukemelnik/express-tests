const express = require("express");
const app = express();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.get("/urlencoded-form", (req, res) => {
  console.log(req.query);
  res.end();
});

app.post("/urlencoded-form", (req, res) => {
  console.log(req.headers);
  console.log(req.body);
  res.end();
});

app.listen(3500, () => {
  console.log("Server is running on port 3500");
});
