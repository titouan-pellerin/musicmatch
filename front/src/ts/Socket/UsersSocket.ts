import { ForceGraph } from './../Three/ForceGraph';
import { UserMesh } from './../Three/UserMesh';
import { SimpleUser, UserAnalysis } from './../../../typings/index';
import { io, Socket } from 'socket.io-client';
import { MainScene } from '../Three/MainScene';
import { Group, Mesh, ShaderMaterial, Vector3 } from 'three';
import gsap from 'gsap';

export class UsersSocket {
  socket: Socket;
  usersDiv: HTMLDivElement | null = null;
  users: SimpleUser[] = [];
  scene: MainScene;
  currentUser: string | null = null;
  usersAnalysis: UserAnalysis[] | null = null;
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
      if (!UserMesh.userMeshes.has(user.id)) this.createUserMesh(user);
    });
  }

  async addUser(user: SimpleUser) {
    console.log(user.spotify.name);
    if (!UserMesh.userMeshes.has(user.id)) {
      this.users.push(user);
      this.createUserMesh(user);
    }
  }

  removeUser(user: SimpleUser) {
    this.users.splice(this.users.indexOf(user), 1);
    UserMesh.remove(user.id);
  }

  startAnalysis() {
    this.socket.emit('startAnalysis');
  }

  async analysisDone(usersAnalysis: UserAnalysis[]) {
    this.usersAnalysis = usersAnalysis;
    console.log(new ForceGraph(usersAnalysis).showRelations());
  }

  createUserMesh(user: SimpleUser) {
    let currentMesh: UserMesh;
    if (UserMesh.userMeshes.size === 0) {
      console.log('first');
      currentMesh = new UserMesh(user.id, user.spotify.name);
    } else currentMesh = UserMesh.cloneUser(user.id, user.spotify.name);

    UserMesh.userMeshes.set(user.id, currentMesh);

    currentMesh.scale.set(0, 0, 0);
    currentMesh.nameEl.classList.remove('hidden');
    gsap.to(currentMesh.scale, {
      duration: 0.75,
      x: 1,
      y: 1,
      z: 1,
      ease: 'power3.out',
      // stagger: 0.3,
    });
    console.log(UserMesh.userMeshes.size);
    console.log(currentMesh.position);

    UserMesh.userMeshesGroup.add(currentMesh);
  }

  showUserMatch(user: SimpleUser) {
    if (this.usersAnalysis) {
      const currentUserId = user.id;

      const currentUserAnalysis = this.usersAnalysis.filter(
        (userAnalysis) => userAnalysis.user.id === currentUserId,
      )[0];

      const currentUserMesh = UserMesh.userMeshes.get(currentUserId) as Mesh;
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
        gsap.to(bestMatchMesh.rotation, {
          duration: 0.75,
          x: Math.PI,
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
        gsap.to(worstMatchMesh.rotation, {
          duration: 0.75,
          x: Math.PI,
          y: 0,
          z: 0,
          ease: 'power3.out',
        });
      }

      this.usersAnalysis.forEach((userAnalysis) => {
        if (
          userAnalysis.user.id !== bestMatch.user.id &&
          userAnalysis.user.id !== worstMatch.user.id &&
          userAnalysis.user.id !== currentUserId
        ) {
          document.getElementById(userAnalysis.user.id)?.classList.add('hidden');
          gsap.to((UserMesh.userMeshes.get(userAnalysis.user.id) as UserMesh).scale, {
            duration: 0.75,
            x: 0,
            y: 0,
            z: 0,
            stagger: 0.3,
            ease: 'power3.out',
          });
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
        }
      });
    }
  }
}
