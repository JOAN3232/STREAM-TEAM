package com.stream.movie.mapper;

import com.stream.movie.config.TmdbProperties;
import com.stream.movie.dto.MovieResponse;
import com.stream.movie.dto.tmdb.TmdbGenre;
import com.stream.movie.dto.tmdb.TmdbMovie;
import com.stream.movie.dto.tmdb.TmdbMovieDetails;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Component;

@Component
public class MovieMapper {

    private static final Map<Integer, String> GENRE_NAMES = Map.ofEntries(
            Map.entry(28, "Action"),
            Map.entry(12, "Adventure"),
            Map.entry(16, "Animation"),
            Map.entry(35, "Comedy"),
            Map.entry(80, "Crime"),
            Map.entry(99, "Documentary"),
            Map.entry(18, "Drama"),
            Map.entry(10751, "Family"),
            Map.entry(14, "Fantasy"),
            Map.entry(36, "History"),
            Map.entry(27, "Horror"),
            Map.entry(10402, "Music"),
            Map.entry(9648, "Mystery"),
            Map.entry(10749, "Romance"),
            Map.entry(878, "Science Fiction"),
            Map.entry(10770, "TV Movie"),
            Map.entry(53, "Thriller"),
            Map.entry(10752, "War"),
            Map.entry(37, "Western")
    );

    private final TmdbProperties properties;

    public MovieMapper(TmdbProperties properties) {
        this.properties = properties;
    }

    public MovieResponse toResponse(TmdbMovie movie) {
        return new MovieResponse(
                movie.id(),
                movie.displayTitle(),
                movie.overview(),
                imageUrl("w500", movie.posterPath()),
                imageUrl("original", movie.backdropPath()),
                movie.voteAverage(),
                movie.displayReleaseDate(),
                genres(movie.genreIds()),
                null
        );
    }

    public MovieResponse toResponse(TmdbMovieDetails movie) {
        return new MovieResponse(
                movie.id(),
                movie.displayTitle(),
                movie.overview(),
                imageUrl("w500", movie.posterPath()),
                imageUrl("original", movie.backdropPath()),
                movie.voteAverage(),
                movie.displayReleaseDate(),
                namedGenres(movie.genres()),
                null
        );
    }

    private List<String> namedGenres(List<TmdbGenre> genres) {
        if (genres == null) {
            return List.of();
        }
        return genres.stream()
                .map(genre -> genre.name() == null || genre.name().isBlank() ? "Unknown" : genre.name())
                .toList();
    }

    private List<String> genres(List<Integer> ids) {
        if (ids == null) {
            return List.of();
        }
        return ids.stream()
                .map(id -> GENRE_NAMES.getOrDefault(id, "Unknown"))
                .toList();
    }

    private String imageUrl(String size, String path) {
        if (path == null || path.isBlank()) {
            return null;
        }
        return properties.getImageBaseUrl() + "/" + size + path;
    }
}
