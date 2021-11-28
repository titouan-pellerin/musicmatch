const client_id = process.env.SPOTIFY_CLIENT_ID || "";
const client_secret = process.env.SPOTIFY_CLIENT_SECRET || "";
const redirect_uri = process.env.NODE_ENV
  ? process.env.NODE_ENV === "production"
    ? process.env.REDIRECT_URI
      ? process.env.REDIRECT_URI
      : "http://localhost:8081/callback"
    : "http://localhost:8081/callback"
  : "http://localhost:8081/callback";
const front_url = process.env.NODE_ENV
  ? process.env.NODE_ENV === "production"
    ? process.env.FRONT_URL
      ? process.env.FRONT_URL
      : "http://localhost:8080"
    : "http://localhost:8080"
  : "http://localhost:8080";

export { client_id, client_secret, redirect_uri, front_url };
