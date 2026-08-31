package com.stream.movie.provider;

import com.stream.movie.config.VidSrcProperties;
import com.stream.movie.dto.MovieResponse;
import com.stream.movie.dto.VideoInfo;
import java.util.List;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class VidSrcVideoProviderTest {

    @Test
    void buildsIframeEmbedFromTmdbId() {
        VidSrcProperties properties = new VidSrcProperties();
        properties.setBaseUrl("https://vidsrcme.ru");
        VidSrcVideoProvider provider = new VidSrcVideoProvider(properties);

        MovieResponse movie = new MovieResponse(
                27205,
                "Inception",
                "overview",
                "https://image.tmdb.org/t/p/w500/poster.jpg",
                null,
                8.3,
                "2010-07-16",
                List.of("Action"),
                null);

        VideoInfo video = provider.findPlayableVideo(movie).orElseThrow();

        assertThat(video.provider()).isEqualTo("vidsrc");
        assertThat(video.videoId()).isEqualTo("27205");
        assertThat(video.embedUrl()).isEqualTo("https://vidsrcme.ru/embed/movie/27205");
        assertThat(video.embedUrl()).doesNotContain(".mp4");
    }
}
