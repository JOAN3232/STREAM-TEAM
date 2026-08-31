package com.stream.movie.dto.tmdb;

import java.util.List;

public record TmdbPagedResponse(
        List<TmdbMovie> results
) {
}
