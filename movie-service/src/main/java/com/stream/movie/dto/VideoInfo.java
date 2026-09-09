package com.stream.movie.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Playback information for the frontend embed player.
 * embedUrl is an iframe player URL, never a raw downloadable file.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record VideoInfo(
        String provider,
        String videoId,
        String embedUrl,
        String title,
        String thumbnail
) {
}
