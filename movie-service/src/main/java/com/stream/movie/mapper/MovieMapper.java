package com.stream.movie.mapper;

import com.stream.movie.dto.MovieResponse;
import com.stream.movie.dto.tmdb.TmdbMovie;
import com.stream.movie.dto.tmdb.TmdbMovieDetails;

import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class MovieMapper {

    private static final String IMAGE_BASE =
            "https://image.tmdb.org/t/p";

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

                List.of(),

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
                                .map(
                                        genre ->
                                                genre.name()
                                )
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

        if (
                mediaType != null
                        && !mediaType.isBlank()
        ) {

            return mediaType;
        }

        if (
                firstAirDate != null
                        && !firstAirDate.isBlank()
        ) {

            return "tv";
        }

        if (
                releaseDate != null
                        && !releaseDate.isBlank()
        ) {

            return "movie";
        }

        /*
         * TMDB movie objects normally have title.
         * TV objects normally have name.
         */
        if (
                name != null
                        && !name.isBlank()
                        && (title == null
                        || title.isBlank())
        ) {

            return "tv";
        }

        return "movie";
    }

    private String buildImageUrl(
            String path,
            String size
    ) {

        if (
                path == null
                        || path.isBlank()
        ) {

            return null;
        }

        if (
                path.startsWith("http://")
                        || path.startsWith("https://")
        ) {

            return path;
        }

        return IMAGE_BASE
                + "/"
                + size
                + path;
    }
}
