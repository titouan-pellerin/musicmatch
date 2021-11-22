const express = require("express");
const router = express.Router();

const { client_id, redirect_uri } = require("../config/credentials");

router.route("/").get((req, res) => {
  const state = randomString(16);
  const scope = "user-top-read user-read-private user-read-email";

  const authQueryParameters = new URLSearchParams({
    response_type: "code",
    client_id,
    scope,
    redirect_uri,
    state,
  });
  res.redirect(
    "https://accounts.spotify.com/authorize?" + authQueryParameters.toString()
  );
});
module.exports = router;

const randomString = (length) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
