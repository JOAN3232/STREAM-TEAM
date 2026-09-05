package com.stream.movie.dto;

import java.util.List;

public record MovieResponse(

        long id,

        String title,

        String overview,

        String posterUrl,

        String backdropUrl,

        Double rating,

        String releaseDate,

        List<String> genres,

        VideoInfo video,

        String mediaType

) {

    public MovieResponse withVideo(
            VideoInfo video
    ) {

        return new MovieResponse(
                id,
                title,
                overview,
                posterUrl,
                backdropUrl,
                rating,
                releaseDate,
                genres,
                video,
                mediaType
        );
    }

    public MovieResponse withMediaType(
            String mediaType
    ) {

        return new MovieResponse(
                id,
                title,
                overview,
                posterUrl,
                backdropUrl,
                rating,
                releaseDate,
                genres,
                video,
                mediaType
        );
    }
}
