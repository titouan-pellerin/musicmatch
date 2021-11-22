function analyze(users) {
  const analyzedUsers = [];

  users.forEach((user, key) => {
    let usersWithScores = [];

    const userTracks = user.spotify.tracks;
    const userArtists = user.spotify.artists;
    const userGenres = [];

    const usersToCompare = new Map(users);
    usersToCompare.delete(key);

    usersToCompare.forEach((userToCompare, keyToCompare) => {
      const userTracksToCompare = userToCompare.spotify.tracks;
      const userArtistsToCompare = userToCompare.spotify.artists;
      const userGenresToCompare = [];

      const artistsScore = compareArtists(
        userArtists,
        userArtistsToCompare,
        userGenres,
        userGenresToCompare
      );

      const tracksScore = compareTracks(userTracks, userTracksToCompare);

      userGenresToCompare.sort((a, b) => b.score - a.score).splice(10);
      userGenres.sort((a, b) => b.score - a.score).splice(10);

      const genresScore = compareGenres(userGenres, userGenresToCompare);

      usersWithScores.push({
        user: userToCompare,
        scores: { artistsScore, tracksScore, genresScore },
      });
    });

    usersWithScores.sort(
      (a, b) =>
        b.scores.artistsScore.score +
        b.scores.tracksScore.score +
        b.scores.genresScore.score -
        (a.scores.artistsScore.score +
          a.scores.tracksScore.score +
          a.scores.genresScore.score)
    );
    user.spotify.genres = userGenres;
    analyzedUsers.push({
      user: { ...user },
      usersWithScores,
    });
  });
  //   const returnArray = Array.from(analyzedUsers);
  console.log(analyzedUsers.length);
  return analyzedUsers;
}

function compareArtists(
  artists,
  artistsToCompare,
  userGenres,
  userGenresToCompare
) {
  let score = 0;
  let matchingArtists = [];
  artists.forEach((artist) => {
    addUserGenre(artist, userGenres);
    artistsToCompare.forEach((artistToCompare) => {
      addUserGenre(artistToCompare, userGenresToCompare);
      if (JSON.stringify(artist) === JSON.stringify(artistToCompare)) {
        score++;
        matchingArtists.push(artist);
      }
    });
  });
  return { score, matchingArtists };
}

function compareTracks(tracks, tracksToCompare) {
  let score = 0;
  let matchingTracks = [];
  tracks.forEach((track) => {
    tracksToCompare.forEach((trackToCompare) => {
      if (JSON.stringify(track) === JSON.stringify(trackToCompare)) {
        score++;
        matchingTracks.push(track);
      }
    });
  });
  return { score, matchingTracks };
}

function compareGenres(genres, genresToCompare) {
  let score = 0;
  let matchingGenres = [];
  genres.forEach((genre, index) => {
    genresToCompare.forEach((genreToCompare, indexToCompare) => {
      if (genre.genre === genreToCompare.genre) {
        score += Math.min(
          0.1 * (genres.length - index),
          0.1 * (genresToCompare.length - indexToCompare)
        );
        matchingGenres.push(genre.genre);
      }
    });
  });
  return { score, matchingGenres };
}

function addUserGenre(userArtist, userGenres) {
  const genres = userArtist.genres;
  if (genres)
    genres.forEach((genre) => {
      let filteredGenres = userGenres.filter(
        (userGenre) => userGenre.genre === genre
      );
      if (filteredGenres.length === 0) userGenres.push({ genre, score: 1 });
      else filteredGenres[0].score++;
    });
}

module.exports = analyze;
