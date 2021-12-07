import { UserMesh } from './../Three/UserMesh';
import {
  SimpleUser,
  UserAnalysis,
  ReallySimplifiedArtist,
  ReallySimplifiedTrack,
} from './../../../typings/index';
import { io, Socket } from 'socket.io-client';
import { MainScene } from '../Three/MainScene';
import { Mesh } from 'three';
import gsap from 'gsap';
import { ArtistsListEl } from '../Spotify/Elements/ArtistsListEl';
import { TracksListEl } from '../Spotify/Elements/TracksListEl';
import { GenresListEl } from '../Spotify/Elements/GenresListEl';
import cursor from '../utils/Cursor';

export class UsersSocket {
  socket: Socket;
  roomId: string;
  serverUrl: String;
  users: SimpleUser[] = [];
  scene: MainScene;
  startBtn: HTMLButtonElement | null = null;
  currentUser: string | null = null;
  usersAnalysis: UserAnalysis[] | null = null;
  constructor(serverUrl: string, roomId: string, scene: MainScene) {
    this.scene = scene;
    this.roomId = roomId;
    this.startBtn = document.querySelector('.start-btn');
    this.startBtn?.addEventListener('click', this.startAnalysis.bind(this));

    this.serverUrl = serverUrl;
    this.socket = io(serverUrl);

    this.socket.on('connect', () => {
      this.currentUser = this.socket.id;
    });

    this.socket.on('disconnect', () => {});

    this.socket.emit('room', roomId);
    this.socket.emit('getUsers');

    this.socket.on('users', this.getUsers.bind(this));

    this.socket.on('spotifyUpdate', this.addUser.bind(this));

    this.socket.on('loadingAnalysis', this.loadingAnalysis.bind(this));

    this.socket.on('analysisDone', this.analysisDone.bind(this));

    this.socket.on('userDisconnection', this.removeUser.bind(this));
  }

  setSpotify(spotifyData: {
    name: string;
    id: string;
    artists: ReallySimplifiedArtist[];
    tracks: ReallySimplifiedTrack[];
  }) {
    this.socket.emit('setSpotify', spotifyData);
  }

  getUsers(users: SimpleUser[]) {
    users.forEach(async (user) => {
      if (!UserMesh.userMeshes.has(user.id)) {
        this.users.push(user);
        this.createUserMesh(user);
      }
    });
  }

  async addUser(user: SimpleUser) {
    if (!UserMesh.userMeshes.has(user.id)) {
      this.users.push(user);
      this.createUserMesh(user);

      if (this.usersAnalysis) {
        if (UserMesh.userMeshesGroupPositions) this.previous();
        if (this.startBtn) {
          this.startBtn.children[0].textContent = 'Re-launch the analysis';
          this.startBtn.addEventListener('click', this.startAnalysis.bind(this));

          document.querySelector('.start-btn-container')?.classList.remove('hidden');
          document.querySelector('.hint-container')?.classList.add('hidden');
          this.usersAnalysis = null;
        }
      }
    }
  }

  removeUser(user: SimpleUser) {
    if (this.usersAnalysis) {
      if (UserMesh.userMeshesGroupPositions) this.previous();
      if (this.startBtn) {
        this.startBtn.children[0].textContent = 'Re-launch the analysis';
        this.startBtn.addEventListener('click', this.startAnalysis.bind(this));

        document.querySelector('.start-btn-container')?.classList.remove('hidden');
        document.querySelector('.hint-container')?.classList.add('hidden');
        this.usersAnalysis = null;
      }
    }
    this.users.splice(this.users.indexOf(user), 1);
    UserMesh.remove(user.id);
  }

  startAnalysis(e: Event) {
    e.preventDefault();
    this.socket.emit('startAnalysis');
  }

  loadingAnalysis() {
    if (this.startBtn) {
      this.startBtn.children[0].textContent = 'Loading...';
      this.startBtn.removeEventListener('click', this.startAnalysis);
    }
  }

  async analysisDone() {
    document.querySelector('.start-btn-container')?.classList.add('hidden');
    document.querySelector('.hint-container')?.classList.remove('hidden');
    this.usersAnalysis = (await fetch(this.serverUrl + '/analyzed_data').then(
      (response) => response.json(),
    )) as UserAnalysis[];
  }

  createUserMesh(user: SimpleUser) {
    if (this.users.length > 1) {
      document.querySelector('.waiting-container')?.classList.add('hidden');
      document.querySelector('.start-btn-container')?.classList.remove('hidden');
    }

    let currentMesh: UserMesh;
    if (UserMesh.userMeshes.size === 0) {
      currentMesh = new UserMesh(user.id, user.spotify.name);
    } else currentMesh = UserMesh.cloneUser(user.id, user.spotify.name);

    currentMesh.nameEl.addEventListener('click', this.showUserMatch.bind(this));
    UserMesh.userMeshes.set(user.id, currentMesh);

    currentMesh.scale.set(0, 0, 0);
    currentMesh.nameEl.classList.remove('hidden');
    gsap.to(currentMesh.scale, {
      duration: 0.95,
      x: 1,
      y: 1,
      z: 1,
      ease: 'power3.out',
    });
    gsap.to(currentMesh.rotation, {
      duration: 1.15,
      x: 0,
      y: 0,
      z: -Math.PI,
      ease: 'power4.out',
    });
    UserMesh.userMeshesGroup.add(currentMesh);
    UserMesh.userMeshesGroupPositions.push(currentMesh.position.clone());
    UserMesh.userMeshesGroupPosition = UserMesh.userMeshesGroup.position.clone();
  }

  showUserMatch(e: Event) {
    e.preventDefault();
    if (this.usersAnalysis) {
      cursor.stop();
      document
        .querySelector('.back-btn')
        ?.addEventListener('click', this.previous.bind(this));

      const id = (e.target as HTMLHeadingElement).id;
      const currentUserAnalysis = this.usersAnalysis.filter(
        (userAnalysis) => userAnalysis.user.id === id,
      )[0];

      const currentUserMesh = UserMesh.userMeshes.get(id) as Mesh;
      const bestMatch = currentUserAnalysis.usersWithScores[0];
      const score = Math.ceil(
        ((bestMatch.scores.artistsScore.score +
          bestMatch.scores.tracksScore.score +
          +bestMatch.scores.genresScore.score) /
          177.5) *
          100,
      );
      (document.querySelector('.current-user') as HTMLSpanElement).textContent =
        currentUserAnalysis.user.spotify.name;
      (document.querySelector('.current-user-match') as HTMLSpanElement).textContent =
        bestMatch.user.spotify.name;
      (document.querySelector('.score') as HTMLSpanElement).textContent =
        score.toString() + '%';

      const artistsListEl = new ArtistsListEl(
        bestMatch.scores.artistsScore.matchingArtists,
      );
      const tracksListEl = new TracksListEl(bestMatch.scores.tracksScore.matchingTracks);
      const genresListEl = new GenresListEl(bestMatch.scores.genresScore.matchingGenres);

      const artistsContainer = document.querySelector('.artists-container');
      const tracksContainer = document.querySelector('.tracks-container');
      const genresContainer = document.querySelector('.genres-container');

      if (artistsContainer?.children[1]) artistsContainer.children[1].remove();
      if (tracksContainer?.children[1]) tracksContainer.children[1].remove();
      if (genresContainer?.children[1]) genresContainer.children[1].remove();

      artistsContainer?.appendChild(artistsListEl.artistsEl);
      tracksContainer?.appendChild(tracksListEl.tracksEl);
      genresContainer?.appendChild(genresListEl.genresEl);

      document.getElementById(id)?.classList.remove('hidden');
      document.querySelector('.results')?.classList.add('show');
      document.body.classList.remove('no-overflow-y');
      this.scene.controls.enabled = false;
      const controls = this.scene.controls;
      gsap.to(this.scene.camera.position, {
        duration: 0.75,
        ease: 'power3.out',
        x: 0,
        y: 0,
        z: 3,
        onUpdate() {
          controls.target.copy(this._targets[0]);
        },
      });
      gsap.to(currentUserMesh.position, {
        duration: 0.75,
        x: -1.5,
        y: 0,
        z: 0,
        ease: 'power3.inOut',
      });
      gsap.to(currentUserMesh.rotation, {
        duration: 0.75,
        x: 0,
        y: 0,
        z: Math.PI,
        ease: 'power3.inOut',
      });
      gsap.to(currentUserMesh.scale, {
        duration: 0.75,
        x: 1,
        y: 1,
        z: 1,
        ease: 'power3.out',
      });

      gsap.to(UserMesh.userMeshesGroup.position, {
        duration: 0.75,
        x: 0,
        y: 0,
        ease: 'power3.out',
      });

      const bestMatchMesh = UserMesh.userMeshes.get(bestMatch.user.id);

      document.getElementById(bestMatch.user.id)?.classList.remove('hidden');

      if (bestMatchMesh) {
        gsap.to(bestMatchMesh.position, {
          duration: 0.75,
          x: 1.5,
          y: 0,
          z: 0,
          ease: 'power3.inOut',
        });
        gsap.to(bestMatchMesh.rotation, {
          duration: 0.75,
          x: 0,
          y: 0,
          z: -Math.PI,
          ease: 'power3.inOut',
        });
        gsap.to(bestMatchMesh.scale, {
          duration: 0.75,
          x: 1,
          y: 1,
          z: 1,
          ease: 'power3.out',
        });
      }
      const meshesToHide: UserMesh[] = [];
      this.usersAnalysis.forEach((userAnalysis) => {
        if (userAnalysis.user.id !== bestMatch.user.id && userAnalysis.user.id !== id) {
          document.getElementById(userAnalysis.user.id)?.classList.add('hidden');
          meshesToHide.push(UserMesh.userMeshes.get(userAnalysis.user.id) as UserMesh);
        }
      });
      if (meshesToHide.length > 0) {
        const meshesToHidePositions = meshesToHide.map(
          (meshToHide) => meshToHide.position,
        );
        const meshesToHideScales = meshesToHide.map((meshToHide) => meshToHide.scale);
        const meshesToHideRotation = meshesToHide.map(
          (meshToHide) => meshToHide.rotation,
        );
        gsap.to(meshesToHidePositions, {
          duration: 0.55,
          x: 0,
          y: 0,
          z: 3,
          // stagger: 0.03,
          ease: 'power3.in',
        });
        gsap.to(meshesToHideRotation, {
          duration: 0.55,
          x: 0,
          y: 0,
          z: Math.PI * 0.5,
          // stagger: 0.1,
          ease: 'power3.in',
        });
        gsap.to(meshesToHideScales, {
          duration: 0.55,
          x: 0,
          y: 0,
          z: 0,
          ease: 'back.in',
        });
      }
      document.querySelector('.canvas-container')?.classList.add('reduced');
      document.querySelector('.back-btn-container')?.classList.remove('hidden');
      document.querySelector('.hint-container')?.classList.add('hidden');
    }
  }
  previous(e: Event | null = null) {
    if (e) e.preventDefault();
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
    document.querySelector('.hint-container')?.classList.remove('hidden');
    document.querySelector('.canvas-container')?.classList.remove('reduced');
    document.querySelector('.back-btn-container')?.classList.add('hidden');
    document.querySelector('.results')?.classList.remove('show');
    document.body.classList.add('no-overflow-y');
    this.scene.controls.enabled = true;
    cursor.init();

    gsap.to(UserMesh.userMeshesGroup.position, {
      duration: 0.75,
      ease: 'power3.out',
      x: UserMesh.userMeshesGroupPosition.x,
      y: UserMesh.userMeshesGroupPosition.y,
    });
    (UserMesh.userMeshesGroup.children as UserMesh[]).forEach((child, i) => {
      child.nameEl?.classList.remove('hidden');
      gsap.to(child.position, {
        duration: 0.55,
        ease: 'power3.out',
        x: UserMesh.userMeshesGroupPositions[i].x,
        y: UserMesh.userMeshesGroupPositions[i].y,
        z: 0,
      });
      gsap.to(child.rotation, {
        duration: 0.55,
        ease: 'power3.out',
        x: 0,
        y: 0,
        z: 0,
      });
      gsap.to(child.scale, {
        duration: 0.55,
        ease: 'back.out',
        x: 1,
        y: 1,
        z: 1,
      });
    });
  }
}
