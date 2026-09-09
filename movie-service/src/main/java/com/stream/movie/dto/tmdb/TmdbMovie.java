package com.stream.movie.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record TmdbMovie(

        long id,

        String title,

        String name,

        String overview,

        @JsonProperty("poster_path")
        String posterPath,

        @JsonProperty("backdrop_path")
        String backdropPath,

        @JsonProperty("vote_average")
        Double voteAverage,

        @JsonProperty("release_date")
        String releaseDate,

        @JsonProperty("first_air_date")
        String firstAirDate,

        @JsonProperty("genre_ids")
        List<Integer> genreIds,

        @JsonProperty("media_type")
        String mediaType

) {

    public TmdbMovie withMediaType(
            String type
    ) {

        return new TmdbMovie(
                id,
                title,
                name,
                overview,
                posterPath,
                backdropPath,
                voteAverage,
                releaseDate,
                firstAirDate,
                genreIds,
                type
        );
    }
}
