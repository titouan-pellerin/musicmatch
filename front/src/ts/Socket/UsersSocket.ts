import { SimpleUser, UserAnalysis } from './../../../typings/index';
import { io, Socket } from 'socket.io-client';

export class UsersSocket {
  socket: Socket;
  usersDiv: HTMLDivElement | null = null;
  users: SimpleUser[] = [];

  constructor(serverUrl: string) {
    this.usersDiv = document.querySelector('.users');
    this.socket = io(serverUrl);
    // client-side
    this.socket.on('connect', () => {
      console.log(this.socket.id); // x8WIv7-mJelg7on_ALbx
    });

    this.socket.on('disconnect', () => {
      console.log(this.socket.id); // undefined
    });

    this.socket.emit('getUsers');

    this.socket.on('users', this.getUsers.bind(this));

    this.socket.on('spotifyUpdate', this.addUser.bind(this));

    this.socket.on('analysisDone', this.analysisDone.bind(this));

    this.socket.on('userDisconnection', this.removeUser.bind(this));
  }

  setSpotify(spotifyData: {
    name: string;
    id: string;
    artists: SpotifyApi.ArtistObjectFull[];
    tracks: SpotifyApi.TrackObjectFull[];
  }) {
    this.socket.emit('setSpotify', spotifyData);
  }

  getUsers(users: SimpleUser[]) {
    if (this.usersDiv) this.usersDiv.textContent = '';
    users.forEach((user) => {
      const userSpan = document.createElement('span');
      userSpan.id = user.id;
      userSpan.textContent = user.spotify.name;
      this.usersDiv?.appendChild(userSpan);
    });
  }

  addUser(user: SimpleUser) {
    this.users.push(user);
    const userSpan = document.createElement('span');
    userSpan.id = user.id;
    userSpan.textContent = user.spotify.name;
    this.usersDiv?.appendChild(userSpan);
  }

  removeUser(user: SimpleUser) {
    this.users.splice(this.users.indexOf(user), 1);
    document.getElementById(user.id)?.remove();
  }

  startAnalysis() {
    this.socket.emit('startAnalysis');
  }

  async analysisDone(usersAnalysis: UserAnalysis[]) {
    // const analyzedData = await fetch('http://localhost:8081/analyzed_data');
    // console.log(analyzedData);
    console.log(usersAnalysis);
    usersAnalysis.forEach((userAnalysis) => {
      userAnalysis.usersWithScores.forEach((userWithScores) => {
        console.log(
          userAnalysis.user.spotify.name +
            ' matches at ' +
            (userWithScores.scores.artistsScore.score +
              userWithScores.scores.tracksScore.score +
              userWithScores.scores.genresScore.score) +
            ' with ' +
            userWithScores.user.spotify.name,
        );
      });
    });
  }
}
