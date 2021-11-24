import { UserMesh } from './../Three/UserMesh';
import { SimpleUser, UserAnalysis } from './../../../typings/index';
import { io, Socket } from 'socket.io-client';
import { MainScene } from '../Three/MainScene';
import { Group, Vector3 } from 'three';
import gsap from 'gsap';

export class UsersSocket {
  socket: Socket;
  usersDiv: HTMLDivElement | null = null;
  users: SimpleUser[] = [];
  scene: MainScene;

  constructor(serverUrl: string, scene: MainScene) {
    this.scene = scene;
    this.usersDiv = document.querySelector('.users');
    this.socket = io(serverUrl);
    // client-side
    this.socket.on('connect', () => {
      console.log(this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log(this.socket.id);
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
    users.forEach(async (user) => {
      this.scene.add(this.createUserMesh(user));
    });
    gsap.to(this.scene.camera.position, {
      duration: 0.75,
      z: this.scene.camera.position.z + UserMesh.userMeshes.size + 3,
      x: this.scene.camera.position.x + (UserMesh.userMeshes.size === 0 ? 0 : 2.5),
      ease: 'power3.out',
    });
  }

  async addUser(user: SimpleUser) {
    this.users.push(user);

    this.scene.add(this.createUserMesh(user));
  }

  removeUser(user: SimpleUser) {
    this.users.splice(this.users.indexOf(user), 1);
    document.getElementById(user.id)?.remove();
    UserMesh.remove(user.id, this.scene);
  }

  startAnalysis() {
    this.socket.emit('startAnalysis');
  }

  async analysisDone(usersAnalysis: UserAnalysis[]) {
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

  createUserMesh(user: SimpleUser) {
    let currentPos: Vector3;
    if (!UserMesh.lastMeshPos) currentPos = new Vector3(0, 0, 0);
    else currentPos = new Vector3(UserMesh.lastMeshPos.x + 3, 0, 0);

    if (UserMesh.userMeshes.size === 0)
      UserMesh.userMeshes.set(
        user.id,
        new UserMesh(user.id, user.spotify.name, this.scene.camera),
      );
    else UserMesh.userMeshes.set(user.id, [...UserMesh.userMeshes.values()][0].clone());

    const currentMesh = UserMesh.userMeshes.get(user.id) as Group;
    currentMesh.position.set(currentPos.x, currentPos.y, currentPos.z);
    UserMesh.lastMeshPos = currentMesh.position;
    currentMesh.scale.set(0, 0, 0);

    gsap.to(currentMesh.scale, {
      duration: 0.75,
      x: 1,
      y: 1,
      z: 1,
      ease: 'power3.out',
      // stagger: 0.3,
    });

    return currentMesh;
  }
}
