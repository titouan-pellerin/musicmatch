const analyse = require("./Analysis");

const usersSockets = new Map();

let analyzedData;

class Connection {
  constructor(io, socket) {
    this.socket = socket;
    this.io = io;
    this.id = socket.id;
    this.spotify = { name: "unkown", id: "unkown", tracks: [], artists: [] };

    usersSockets.set(socket, { id: this.id, spotify: this.spotify });

    // On connection, send a user-connection event containing user info
    this.sendNewUser(this.id, this.name);

    socket.on("getUsers", () => this.sendUsers());
    socket.on("setSpotify", (name) => this.setSpotify(name));

    socket.on("startAnalysis", () => this.startAnalysis());

    // socket.on("getMessages", () => this.getMessages());
    // socket.on("message", (value) => this.handleMessage(value));

    socket.on("disconnect", () => this.disconnect());
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
  }

  sendUsers() {
    const users = [];
    usersSockets.forEach((user) => {
      if (user.spotify.name !== "unkown")
        users.push({ id: user.id, spotify: { name: user.spotify.name } });
    });
    this.socket.emit("users", users);
  }

  // Used on new client connection
  sendNewUser(id, name) {
    this.io.sockets.emit("userConnection", { id, name });
  }

  // Used on new client disconnection
  sendFormerUser() {
    this.io.sockets.emit("userDisconnection", {
      id: this.id,
      spotify: this.spotify,
    });
  }

  setSpotify(spotify) {
    const user = usersSockets.get(this.socket);
    const newUser = {
      ...user,
      spotify: {
        name: spotify.name,
        id: spotify.id,
        tracks: spotify.tracks,
        artists: spotify.artists,
      },
    };
    usersSockets.set(this.socket, newUser);

    this.io.sockets.emit("spotifyUpdate", {
      id: newUser.id,
      spotify: { name: newUser.spotify.name },
    });
  }

  startAnalysis() {
    console.time("start");
    analyzedData = analyse(usersSockets);
    this.io.sockets.emit("analysisDone", analyzedData);
    console.timeEnd("start");
  }

  //   getMessages() {
  //     const msgs = [];
  //     messages.forEach((message) => msgs.push(message));
  //     this.socket.emit("messages", msgs);
  //   }

  disconnect() {
    usersSockets.delete(this.socket);
    this.sendFormerUser();
  }
}

function socket(io) {
  io.on("connection", (socket) => {
    new Connection(io, socket);
  });
}

module.exports = { socket, analyzedData };
