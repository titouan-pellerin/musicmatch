export class GenresListEl {
  genresEl: HTMLUListElement;
  constructor(genres: string[]) {
    this.genresEl = document.createElement('ul');
    this.genresEl.classList.add('genres-list');

    if (genres.length === 0) {
      const genreEl = document.createElement('li');
      const nameEl = document.createElement('h3');
      genreEl.classList.add('text-only');

      nameEl.textContent = 'Too bad, not even one genre in common';
      genreEl.appendChild(nameEl);
      this.genresEl.appendChild(genreEl);
    } else
      genres.forEach((genre) => {
        const genreEl = document.createElement('li');
        genreEl.classList.add('text-only');
        const nameEl = document.createElement('h3');
        nameEl.textContent = genre;
        nameEl.classList.add('genre');
        genreEl.appendChild(nameEl);
        // genreEl.id = genre.id;
        this.genresEl.appendChild(genreEl);
      });
  }
}
