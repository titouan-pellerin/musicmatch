import express from "express";
const router = express.Router();

import { client_id, redirect_uri } from "../config/credentials";

router.route("/").get((_req, res) => {
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
export default router;

const randomString = (length: number) => {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};
