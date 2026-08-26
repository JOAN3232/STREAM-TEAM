package com.stream.movie.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TmdbMovieDetails(
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

        List<TmdbGenre> genres,

        @JsonProperty("imdb_id")
        String imdbId,

        List<TmdbSeasonSummary> seasons
) {

    public String displayTitle() {
        if (title != null && !title.isBlank()) {
            return title;
        }

        if (name != null && !name.isBlank()) {
            return name;
        }

        return "Untitled";
    }

    public String displayReleaseDate() {
        if (releaseDate != null && !releaseDate.isBlank()) {
            return releaseDate;
        }

        return firstAirDate;
    }

    public boolean isTv() {
        return name != null && !name.isBlank()
                && (title == null || title.isBlank());
    }

    public boolean isMovie() {
        return title != null && !title.isBlank();
    }
}
