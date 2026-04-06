export interface TvShow {
  '@assetType'?: string;
  title: string;
  description?: string;
  recommendedAge?: number;
}

export interface Episode {
  episodeNumber: number;
  title: string;
  description?: string;
  releaseDate?: string;
  season?: { number: number; tvShow?: { title: string } };
}

export interface Season {
  number: number;
  year?: string;
  tvShow?: { title: string };
  episodes?: Episode[];
}

export interface Watchlist {
  title: string;
  description?: string;
  tvShows?: TvShow[];
}