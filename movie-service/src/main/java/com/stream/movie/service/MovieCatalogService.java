package com.stream.movie.service;

import com.stream.movie.client.TmdbOperations;
import com.stream.movie.dto.MovieCatalogResponse;
import com.stream.movie.dto.MovieResponse;
import com.stream.movie.dto.SearchResponse;
import com.stream.movie.dto.VideoInfo;
import com.stream.movie.dto.tmdb.TmdbMovie;
import com.stream.movie.dto.tmdb.TmdbMovieDetails;
import com.stream.movie.dto.tmdb.TmdbPagedResponse;
import com.stream.movie.dto.tmdb.TmdbSeasonDetails;
import com.stream.movie.exception.ApiException;
import com.stream.movie.mapper.MovieMapper;
import com.stream.movie.provider.VideoProvider;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MovieCatalogService {

    private static final int RESULTS_PER_PAGE = 50;

    /*
     * TMDB gives us 20 search results per page.
     *
     * Three TMDB pages give us up to 60.
     * We then return the first 50 to STREAM.
     */
    private static final int TMDB_RESULTS_PER_PAGE = 20;

    private static final int TMDB_PAGES_PER_STREAM_PAGE =
            3;

    private final TmdbOperations tmdbClient;

    private final MovieMapper movieMapper;

    private final VideoProvider videoProvider;

    public MovieCatalogService(
            TmdbOperations tmdbClient,
            MovieMapper movieMapper,
            VideoProvider videoProvider
    ) {

        this.tmdbClient = tmdbClient;
        this.movieMapper = movieMapper;
        this.videoProvider = videoProvider;
    }

    // =========================================================
    // TRENDING
    // =========================================================

    public List<MovieResponse> getTrending() {

        return mapPage(
                tmdbClient.getTrendingMovies(),
                "movie",
                true
        );
    }

    // =========================================================
    // POPULAR MOVIES
    // =========================================================

    public List<MovieResponse> getPopular() {

        return mapPage(
                tmdbClient.getPopularMovies(),
                "movie",
                true
        );
    }

    // =========================================================
    // POPULAR TV
    // =========================================================

    public List<MovieResponse> getPopularTv() {

        return mapPage(
                tmdbClient.getPopularTv(),
                "tv",
                true
        );
    }

    // =========================================================
    // SEARCH
    // =========================================================

    /*
     * Backwards-compatible old method.
     *
     * Existing code calling:
     *
     * search("batman")
     *
     * will still work.
     */
    public List<MovieResponse> search(
            String query
    ) {

        return search(
                query,
                1,
                "movie"
        ).results();
    }

    /*
     * New search method.
     *
     * type:
     *
     * all
     * movie
     * tv
     */
    public SearchResponse search(
            String query,
            int page,
            String type
    ) {

        validateSearch(
                query,
                page,
                type
        );

        String cleanQuery =
                query.trim();

        String cleanType =
                normalizeType(type);

        if ("movie".equals(cleanType)) {

            return searchMovies(
                    cleanQuery,
                    page
            );
        }

        if ("tv".equals(cleanType)) {

            return searchTv(
                    cleanQuery,
                    page
            );
        }

        return searchAll(
                cleanQuery,
                page
        );
    }

    // =========================================================
    // MOVIE SEARCH
    // =========================================================

    private SearchResponse searchMovies(
            String query,
            int streamPage
    ) {

        int firstTmdbPage =
                ((streamPage - 1)
                        * TMDB_PAGES_PER_STREAM_PAGE)
                        + 1;

        List<TmdbMovie> combined =
                new ArrayList<>();

        int totalResults = 0;

        int totalTmdbPages = 0;

        for (
                int i = 0;
                i < TMDB_PAGES_PER_STREAM_PAGE;
                i++
        ) {

            int tmdbPage =
                    firstTmdbPage + i;

            TmdbPagedResponse response =
                    tmdbClient.searchMovies(
                            query,
                            tmdbPage
                    );

            if (response == null) {
                continue;
            }

            if (
                    response.results() != null
                            && !response.results().isEmpty()
            ) {

                combined.addAll(
                        response.results()
                );
            }

            totalResults =
                    response.totalResults();

            totalTmdbPages =
                    response.totalPages();

            if (
                    tmdbPage >= totalTmdbPages
            ) {
                break;
            }
        }

        List<MovieResponse> results =
                combined
                        .stream()
                        .map(movie ->
                                movieMapper
                                        .toResponse(
                                                movie.withMediaType(
                                                        "movie"
                                                )
                                        )
                        )
                        .limit(RESULTS_PER_PAGE)
                        .toList();

        int totalPages =
                calculateStreamPages(
                        totalResults
                );

        return new SearchResponse(
                results,
                streamPage,
                totalPages,
                totalResults
        );
    }

    // =========================================================
    // TV SEARCH
    // =========================================================

    private SearchResponse searchTv(
            String query,
            int streamPage
    ) {

        int firstTmdbPage =
                ((streamPage - 1)
                        * TMDB_PAGES_PER_STREAM_PAGE)
                        + 1;

        List<TmdbMovie> combined =
                new ArrayList<>();

        int totalResults = 0;

        int totalTmdbPages = 0;

        for (
                int i = 0;
                i < TMDB_PAGES_PER_STREAM_PAGE;
                i++
        ) {

            int tmdbPage =
                    firstTmdbPage + i;

            TmdbPagedResponse response =
                    tmdbClient.searchTv(
                            query,
                            tmdbPage
                    );

            if (response == null) {
                continue;
            }

            if (
                    response.results() != null
                            && !response.results().isEmpty()
            ) {

                combined.addAll(
                        response.results()
                );
            }

            totalResults =
                    response.totalResults();

            totalTmdbPages =
                    response.totalPages();

            if (
                    tmdbPage >= totalTmdbPages
            ) {
                break;
            }
        }

        List<MovieResponse> results =
                combined
                        .stream()
                        .map(movie ->
                                movieMapper
                                        .toResponse(
                                                movie.withMediaType(
                                                        "tv"
                                                )
                                        )
                        )
                        .limit(RESULTS_PER_PAGE)
                        .toList();

        int totalPages =
                calculateStreamPages(
                        totalResults
                );

        return new SearchResponse(
                results,
                streamPage,
                totalPages,
                totalResults
        );
    }

    // =========================================================
    // ALL SEARCH
    // =========================================================

    private SearchResponse searchAll(
            String query,
            int streamPage
    ) {

        int firstTmdbPage =
                ((streamPage - 1)
                        * TMDB_PAGES_PER_STREAM_PAGE)
                        + 1;

        List<TmdbMovie> movies =
                new ArrayList<>();

        List<TmdbMovie> shows =
                new ArrayList<>();

        int movieTotal = 0;

        int tvTotal = 0;

        int movieTmdbPages = 0;

        int tvTmdbPages = 0;

        /*
         * Search movies and TV separately.
         *
         * This avoids TMDB's /search/multi endpoint
         * counting people in total_results.
         */
        for (
                int i = 0;
                i < TMDB_PAGES_PER_STREAM_PAGE;
                i++
        ) {

            int tmdbPage =
                    firstTmdbPage + i;

            TmdbPagedResponse movieResponse =
                    tmdbClient.searchMovies(
                            query,
                            tmdbPage
                    );

            TmdbPagedResponse tvResponse =
                    tmdbClient.searchTv(
                            query,
                            tmdbPage
                    );

            if (
                    movieResponse != null
                            && movieResponse.results() != null
            ) {

                movies.addAll(
                        movieResponse.results()
                                .stream()
                                .map(movie ->
                                        movie.withMediaType(
                                                "movie"
                                        )
                                )
                                .toList()
                );

                movieTotal =
                        movieResponse.totalResults();

                movieTmdbPages =
                        movieResponse.totalPages();
            }

            if (
                    tvResponse != null
                            && tvResponse.results() != null
            ) {

                shows.addAll(
                        tvResponse.results()
                                .stream()
                                .map(show ->
                                        show.withMediaType(
                                                "tv"
                                        )
                                )
                                .toList()
                );

                tvTotal =
                        tvResponse.totalResults();

                tvTmdbPages =
                        tvResponse.totalPages();
            }

            boolean movieFinished =
                    tmdbPage >= movieTmdbPages;

            boolean tvFinished =
                    tmdbPage >= tvTmdbPages;

            if (
                    movieFinished
                            && tvFinished
            ) {
                break;
            }
        }

        /*
         * Interleave movies and TV so "All" does not
         * become 50 movies followed by TV.
         */
        List<TmdbMovie> combined =
                interleave(
                        movies,
                        shows
                );

        List<MovieResponse> results =
                combined
                        .stream()
                        .map(movie ->
                                movieMapper.toResponse(
                                        movie
                                )
                        )
                        .limit(RESULTS_PER_PAGE)
                        .toList();

        int totalResults =
                movieTotal + tvTotal;

        int totalPages =
                calculateStreamPages(
                        totalResults
                );

        return new SearchResponse(
                results,
                streamPage,
                totalPages,
                totalResults
        );
    }

    // =========================================================
    // DETAILS
    // =========================================================

    public MovieResponse getMovie(
            long tmdbId
    ) {

        return withPlayback(
                movieMapper.toResponse(
                        tmdbClient.getMovie(tmdbId)
                )
        );
    }

    public MovieResponse getTv(
            long tmdbId
    ) {

        MovieResponse response =
                movieMapper.toResponse(
                        tmdbClient.getTv(tmdbId)
                );

        return response.withMediaType(
                "tv"
        );
    }

    // =========================================================
    // SEASONS
    // =========================================================

    public TmdbSeasonDetails getTvSeason(
            long tmdbId,
            int seasonNumber
    ) {

        return tmdbClient.getTvSeason(
                tmdbId,
                seasonNumber
        );
    }

    // =========================================================
    // EPISODES
    // =========================================================

    public TmdbMovieDetails getTvEpisode(
            long tmdbId,
            int seasonNumber,
            int episodeNumber
    ) {

        return tmdbClient.getTvEpisode(
                tmdbId,
                seasonNumber,
                episodeNumber
        );
    }

    // =========================================================
    // VIDEOS
    // =========================================================

    public VideoInfo getVideos(
            long tmdbId
    ) {

        MovieResponse movie =
                getMovie(tmdbId);

        VideoInfo video =
                movie.video();

        if (video == null) {

            throw new ApiException(
                    HttpStatus.NOT_FOUND,
                    "No playable video is available for this title."
            );
        }

        return video;
    }

    // =========================================================
    // RECOMMENDATIONS
    // =========================================================

    public List<MovieResponse> getRecommendations(
            long tmdbId
    ) {

        return mapPage(
                tmdbClient.getRecommendations(
                        tmdbId
                ),
                "movie",
                true
        );
    }

    // =========================================================
    // CATALOG
    // =========================================================

    public MovieCatalogResponse getCatalog() {

        return new MovieCatalogResponse(
                getTrending(),
                getPopular(),
                mapPage(
                        tmdbClient.getTopRatedMovies(),
                        "movie",
                        true
                ),
                mapPage(
                        tmdbClient.getNowPlayingMovies(),
                        "movie",
                        true
                ),
                mapPage(
                        tmdbClient.discoverByGenre(28),
                        "movie",
                        true
                ),
                mapPage(
                        tmdbClient.discoverByGenre(35),
                        "movie",
                        true
                ),
                mapPage(
                        tmdbClient.discoverByGenre(18),
                        "movie",
                        true
                )
        );
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private List<MovieResponse> mapPage(
            TmdbPagedResponse page,
            String mediaType,
            boolean addPlayback
    ) {

        if (
                page == null
                        || page.results() == null
        ) {

            return List.of();
        }

        return page.results()
                .stream()
                .map(movie ->
                        movieMapper.toResponse(
                                movie.withMediaType(
                                        mediaType
                                )
                        )
                )
                .map(movie ->
                        addPlayback
                                ? withPlayback(movie)
                                : movie
                )
                .toList();
    }

    private MovieResponse withPlayback(
            MovieResponse movie
    ) {

        return videoProvider
                .findPlayableVideo(movie)
                .map(movie::withVideo)
                .orElse(movie);
    }

    private void validateSearch(
            String query,
            int page,
            String type
    ) {

        if (
                query == null
                        || query.isBlank()
        ) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Search query q is required."
            );
        }

        if (page <= 0) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Page must be greater than zero."
            );
        }

        if (page > 100) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Page cannot be greater than 100."
            );
        }

        String normalized =
                normalizeType(type);

        if (
                !normalized.equals("all")
                        && !normalized.equals("movie")
                        && !normalized.equals("tv")
        ) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Search type must be all, movie, or tv."
            );
        }
    }

    private String normalizeType(
            String type
    ) {

        if (type == null || type.isBlank()) {
            return "all";
        }

        String normalized =
                type.trim().toLowerCase();

        if (
                normalized.equals("movies")
                        || normalized.equals("movie")
        ) {

            return "movie";
        }

        if (
                normalized.equals("tv")
                        || normalized.equals("series")
                        || normalized.equals("shows")
        ) {

            return "tv";
        }

        if (normalized.equals("all")) {
            return "all";
        }

        return normalized;
    }

    private int calculateStreamPages(
            int totalResults
    ) {

        if (totalResults <= 0) {
            return 0;
        }

        return (int) Math.ceil(
                totalResults
                        / (double) RESULTS_PER_PAGE
        );
    }

    private List<TmdbMovie> interleave(
            List<TmdbMovie> movies,
            List<TmdbMovie> shows
    ) {

        List<TmdbMovie> combined =
                new ArrayList<>();

        int max =
                Math.max(
                        movies.size(),
                        shows.size()
                );

        for (int i = 0; i < max; i++) {

            if (i < movies.size()) {
                combined.add(
                        movies.get(i)
                );
            }

            if (i < shows.size()) {
                combined.add(
                        shows.get(i)
                );
            }

            if (
                    combined.size()
                            >= RESULTS_PER_PAGE
            ) {
                break;
            }
        }

        return combined;
    }
}
