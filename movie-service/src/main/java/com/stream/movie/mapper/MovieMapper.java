package com.stream.movie.mapper;

import com.stream.movie.dto.MovieResponse;
import com.stream.movie.dto.tmdb.TmdbMovie;
import com.stream.movie.dto.tmdb.TmdbMovieDetails;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;

@Component
public class MovieMapper {

    private static final String IMAGE_BASE =
            "https://image.tmdb.org/t/p";

    /*
     * TMDB genre IDs.
     *
     * Trending/search/catalog responses usually return genre_ids
     * instead of full genre objects, so we translate those IDs here.
     */
    private static final Map<Integer, String> GENRE_NAMES =
            Map.ofEntries(
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
                    Map.entry(37, "Western"),
                    Map.entry(10759, "Action & Adventure"),
                    Map.entry(10762, "Kids"),
                    Map.entry(10763, "News"),
                    Map.entry(10764, "Reality"),
                    Map.entry(10765, "Sci-Fi & Fantasy"),
                    Map.entry(10766, "Soap"),
                    Map.entry(10767, "Talk"),
                    Map.entry(10768, "War & Politics")
            );

    public MovieResponse toResponse(
            TmdbMovie movie
    ) {

        if (movie == null) {
            return null;
        }

        String mediaType =
                resolveMediaType(
                        movie.mediaType(),
                        movie.title(),
                        movie.name(),
                        movie.releaseDate(),
                        movie.firstAirDate()
                );

        List<String> genres =
                mapGenreIds(movie.genreIds());

        return new MovieResponse(
                movie.id(),
                resolveTitle(
                        movie.title(),
                        movie.name()
                ),
                movie.overview(),
                buildImageUrl(
                        movie.posterPath(),
                        "w500"
                ),
                buildImageUrl(
                        movie.backdropPath(),
                        "original"
                ),
                movie.voteAverage(),
                resolveReleaseDate(
                        movie.releaseDate(),
                        movie.firstAirDate()
                ),
                genres,
                null,
                mediaType
        );
    }

    public MovieResponse toResponse(
            TmdbMovieDetails movie
    ) {

        if (movie == null) {
            return null;
        }

        String mediaType =
                resolveMediaType(
                        null,
                        movie.title(),
                        movie.name(),
                        movie.releaseDate(),
                        movie.firstAirDate()
                );

        List<String> genres =
                movie.genres() == null
                        ? List.of()
                        : movie.genres()
                                .stream()
                                .map(genre -> genre.name())
                                .toList();

        return new MovieResponse(
                movie.id(),
                resolveTitle(
                        movie.title(),
                        movie.name()
                ),
                movie.overview(),
                buildImageUrl(
                        movie.posterPath(),
                        "w500"
                ),
                buildImageUrl(
                        movie.backdropPath(),
                        "original"
                ),
                movie.voteAverage(),
                resolveReleaseDate(
                        movie.releaseDate(),
                        movie.firstAirDate()
                ),
                genres,
                null,
                mediaType
        );
    }

    private List<String> mapGenreIds(
            List<Integer> genreIds
    ) {

        if (genreIds == null || genreIds.isEmpty()) {
            return List.of();
        }

        return genreIds
                .stream()
                .map(GENRE_NAMES::get)
                .filter(name -> name != null)
                .toList();
    }

    private String resolveTitle(
            String title,
            String name
    ) {

        if (
                title != null
                        && !title.isBlank()
        ) {
            return title;
        }

        if (
                name != null
                        && !name.isBlank()
        ) {
            return name;
        }

        return "Untitled";
    }

    private String resolveReleaseDate(
            String releaseDate,
            String firstAirDate
    ) {

        if (
                releaseDate != null
                        && !releaseDate.isBlank()
        ) {
            return releaseDate;
        }

        if (
                firstAirDate != null
                        && !firstAirDate.isBlank()
        ) {
            return firstAirDate;
        }

        return "";
    }

    private String resolveMediaType(
            String mediaType,
            String title,
            String name,
            String releaseDate,
            String firstAirDate
    ) {

        if (mediaType != null && !mediaType.isBlank()) {
            return mediaType;
        }

        if (name != null && !name.isBlank() && (title == null || title.isBlank())) {
            return "tv";
        }

        if (firstAirDate != null && !firstAirDate.isBlank() && (releaseDate == null || releaseDate.isBlank())) {
            return "tv";
        }

        return "movie";
    }

    private String buildImageUrl(
            String path,
            String size
    ) {

        if (path == null || path.isBlank()) {
            return null;
        }

        return IMAGE_BASE + "/" + size + path;
    }
}
