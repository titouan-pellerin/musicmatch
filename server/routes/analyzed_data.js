const axios = require("axios");
const express = require("express");
const router = express.Router();

const { analyzedData } = require("../src/Analysis");

router.route("/").get((req, res) => {
  console.log(analyzedData);
  res.status(200).json({ analyzedData });
});

module.exports = router;
