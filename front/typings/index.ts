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

export interface ReallySimplifiedArtist {
  id: string;
  name: string;
  image: string;
}

export interface ReallySimplifiedTrack {
  id: string;
  name: string;
  album: {
    id: string;
    image: string;
    name: string;
  };
  artists: { id: string; name: string }[];
}

export interface UserAnalysis {
  user: {
    id: string;
    spotify: {
      name: string;
      tracks: ReallySimplifiedArtist[];
      artists: ReallySimplifiedArtist[];
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
          matchingArtists: ReallySimplifiedArtist[];
        };
        tracksScore: {
          score: number;
          matchingTracks: ReallySimplifiedTrack[];
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
          id: string;
        };
      };
    },
  ];
}
