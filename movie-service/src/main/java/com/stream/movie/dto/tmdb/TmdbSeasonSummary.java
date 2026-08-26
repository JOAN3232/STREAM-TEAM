package com.stream.movie.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TmdbSeasonSummary(
        long id,

        String name,

        String overview,

        @JsonProperty("season_number")
        int seasonNumber,

        @JsonProperty("episode_count")
        int episodeCount,

        @JsonProperty("poster_path")
        String posterPath,

        @JsonProperty("air_date")
        String airDate
) {
}
