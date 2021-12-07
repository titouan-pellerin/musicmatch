export class PlayOnSpotify {
  linkEl: HTMLAnchorElement;
  constructor(id: string, isArtist: boolean) {
    this.linkEl = document.createElement('a');
    this.linkEl.href = `https://open.spotify.com/${isArtist ? 'artist' : 'track'}/${id}`;
    this.linkEl.target = '_blank';
    this.linkEl.classList.add('play-on-spotify');
    const spanEl = document.createElement('span');
    spanEl.textContent = 'Play on Spotify';
    this.linkEl.appendChild(spanEl);
    this.linkEl.insertAdjacentHTML(
      'afterbegin',
      `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 167.49 167.49"><defs><style>.cls-1{fill:#191414;}</style></defs><path class="cls-1" d="M85,1.28A83.75,83.75,0,1,0,168.77,85,83.75,83.75,0,0,0,85,1.28Zm38.4,120.79a5.22,5.22,0,0,1-7.18,1.74c-19.66-12-44.41-14.74-73.56-8.08a5.22,5.22,0,1,1-2.33-10.17c31.9-7.3,59.27-4.16,81.34,9.33A5.22,5.22,0,0,1,123.43,122.07Zm10.25-22.8a6.54,6.54,0,0,1-9,2.15c-22.51-13.84-56.82-17.84-83.45-9.76a6.53,6.53,0,1,1-3.79-12.5c30.41-9.22,68.22-4.75,94.07,11.13A6.54,6.54,0,0,1,133.68,99.27Zm.88-23.75c-27-16-71.52-17.5-97.29-9.68a7.83,7.83,0,1,1-4.54-15c29.58-9,78.75-7.25,109.83,11.2a7.83,7.83,0,0,1-8,13.47Z" transform="translate(-1.28 -1.28)"/></svg>`,
    );
  }
}
