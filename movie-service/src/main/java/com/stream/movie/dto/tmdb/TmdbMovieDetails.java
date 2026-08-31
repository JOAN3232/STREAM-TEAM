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
        @JsonProperty("poster_path") String posterPath,
        @JsonProperty("backdrop_path") String backdropPath,
        @JsonProperty("vote_average") Double voteAverage,
        @JsonProperty("release_date") String releaseDate,
        @JsonProperty("first_air_date") String firstAirDate,
        List<TmdbGenre> genres,
        @JsonProperty("imdb_id") String imdbId
) {
    public String displayTitle() {
        if (title != null && !title.isBlank()) {
            return title;
        }
        return name;
    }

    public String displayReleaseDate() {
        if (releaseDate != null && !releaseDate.isBlank()) {
            return releaseDate;
        }
        return firstAirDate;
    }
}
