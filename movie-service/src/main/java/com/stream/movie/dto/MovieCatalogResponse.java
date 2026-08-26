package com.stream.movie.dto;

import java.util.List;

public record MovieCatalogResponse(
        List<MovieResponse> trending,
        List<MovieResponse> popular,
        List<MovieResponse> topRated,
        List<MovieResponse> movies,
        List<MovieResponse> action,
        List<MovieResponse> comedy,
        List<MovieResponse> drama
) {
}
