export interface SpotifyAuthorization {
  access_token: string;
  expires_in: string;
  refresh_token: string;
}

export interface ReallySimplifiedArtist {
  id: string;
  name: string;
  image: string;
  genres: string[];
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

export interface SocketUser {
  id: string;
  spotify: {
    name: string;
    id: string;
    tracks: ReallySimplifiedTrack[];
    artists: ReallySimplifiedArtist[];
    genres: { genre: string; score: number }[];
  };
}

export interface UserAnalysis {
  user: SocketUser;
  usersWithScores: UserWithScore[];
}

export interface UserWithScore {
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
}
