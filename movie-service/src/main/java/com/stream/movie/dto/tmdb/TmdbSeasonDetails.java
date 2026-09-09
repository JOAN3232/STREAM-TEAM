package com.stream.movie.dto.tmdb;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Collections;
import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
public record TmdbSeasonDetails(
        int id,

        String name,

        String overview,

        @JsonProperty("season_number")
        int seasonNumber,

        @JsonProperty("poster_path")
        String posterPath,

        @JsonProperty("air_date")
        String airDate,

        @JsonProperty("episode_count")
        int episodeCount,

        List<TmdbEpisode> episodes
) {

    public List<TmdbEpisode> safeEpisodes() {
        return episodes == null
                ? Collections.emptyList()
                : episodes;
    }
}
