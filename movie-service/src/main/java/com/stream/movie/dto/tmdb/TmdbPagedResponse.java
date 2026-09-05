package com.stream.movie.dto.tmdb;

import java.util.List;

public record TmdbPagedResponse(

        int page,

        List<TmdbMovie> results,

        int totalPages,

        int totalResults

) {

    public TmdbPagedResponse() {

        this(
                1,
                List.of(),
                1,
                0
        );
    }
}
