package com.stream.movie.service;

import com.stream.movie.client.TmdbOperations;
import com.stream.movie.dto.MovieCatalogResponse;
import com.stream.movie.dto.MovieResponse;
import com.stream.movie.dto.VideoInfo;
import com.stream.movie.dto.tmdb.TmdbPagedResponse;
import com.stream.movie.exception.ApiException;
import com.stream.movie.mapper.MovieMapper;
import com.stream.movie.provider.VideoProvider;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class MovieCatalogService {

    private final TmdbOperations tmdbClient;
    private final MovieMapper movieMapper;
    private final VideoProvider videoProvider;

    public MovieCatalogService(
            TmdbOperations tmdbClient,
            MovieMapper movieMapper,
            VideoProvider videoProvider) {
        this.tmdbClient = tmdbClient;
        this.movieMapper = movieMapper;
        this.videoProvider = videoProvider;
    }

    public List<MovieResponse> getTrending() {
        return mapPage(tmdbClient.getTrendingMovies());
    }

    public List<MovieResponse> getPopular() {
        return mapPage(tmdbClient.getPopularMovies());
    }

    public List<MovieResponse> search(String query) {
        if (query == null || query.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Search query q is required.");
        }
        return mapPage(tmdbClient.searchMovies(query.trim()));
    }

    public MovieCatalogResponse getCatalog() {
        return new MovieCatalogResponse(
                getTrending(),
                getPopular(),
                mapPage(tmdbClient.getTopRatedMovies()),
                mapPage(tmdbClient.getNowPlayingMovies()),
                mapPage(tmdbClient.discoverByGenre(28)),
                mapPage(tmdbClient.discoverByGenre(35)),
                mapPage(tmdbClient.discoverByGenre(18)));
    }

    public List<MovieResponse> getRecommendations(long tmdbId) {
        return mapPage(tmdbClient.getRecommendations(tmdbId));
    }

    public MovieResponse getMovie(long tmdbId) {
        return withPlayback(movieMapper.toResponse(tmdbClient.getMovie(tmdbId)));
    }

    public VideoInfo getVideos(long tmdbId) {
        MovieResponse movie = getMovie(tmdbId);
        VideoInfo video = movie.video();
        if (video == null) {
            throw new ApiException(HttpStatus.NOT_FOUND, "No playable video is available for this title.");
        }
        return video;
    }

    private List<MovieResponse> mapPage(TmdbPagedResponse page) {
        if (page == null || page.results() == null) {
            return List.of();
        }
        return page.results().stream()
                .map(movieMapper::toResponse)
                .map(this::withPlayback)
                .toList();
    }

    private MovieResponse withPlayback(MovieResponse movie) {
        return videoProvider.findPlayableVideo(movie)
                .map(movie::withVideo)
                .orElse(movie);
    }
}
