package com.stream.movie.provider;

import com.stream.movie.config.VidSrcProperties;
import com.stream.movie.dto.MovieResponse;
import com.stream.movie.dto.VideoInfo;
import java.util.Optional;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

/**
 * Project-authorized VidSrc embed provider.
 * Returns an iframe player URL from the TMDB id. Does not return downloadable video files.
 */
@Component
@Primary
public class VidSrcVideoProvider implements VideoProvider {

    private final VidSrcProperties properties;

    public VidSrcVideoProvider(VidSrcProperties properties) {
        this.properties = properties;
    }

    @Override
    public String providerId() {
        return "vidsrc";
    }

    @Override
    public Optional<VideoInfo> findPlayableVideo(MovieResponse movie) {
        if (movie == null || movie.id() <= 0) {
            return Optional.empty();
        }
        String tmdbId = String.valueOf(movie.id());
        String embedUrl = normalizedBase() + "/embed/movie/" + tmdbId;
        return Optional.of(new VideoInfo(
                providerId(),
                tmdbId,
                embedUrl,
                movie.title(),
                movie.posterUrl()));
    }

    @Override
    public Optional<VideoInfo> getPlaybackInfo(MovieResponse movie) {
        return findPlayableVideo(movie);
    }

    private String normalizedBase() {
        String base = properties.getBaseUrl();
        if (base == null || base.isBlank()) {
            return "https://vidsrcme.ru";
        }
        return base.endsWith("/") ? base.substring(0, base.length() - 1) : base;
    }
}
