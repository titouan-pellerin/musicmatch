require("dotenv").config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

import callbackRouter from "./routes/callback";
import loginRouter from "./routes/login";

const app = express();
const server = http.createServer(app);

import { socket, getAnalyzedData } from "./socket/Socket";
import { front_url } from "./config/credentials";

app.use(
  cors({
    origin: front_url,
    methods: ["GET"],
  })
);

app.use("/login", loginRouter);
app.use("/callback", callbackRouter);
app.use("/analyzed_data", (_req, res) => {
  res.status(200).json(getAnalyzedData());
});

const io = new Server(server, {
  cors: {
    origin: front_url,
    methods: ["GET", "POST"],
  },
});

socket(io);

const port = process.env.PORT || 8081;
server.listen(port, () => {
  console.log("Listening on " + port);
});
