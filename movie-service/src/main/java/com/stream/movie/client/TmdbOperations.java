package com.stream.movie.client;

import com.stream.movie.dto.tmdb.TmdbMovieDetails;
import com.stream.movie.dto.tmdb.TmdbPagedResponse;
import com.stream.movie.dto.tmdb.TmdbSeasonDetails;

public interface TmdbOperations {

    // =========================
    // MOVIES
    // =========================

    TmdbPagedResponse getTrendingMovies();

    TmdbPagedResponse getPopularMovies();

    TmdbPagedResponse searchMovies(String query);

    TmdbPagedResponse searchMovies(String query, int page);

    TmdbPagedResponse getTopRatedMovies();

    TmdbPagedResponse getNowPlayingMovies();

    TmdbPagedResponse discoverByGenre(int genreId);

    TmdbPagedResponse getRecommendations(long tmdbId);

    TmdbMovieDetails getMovie(long tmdbId);

    // =========================
    // TV
    // =========================

    TmdbPagedResponse getPopularTv();

    TmdbPagedResponse searchTv(String query);

    TmdbPagedResponse searchTv(String query, int page);

    TmdbMovieDetails getTv(long tmdbId);

    TmdbSeasonDetails getTvSeason(
            long tmdbId,
            int seasonNumber
    );

    TmdbMovieDetails getTvEpisode(
            long tmdbId,
            int seasonNumber,
            int episodeNumber
    );
}
