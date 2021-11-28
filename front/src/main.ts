import { SpotifyData } from './ts/Spotify/SpotifyData';
import { SpotifyLogin } from './ts/Spotify/SpotifyLogin';
import './style.scss';
import { UsersSocket } from './ts/Socket/UsersSocket';
import { MainScene } from './ts/Three/MainScene';

const PROD = import.meta.env.PROD;
const BACK_URL = PROD
  ? import.meta.env.VITE_BACK_URL
    ? (import.meta.env.VITE_BACK_URL as string)
    : 'http://localhost:8081'
  : 'http://localhost:8081';

/** Spotify */
let accessToken: string | null = null;
const spotifyLogin = new SpotifyLogin(BACK_URL);
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
      usersSocket = new UsersSocket(BACK_URL, mainScene);
      const spotifyData = new SpotifyData(accessToken);

      const userData = await spotifyData.getData();
      usersSocket.setSpotify(userData);

      document.querySelector('.start-btn-container')?.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
    // window.location.reload();
  }
}
