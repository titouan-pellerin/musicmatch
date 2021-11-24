import { UserMesh } from './../Three/UserMesh';
import { SimpleUser, UserAnalysis } from './../../../typings/index';
import { io, Socket } from 'socket.io-client';
import { MainScene } from '../Three/MainScene';
import { Group, Mesh, Vector3 } from 'three';
import gsap from 'gsap';

export class UsersSocket {
  socket: Socket;
  usersDiv: HTMLDivElement | null = null;
  users: SimpleUser[] = [];
  scene: MainScene;
  currentUser: string | null = null;

  constructor(serverUrl: string, scene: MainScene) {
    this.scene = scene;
    this.usersDiv = document.querySelector('.users');
    this.socket = io(serverUrl);
    // client-side
    this.socket.on('connect', () => {
      console.log(this.socket.id);
      this.currentUser = this.socket.id;
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
      console.log(user.spotify.name);

      this.createUserMesh(user);
    });
  }

  async addUser(user: SimpleUser) {
    console.log(user.spotify.name);

    this.users.push(user);
    this.createUserMesh(user);
  }

  removeUser(user: SimpleUser) {
    this.users.splice(this.users.indexOf(user), 1);
    UserMesh.remove(user.id, this.scene);
  }

  startAnalysis() {
    this.socket.emit('startAnalysis');
  }

  async analysisDone(usersAnalysis: UserAnalysis[]) {
    if (this.currentUser) {
      const currentUserId = this.currentUser;
      console.log(usersAnalysis);
      const currentUserAnalysis = usersAnalysis.filter(
        (userAnalysis) => userAnalysis.user.id === currentUserId,
      )[0];

      const currentUserMesh = UserMesh.userMeshes.get(currentUserId) as Group;
      gsap.to(currentUserMesh.position, {
        duration: 0.75,
        x: 0,
        y: 0,
        z: 0,
        ease: 'power3.out',
      });

      const bestMatch = currentUserAnalysis.usersWithScores[0];
      const bestMatchMesh = UserMesh.userMeshes.get(bestMatch.user.id);
      const worstMatch =
        currentUserAnalysis.usersWithScores[
          currentUserAnalysis.usersWithScores.length - 1
        ];
      const worstMatchMesh = UserMesh.userMeshes.get(worstMatch.user.id);
      if (bestMatchMesh && worstMatchMesh) {
        gsap.to(bestMatchMesh.position, {
          duration: 0.75,
          x: -3,
          y: 0,
          z: 0,
          ease: 'power3.out',
        });
        gsap.to(worstMatchMesh.position, {
          duration: 0.75,
          x: 3,
          y: 0,
          z: 0,
          ease: 'power3.out',
        });
      }

      usersAnalysis = usersAnalysis.splice(usersAnalysis.indexOf(currentUserAnalysis), 1);

      usersAnalysis.forEach((userAnalysis) => {
        if (
          userAnalysis.user.id !== bestMatch.user.id ||
          userAnalysis.user.id !== worstMatch.user.id
        ) {
          const meshToHide = UserMesh.userMeshes.get(userAnalysis.user.id);
          if (meshToHide)
            gsap.to(meshToHide.scale, {
              duration: 0.75,
              x: 0.1,
              y: 0.1,
              z: 0.1,
              ease: 'power3.out',
            });
        }

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

  createUserMesh(user: SimpleUser) {
    let currentMesh: Group;
    if (UserMesh.userMeshes.size === 0) {
      currentMesh = new UserMesh(user.id);
    } else currentMesh = UserMesh.clone(user.id);

    // currentMesh.position.set(currentPos.x, currentPos.y, currentPos.z);
    // UserMesh.lastMeshPos = currentMesh.position;
    currentMesh.scale.set(0, 0, 0);

    gsap.to(currentMesh.scale, {
      duration: 0.75,
      x: 1,
      y: 1,
      z: 1,
      ease: 'power3.out',
      // stagger: 0.3,
    });

    this.scene.add(currentMesh);
    console.log(this.scene.children);
  }
}
