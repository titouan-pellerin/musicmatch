import { PlayOnSpotify } from './PlayOnSpotify';
import { ReallySimplifiedArtist } from './../../../../typings/index';
export class ArtistsListEl {
  artistsEl: HTMLUListElement;
  constructor(artists: ReallySimplifiedArtist[]) {
    this.artistsEl = document.createElement('ul');
    this.artistsEl.classList.add('artists-list');

    if (artists.length === 0) {
      const artistEl = document.createElement('li');
      const nameEl = document.createElement('h3');
      artistEl.classList.add('text-only');

      nameEl.textContent = 'Too bad, no artist in common';
      artistEl.appendChild(nameEl);
      this.artistsEl.appendChild(artistEl);
    } else
      artists.forEach((artist) => {
        const artistEl = document.createElement('li');
        const nameEl = document.createElement('h3');
        nameEl.textContent = artist.name;
        const imgEl = document.createElement('img');
        imgEl.src = artist.image;

        const infoEl = document.createElement('div');
        infoEl.classList.add('artist-info');

        infoEl.appendChild(nameEl);
        infoEl.appendChild(new PlayOnSpotify(artist.id, true).linkEl);
        artistEl.id = artist.id;
        artistEl.appendChild(imgEl);
        artistEl.appendChild(infoEl);
        this.artistsEl.appendChild(artistEl);
      });
  }
}
