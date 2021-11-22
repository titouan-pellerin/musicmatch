export interface SimpleUser {
  id: string;
  spotify: { name: string };
}

export interface FullUser {
  id: string;
  spotify: {
    name: string;
    tracks: SpotifyApi.TrackObjectFull[];
    artists: SpotifyApi.ArtistObjectFull[];
  };
}

export interface UserAnalysis {
  user: {
    id: string;
    spotify: {
      name: string;
      tracks: SpotifyApi.TrackObjectFull[];
      artists: SpotifyApi.ArtistObjectFull[];
      genres: [
        {
          genre: string;
          score: number;
        },
      ];
    };
  };
  usersWithScores: [
    {
      scores: {
        artistsScore: {
          score: number;
          matchingArtists: SpotifyApi.ArtistObjectFull[];
        };
        tracksScore: {
          score: number;
          matchingTracks: SpotifyApi.TrackObjectFull[];
        };
        genresScore: {
          score: number;
          matchingGenres: string[];
        };
      };
      user: {
        id: string;
        spotify: {
          name: string;
          tracks: SpotifyApi.TrackObjectFull[];
          artists: SpotifyApi.ArtistObjectFull[];
          genres: [
            {
              genre: string;
              score: number;
            },
          ];
        };
      };
    },
  ];
}
