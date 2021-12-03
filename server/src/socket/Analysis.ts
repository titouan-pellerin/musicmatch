import { Socket } from "socket.io";
import {
  UserAnalysis,
  SocketUser,
  UserWithScore,
  ReallySimplifiedTrack,
  ReallySimplifiedArtist,
} from "../../typings";

export function analyze(users: Map<Socket, SocketUser>, roomId: string) {
  const analyzedUsers: UserAnalysis[] = [];
  console.time("first loop");

  users.forEach((user, key) => {
    if (user.roomId === roomId) {
      console.log(user.spotify.name, roomId);

      let usersWithScores: UserWithScore[] = [];

      const userTracks = user.spotify.tracks;
      const userArtists = user.spotify.artists;
      const userGenres: { genre: string; score: number }[] = [];

      const usersToCompare = new Map(users);
      usersToCompare.delete(key);

      console.time("second loop");
      usersToCompare.forEach((userToCompare) => {
        if (userToCompare.roomId === roomId) {
          console.time("inner loop");
          const userTracksToCompare = userToCompare.spotify.tracks;
          const userArtistsToCompare = userToCompare.spotify.artists;
          const userGenresToCompare: { genre: string; score: number }[] = [];

          console.time("artists");
          const artistsScore = compareArtists(
            userArtists,
            userArtistsToCompare,
            userGenres,
            userGenresToCompare
          );
          console.timeEnd("artists");

          console.time("tracks");
          const tracksScore = compareTracks(userTracks, userTracksToCompare);
          console.timeEnd("tracks");

          console.time("genres");
          userGenresToCompare.sort((a, b) => b.score - a.score).splice(10);
          userGenres.sort((a, b) => b.score - a.score).splice(10);

          const genresScore = compareGenres(userGenres, userGenresToCompare);
          console.timeEnd("genres");

          usersWithScores.push({
            user: {
              id: userToCompare.id,
              spotify: {
                name: userToCompare.spotify.name,
                id: userToCompare.spotify.id,
              },
            },
            scores: { artistsScore, tracksScore, genresScore },
          });
          console.timeEnd("inner loop");
        }
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
        user,
        usersWithScores,
      });
      console.timeEnd("second loop");
    }
  });
  console.timeEnd("first loop");

  return analyzedUsers;
}

function compareArtists(
  artists: ReallySimplifiedArtist[],
  artistsToCompare: ReallySimplifiedArtist[],
  userGenres: { genre: string; score: number }[],
  userGenresToCompare: { genre: string; score: number }[]
) {
  let score = 0;
  let matchingArtists: ReallySimplifiedArtist[] = [];
  const bestScore = 50;
  const scoreIncrement =
    bestScore / Math.max(artists.length, artistsToCompare.length);
  artists.forEach((artist, index) => {
    addUserGenre(artist, userGenres);
    if (artistsToCompare[index])
      addUserGenre(artistsToCompare[index], userGenresToCompare);
    const artistsMatch = artistsToCompare.filter(
      (artistToCompare) => artistToCompare.id === artist.id
    );
    if (artistsMatch.length === 1) {
      score += scoreIncrement;
      matchingArtists.push(artist);
    }
  });
  return { score, matchingArtists };
}

function compareTracks(
  tracks: ReallySimplifiedTrack[],
  tracksToCompare: ReallySimplifiedTrack[]
) {
  let score = 0;
  let matchingTracks: ReallySimplifiedTrack[] = [];
  const bestScore = 100;
  const scoreIncrement =
    bestScore / Math.max(tracks.length, tracksToCompare.length);
  tracks.forEach((track) => {
    const tracksMatch = tracksToCompare.filter(
      (trackToCompare) => trackToCompare.id === track.id
    );
    if (tracksMatch.length === 1) {
      score += scoreIncrement;
      matchingTracks.push(track);
    }
  });
  return { score, matchingTracks };
}

function compareGenres(
  genres: { genre: string; score: number }[],
  genresToCompare: { genre: string; score: number }[]
) {
  let score = 0;
  let matchingGenres: string[] = [];
  genres.forEach((genre, index) => {
    genresToCompare.forEach((genreToCompare, indexToCompare) => {
      if (genre.genre === genreToCompare.genre) {
        score += Math.min(
          0.5 * (genres.length - index),
          0.5 * (genresToCompare.length - indexToCompare)
        );
        matchingGenres.push(genre.genre);
      }
    });
  });
  return { score, matchingGenres };
}

function addUserGenre(
  userArtist: ReallySimplifiedArtist,
  userGenres: { genre: string; score: number }[]
) {
  const genres = userArtist.genres;
  if (genres)
    genres.forEach((genre: string) => {
      let filteredGenres = userGenres.filter(
        (userGenre) => userGenre.genre === genre
      );
      if (filteredGenres.length === 0) userGenres.push({ genre, score: 1 });
      else filteredGenres[0].score++;
    });
}
