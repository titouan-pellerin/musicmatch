const express = require("express");
const router = express.Router();

module.exports = (analyzedData) => {
  router.route("/").get((req, res) => {
    console.log(analyzedData);
    res.status(200).json(analyzedData);
  });
  return router;
};
