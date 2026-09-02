package com.stream.movie.client;

import com.stream.movie.dto.tmdb.TmdbMovieDetails;
import com.stream.movie.dto.tmdb.TmdbPagedResponse;
import com.stream.movie.dto.tmdb.TmdbSeasonDetails;

public interface TmdbOperations {

    TmdbPagedResponse getTrendingMovies();

    TmdbPagedResponse getPopularMovies();

    TmdbPagedResponse searchMovies(String query);

    TmdbPagedResponse getTopRatedMovies();

    TmdbPagedResponse getNowPlayingMovies();

    TmdbPagedResponse discoverByGenre(int genreId);

    TmdbPagedResponse getRecommendations(long tmdbId);

    TmdbMovieDetails getMovie(long tmdbId);

    // TV
    TmdbMovieDetails getTv(long tmdbId);

    TmdbSeasonDetails getTvSeason(long tmdbId, int seasonNumber);
}
