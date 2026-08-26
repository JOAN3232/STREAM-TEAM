package com.stream.movie.provider;

import com.stream.movie.dto.MovieResponse;
import com.stream.movie.dto.VideoInfo;
import java.util.Optional;
import org.springframework.stereotype.Component;

/**
 * Alternate legally authorized provider (official YouTube trailers).
 * VidSrc is the primary playback source for this project.
 */
@Component
public class YouTubeVideoProvider implements VideoProvider {

    @Override
    public String providerId() {
        return "youtube";
    }

    @Override
    public Optional<VideoInfo> findPlayableVideo(MovieResponse movie) {
        return Optional.empty();
    }

    @Override
    public Optional<VideoInfo> getPlaybackInfo(MovieResponse movie) {
        return findPlayableVideo(movie);
    }
}
