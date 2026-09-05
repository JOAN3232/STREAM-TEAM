package com.stream.movie.client;

import com.stream.movie.config.TmdbProperties;
import com.stream.movie.dto.tmdb.TmdbMovieDetails;
import com.stream.movie.dto.tmdb.TmdbPagedResponse;
import com.stream.movie.dto.tmdb.TmdbSeasonDetails;
import com.stream.movie.exception.ApiException;
import com.stream.movie.exception.TmdbException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;
import java.util.Map;

@Component
public class TmdbClient implements TmdbOperations {

    private static final Logger log =
            LoggerFactory.getLogger(TmdbClient.class);

    private final RestClient restClient;
    private final TmdbProperties properties;

    public TmdbClient(
            RestClient tmdbRestClient,
            TmdbProperties properties
    ) {
        this.restClient = tmdbRestClient;
        this.properties = properties;
    }

    // =========================================================
    // MOVIES
    // =========================================================

    @Override
    public TmdbPagedResponse getTrendingMovies() {

        return get(
                "/trending/movie/week",
                TmdbPagedResponse.class,
                Map.of()
        );
    }

    @Override
    public TmdbPagedResponse getPopularMovies() {

        return get(
                "/movie/popular",
                TmdbPagedResponse.class,
                Map.of("page", "1")
        );
    }

    @Override
    public TmdbPagedResponse searchMovies(String query) {

        return searchMovies(query, 1);
    }

    @Override
    public TmdbPagedResponse searchMovies(
            String query,
            int page
    ) {

        validatePage(page);

        return get(
                "/search/movie",
                TmdbPagedResponse.class,
                Map.of(
                        "query", query,
                        "page", String.valueOf(page),
                        "include_adult", "false"
                )
        );
    }

    @Override
    public TmdbPagedResponse getTopRatedMovies() {

        return get(
                "/movie/top_rated",
                TmdbPagedResponse.class,
                Map.of("page", "1")
        );
    }

    @Override
    public TmdbPagedResponse getNowPlayingMovies() {

        return get(
                "/movie/now_playing",
                TmdbPagedResponse.class,
                Map.of("page", "1")
        );
    }

    @Override
    public TmdbPagedResponse discoverByGenre(
            int genreId
    ) {

        return get(
                "/discover/movie",
                TmdbPagedResponse.class,
                Map.of(
                        "sort_by", "popularity.desc",
                        "with_genres", String.valueOf(genreId),
                        "page", "1"
                )
        );
    }

    @Override
    public TmdbPagedResponse getRecommendations(
            long tmdbId
    ) {

        validateId(tmdbId, "Movie");

        return get(
                "/movie/" + tmdbId + "/recommendations",
                TmdbPagedResponse.class,
                Map.of("page", "1")
        );
    }

    @Override
    public TmdbMovieDetails getMovie(
            long tmdbId
    ) {

        validateId(tmdbId, "Movie");

        return get(
                "/movie/" + tmdbId,
                TmdbMovieDetails.class,
                Map.of(
                        "append_to_response",
                        "credits,videos,recommendations"
                )
        );
    }

    // =========================================================
    // TV
    // =========================================================

    @Override
    public TmdbPagedResponse getPopularTv() {

        return get(
                "/tv/popular",
                TmdbPagedResponse.class,
                Map.of("page", "1")
        );
    }

    @Override
    public TmdbPagedResponse searchTv(
            String query
    ) {

        return searchTv(query, 1);
    }

    @Override
    public TmdbPagedResponse searchTv(
            String query,
            int page
    ) {

        validatePage(page);

        return get(
                "/search/tv",
                TmdbPagedResponse.class,
                Map.of(
                        "query", query,
                        "page", String.valueOf(page),
                        "include_adult", "false"
                )
        );
    }

    @Override
    public TmdbMovieDetails getTv(
            long tmdbId
    ) {

        validateId(tmdbId, "TV");

        return get(
                "/tv/" + tmdbId,
                TmdbMovieDetails.class,
                Map.of(
                        "append_to_response",
                        "credits,videos,recommendations"
                )
        );
    }

    @Override
    public TmdbSeasonDetails getTvSeason(
            long tmdbId,
            int seasonNumber
    ) {

        validateId(tmdbId, "TV");

        if (seasonNumber < 0) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Season number cannot be negative."
            );
        }

        return get(
                "/tv/"
                        + tmdbId
                        + "/season/"
                        + seasonNumber,
                TmdbSeasonDetails.class,
                Map.of()
        );
    }

    @Override
    public TmdbMovieDetails getTvEpisode(
            long tmdbId,
            int seasonNumber,
            int episodeNumber
    ) {

        validateId(tmdbId, "TV");

        if (seasonNumber < 0) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Season number cannot be negative."
            );
        }

        if (episodeNumber <= 0) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Episode number must be positive."
            );
        }

        return get(
                "/tv/"
                        + tmdbId
                        + "/season/"
                        + seasonNumber
                        + "/episode/"
                        + episodeNumber,
                TmdbMovieDetails.class,
                Map.of()
        );
    }

    // =========================================================
    // VALIDATION
    // =========================================================

    private void validateId(
            long id,
            String type
    ) {

        if (id <= 0) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    type + " id must be a positive TMDB id."
            );
        }
    }

    private void validatePage(
            int page
    ) {

        if (page <= 0) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Page must be greater than zero."
            );
        }

        if (page > 500) {

            throw new ApiException(
                    HttpStatus.BAD_REQUEST,
                    "Page cannot be greater than 500."
            );
        }
    }

    // =========================================================
    // HTTP
    // =========================================================

    private <T> T get(
            String path,
            Class<T> type,
            Map<String, String> extraQuery
    ) {

        if (!properties.hasCredentials()) {

            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "TMDB credentials are not configured. "
                            + "Set TMDB_API_KEY or TMDB_READ_ACCESS_KEY."
            );
        }

        try {

            UriComponentsBuilder builder =
                    UriComponentsBuilder
                            .fromUriString(
                                    properties.getBaseUrl()
                            )
                            .path(path)
                            .queryParam(
                                    "language",
                                    "en-US"
                            );

            extraQuery.forEach(
                    builder::queryParam
            );

            /*
             * If a v4 Read Access Token exists,
             * the RestClient configuration can handle
             * authentication through its interceptor.
             *
             * Otherwise use the v3 api_key.
             */
            if (
                    properties.getReadAccessKey() == null
                            || properties
                            .getReadAccessKey()
                            .isBlank()
            ) {

                builder.queryParam(
                        "api_key",
                        properties.getApiKey()
                );
            }

            URI uri =
                    builder
                            .encode()
                            .build()
                            .toUri();

            return restClient
                    .get()
                    .uri(uri)
                    .retrieve()

                    .onStatus(
                            status ->
                                    status.value() == 404,

                            (request, response) -> {

                                throw new ApiException(
                                        HttpStatus.NOT_FOUND,
                                        "TMDB title not found."
                                );
                            }
                    )

                    .onStatus(
                            HttpStatusCode::isError,

                            (request, response) -> {

                                throw new TmdbException(
                                        "TMDB request failed with status "
                                                + response
                                                .getStatusCode()
                                                .value()
                                );
                            }
                    )

                    .body(type);

        } catch (ApiException ex) {

            throw ex;

        } catch (RestClientException ex) {

            log.warn(
                    "TMDB call failed for {}",
                    path,
                    ex
            );

            throw new TmdbException(
                    "Unable to reach TMDB.",
                    ex
            );
        }
    }
}
