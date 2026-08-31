package com.stream.movie.client;

import com.stream.movie.config.TmdbProperties;
import com.stream.movie.dto.tmdb.TmdbMovieDetails;
import com.stream.movie.dto.tmdb.TmdbPagedResponse;
import com.stream.movie.exception.ApiException;
import com.stream.movie.exception.TmdbException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.net.URI;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.util.UriComponentsBuilder;

@Component
public class TmdbClient implements TmdbOperations {

    private static final Logger log = LoggerFactory.getLogger(TmdbClient.class);

    private final RestClient restClient;
    private final TmdbProperties properties;

    public TmdbClient(RestClient tmdbRestClient, TmdbProperties properties) {
        this.restClient = tmdbRestClient;
        this.properties = properties;
    }

    public TmdbPagedResponse getTrendingMovies() {
        return get("/trending/movie/week", TmdbPagedResponse.class, java.util.Map.of());
    }

    public TmdbPagedResponse getPopularMovies() {
        return get("/movie/popular", TmdbPagedResponse.class, java.util.Map.of("page", "1"));
    }

    public TmdbPagedResponse searchMovies(String query) {
        return get("/search/movie", TmdbPagedResponse.class, java.util.Map.of("query", query, "page", "1"));
    }

    public TmdbPagedResponse getTopRatedMovies() {
        return get("/movie/top_rated", TmdbPagedResponse.class, java.util.Map.of("page", "1"));
    }

    public TmdbPagedResponse getNowPlayingMovies() {
        return get("/movie/now_playing", TmdbPagedResponse.class, java.util.Map.of("page", "1"));
    }

    public TmdbPagedResponse discoverByGenre(int genreId) {
        return get("/discover/movie", TmdbPagedResponse.class, java.util.Map.of(
                "sort_by", "popularity.desc",
                "with_genres", String.valueOf(genreId),
                "page", "1"));
    }

    public TmdbPagedResponse getRecommendations(long tmdbId) {
        return get("/movie/" + tmdbId + "/recommendations", TmdbPagedResponse.class, java.util.Map.of("page", "1"));
    }

    public TmdbMovieDetails getMovie(long tmdbId) {
        if (tmdbId <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Movie id must be a positive TMDB id.");
        }
        return get("/movie/" + tmdbId, TmdbMovieDetails.class, java.util.Map.of());
    }

    private <T> T get(String path, Class<T> type, java.util.Map<String, String> extraQuery) {
        if (!properties.hasCredentials()) {
            throw new ApiException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "TMDB credentials are not configured. Set TMDB_API_KEY or TMDB_READ_ACCESS_KEY.");
        }

        try {
            UriComponentsBuilder builder = UriComponentsBuilder
                    .fromUriString(properties.getBaseUrl())
                    .path(path)
                    .queryParam("language", "en-US");
            extraQuery.forEach(builder::queryParam);
            if (properties.getReadAccessKey() == null || properties.getReadAccessKey().isBlank()) {
                builder.queryParam("api_key", properties.getApiKey());
            }
            URI uri = builder.encode().build().toUri();

            return restClient.get()
                    .uri(uri)
                    .retrieve()
                    .onStatus(status -> status.value() == 404, (request, response) -> {
                        throw new ApiException(HttpStatus.NOT_FOUND, "Movie not found.");
                    })
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        throw new TmdbException(
                                "TMDB request failed with status " + response.getStatusCode().value());
                    })
                    .body(type);
        } catch (ApiException ex) {
            throw ex;
        } catch (RestClientException ex) {
            log.warn("TMDB call failed for {}", path, ex);
            throw new TmdbException("Unable to reach TMDB.", ex);
        }
    }
}
