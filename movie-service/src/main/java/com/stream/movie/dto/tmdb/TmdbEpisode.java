package com.stream.movie.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TmdbEpisode(
        int id,
        String name,
        String overview,
        @JsonProperty("episode_number") int episodeNumber,
        @JsonProperty("season_number") int seasonNumber,
        @JsonProperty("air_date") String airDate,
        @JsonProperty("still_path") String stillPath,
        @JsonProperty("vote_average") Double voteAverage,
        @JsonProperty("runtime") Integer runtime
) {
}
