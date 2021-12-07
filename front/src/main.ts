import cursor from './ts/utils/Cursor';
import { Room } from './ts/Socket/Room';
import { SpotifyData } from './ts/Spotify/SpotifyData';
import { SpotifyLogin } from './ts/Spotify/SpotifyLogin';
import './styles/style.scss';
import { UsersSocket } from './ts/Socket/UsersSocket';
import { MainScene } from './ts/Three/MainScene';
const PROD = import.meta.env.PROD;
const BACK_URL = PROD
  ? import.meta.env.VITE_BACK_URL
    ? (import.meta.env.VITE_BACK_URL as string)
    : 'http://localhost:8081'
  : 'http://localhost:8081';

/** Rooms */
let room: Room | null = null;
let roomIdFromUrl: string | null = null;
let createRoomBtn: HTMLLinkElement | null = null;
let joinRoomBtn: HTMLButtonElement | null = null;
let roomInput: HTMLInputElement | null = null;
let copyLink: HTMLLinkElement | null = null;
/** Spotify */
let accessToken: string | null = null;
const spotifyLogin = new SpotifyLogin(BACK_URL);
let spotifyBtn: HTMLButtonElement | null = null;

/** Socket */
let usersSocket: UsersSocket | null = null;

/** THREE */
let canvas: HTMLCanvasElement | null = null;
let mainScene: MainScene | null = null;

/** Cursor */
let cursorEl: HTMLElement | null = null;

document.addEventListener('DOMContentLoaded', init);
window.scroll({
  top: 0,
  left: 0,
  behavior: 'smooth',
});
function init() {
  canvas = document.querySelector('.webgl');

  if (canvas) {
    mainScene = new MainScene(canvas);
  }

  spotifyBtn = document.querySelector('.spotify-btn');
  if (spotifyBtn) spotifyBtn.addEventListener('click', loginSpotify);
}

async function loginSpotify(e: Event) {
  e.preventDefault();
  try {
    accessToken = await spotifyLogin.login();
    document.querySelector('.start-screen')?.classList.add('hidden');

    if (mainScene) {
      if (window.location.search && window.location.search.split('=')[1]) {
        roomIdFromUrl = window.location.search.split('=')[1];
        room = new Room(roomIdFromUrl);
        joinRoom();
      } else {
        document.querySelector('.room-selection')?.classList.remove('hidden');

        createRoomBtn = document.querySelector('.create-room-btn');
        joinRoomBtn = document.querySelector('.join-room-btn');
        roomInput = document.querySelector('.room-input');
        if (createRoomBtn && joinRoomBtn && roomInput) {
          createRoomBtn.addEventListener('click', createRoom);
          joinRoomBtn.addEventListener('click', joinRoom);
          roomInput.addEventListener('keyup', (e) => {
            if (e.key === 'Enter') {
              joinRoom();
            }
          });
        }
      }
    }
  } catch (err) {
    console.error(err);
    document.querySelector('.login-error')?.classList.remove('hidden');
    // window.location.reload();
  }
}

function createRoom(e: Event) {
  e.preventDefault();
  room = new Room();
  joinRoom();
}

async function joinRoom(e: Event | null = null) {
  if (e) e.preventDefault();

  if (!room && roomInput && roomInput.value && roomInput.value.trim().length > 0)
    room = new Room(roomInput.value);
  if (room && mainScene && accessToken) {
    document.querySelector('.room-selection')?.classList.add('hidden');
    cursorEl = document.querySelector('.cursor');
    if (cursorEl) {
      if (
        !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent,
        )
      )
        cursor.init();
    }
    usersSocket = new UsersSocket(BACK_URL, room.id, mainScene);
    const spotifyData = new SpotifyData(accessToken);

    const userData = await spotifyData.getData();
    usersSocket.setSpotify(userData);
    window.history.pushState({ path: room.roomUrl }, '', room.roomUrl);
    document.querySelector('.waiting-container')?.classList.remove('hidden');

    copyLink = document.querySelector('.copy-link');
    if (copyLink) copyLink.addEventListener('click', copyLinkEvent);
  }
}

function copyLinkEvent(e: Event) {
  e.preventDefault();
  if (room) {
    navigator.clipboard.writeText(room.roomUrl);
    copyLink?.classList.add('clicked');
    setTimeout(() => {
      copyLink?.classList.remove('clicked');
    }, 100);
  }
}
