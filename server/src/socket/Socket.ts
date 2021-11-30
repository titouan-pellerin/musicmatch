import {
  ReallySimplifiedTrack,
  ReallySimplifiedArtist,
  SocketUser,
  UserAnalysis,
} from "../../typings";
import { Socket, Server } from "socket.io";
import { analyze } from "./Analysis";

const usersSockets: Map<Socket, SocketUser> = new Map();

let analyzedData: UserAnalysis[];

class Connection {
  socket: Socket;
  io: Server;
  socketUser: SocketUser;

  constructor(io: Server, socket: Socket) {
    this.socket = socket;
    this.io = io;
    this.socketUser = {
      id: socket.id,
      roomId: "",
      spotify: {
        name: "unkown",
        id: "unkown",
        tracks: [],
        artists: [],
        genres: [],
      },
    };
    usersSockets.set(socket, this.socketUser);

    // On connection, send a user-connection event containing user info
    this.sendNewUser(this.socketUser.id, this.socketUser.spotify.name);

    socket.on("room", (roomId) => {
      this.socketUser.roomId = roomId;
      this.socket.join(roomId);
    });

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
    const currentRoomUsers = this.io
      .of("/")
      .adapter.rooms.get(this.socketUser.roomId) as Set<string>;
    const users: { id: string; spotify: { name: string } }[] = [];

    usersSockets.forEach((user) => {
      if (user.spotify.name !== "unkown" && currentRoomUsers.has(user.id))
        users.push({ id: user.id, spotify: { name: user.spotify.name } });
    });

    this.io.sockets.in(this.socketUser.roomId).emit("users", users);
  }

  // Used on new client connection
  sendNewUser(id: string, name: string) {
    this.io.sockets
      .in(this.socketUser.roomId)
      .emit("userConnection", { id, name });
  }

  // Used on new client disconnection
  sendFormerUser() {
    this.io.sockets
      .in(this.socketUser.roomId)
      .emit("userDisconnection", this.socketUser);
  }

  setSpotify(spotify: {
    name: string;
    id: string;
    tracks: ReallySimplifiedTrack[];
    artists: ReallySimplifiedArtist[];
  }) {
    const user = usersSockets.get(this.socket);
    const newUser = {
      ...user,
      spotify: {
        name: spotify.name,
        id: spotify.id,
        tracks: spotify.tracks,
        artists: spotify.artists,
      },
    } as SocketUser;
    usersSockets.set(this.socket, newUser);

    this.io.sockets.in(this.socketUser.roomId).emit("spotifyUpdate", {
      id: newUser.id,
      spotify: { name: newUser.spotify.name },
    });
  }

  startAnalysis() {
    console.time("analysis");
    this.io.sockets.in(this.socketUser.roomId).emit("loadingAnalysis");
    analyzedData = analyze(usersSockets, this.socketUser.roomId);
    this.io.sockets.in(this.socketUser.roomId).emit("analysisDone");
    console.timeEnd("analysis");
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

function socket(io: Server) {
  io.on("connection", (socket) => {
    new Connection(io, socket);
  });
}

function getAnalyzedData() {
  return analyzedData;
}

export { socket, getAnalyzedData };
