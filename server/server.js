require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const cors = require("cors");

const { socket } = require("./src/Socket");
const { getAnalyzedData } = require("./src/Socket");

console.log(getAnalyzedData());

app.use(
  cors({
    origin: "*",
  })
);

app.use("/login", require("./routes/login"));
app.use("/callback", require("./routes/callback"));
app.use("/analyzed_data", (req, res) => {
  res.status(200).json(getAnalyzedData());
});
app.use("/refresh_token", require("./routes/refresh_token"));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

socket(io);

const port = process.env.PORT || 8081;
server.listen(port, () => {
  console.log("listening on " + port);
});
