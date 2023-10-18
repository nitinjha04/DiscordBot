const urlModel = require("../models/url");
const express = require("express");

const router = express.Router();

app.get("/favicon.ico", (req, res) => {
    // Return a 404 status code to indicate the favicon doesn't exist
    res.status(404).end();
  });

router.get("/", (req, res) => {
  res.send("hi");
});

router.get("/:shortId", async (req, res) => {
  const { shortId } = req.params;
  const entry = await urlModel.findOne({
    shortId,
  });
  res.redirect("http://" + entry.redirectURL);
});

module.exports = router;
