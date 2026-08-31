package com.stream.movie.provider;

import com.stream.movie.dto.MovieResponse;
import com.stream.movie.dto.VideoInfo;
import java.util.Optional;

/**
 * Abstraction over authorized playback sources.
 * A new provider can be added without rewriting Movie Service controllers.
 */
public interface VideoProvider {

    String providerId();

    Optional<VideoInfo> findPlayableVideo(MovieResponse movie);

    Optional<VideoInfo> getPlaybackInfo(MovieResponse movie);
}
