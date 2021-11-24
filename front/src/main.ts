import { UserMesh } from './ts/Three/UserMesh';
import { SpotifyData } from './ts/Spotify/SpotifyData';
import { SpotifyLogin } from './ts/Spotify/SpotifyLogin';
import './style.scss';
import { UsersSocket } from './ts/Socket/UsersSocket';
import { MainScene } from './ts/Three/MainScene';
import { Raf } from './ts/utils/Raf';

/** Spotify */
let accessToken: string | null = null;
const spotifyLogin = new SpotifyLogin('http://localhost:8081');
let spotifyBtn: HTMLButtonElement | null = null;
// let spotifyData: SpotifyData | null = null;

/** Socket */
let usersSocket: UsersSocket | null = null;

/** Experience */
let startBtn: HTMLButtonElement | null = null;

/** THREE */
let canvas: HTMLCanvasElement | null = null;
let mainScene: MainScene | null = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
  canvas = document.querySelector('.webgl');
  if (canvas) {
    mainScene = new MainScene(canvas);
  }
  spotifyBtn = document.querySelector('.spotify-btn');
  if (spotifyBtn) spotifyBtn.addEventListener('click', loginSpotify);
}

async function loginSpotify() {
  try {
    accessToken = await spotifyLogin.login();
    document.querySelector('.start-screen')?.classList.add('hidden');

    if (mainScene) {
      usersSocket = new UsersSocket('http://localhost:8081', mainScene);
      const spotifyData = new SpotifyData(accessToken);

      const userData = await spotifyData.getData();
      usersSocket.setSpotify(userData);

      if (userData.id === '21mt764g6tshzefezye2zx4oq') {
        startBtn = document.querySelector('.start-btn');
        document.querySelector('.start-btn-container')?.classList.remove('hidden');
        startBtn?.addEventListener('click', startAnalysis);
      }
    }
  } catch (err) {
    console.error(err);
    // window.location.reload();
  }
}

function startAnalysis() {
  usersSocket?.startAnalysis();
}
