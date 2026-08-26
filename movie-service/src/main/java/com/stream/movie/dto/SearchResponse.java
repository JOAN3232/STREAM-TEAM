package com.stream.movie.dto;

import java.util.List;

public record SearchResponse(

        List<MovieResponse> results,

        int page,

        int totalPages,

        int totalResults

) {
}
