package com.stream.movie;

import java.io.IOException;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MovieVideosEndpointTest {

    private static final MockWebServer tmdbServer = startServer();

    @Autowired
    private MockMvc mockMvc;

    private static MockWebServer startServer() {
        MockWebServer server = new MockWebServer();
        try {
            server.start();
        } catch (IOException e) {
            throw new IllegalStateException("Could not start TMDB mock server", e);
        }
        return server;
    }

    @AfterAll
    static void stopTmdb() throws IOException {
        tmdbServer.shutdown();
    }

    @DynamicPropertySource
    static void tmdbProperties(DynamicPropertyRegistry registry) {
        registry.add("tmdb.base-url", () -> tmdbServer.url("/").toString().replaceAll("/$", ""));
        registry.add("tmdb.api-key", () -> "test-key");
        registry.add("tmdb.read-access-key", () -> "");
        registry.add("vidsrc.base-url", () -> "https://vidsrcme.ru");
    }

    @BeforeEach
    void drain() throws InterruptedException {
        while (tmdbServer.getRequestCount() > 0
                && tmdbServer.takeRequest(1, java.util.concurrent.TimeUnit.MILLISECONDS) != null) {
            // drain leftover requests
        }
    }

    @Test
    void videosReturnsVidSrcEmbedNotADownloadUrl() throws Exception {
        enqueueMovie();

        mockMvc.perform(get("/api/movies/27205/videos").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.provider", is("vidsrc")))
                .andExpect(jsonPath("$.videoId", is("27205")))
                .andExpect(jsonPath("$.embedUrl", is("https://vidsrcme.ru/embed/movie/27205")))
                .andExpect(jsonPath("$.embedUrl", not(containsString(".mp4"))))
                .andExpect(jsonPath("$.title", is("Inception")));
    }

    @Test
    void movieDetailsIncludeVidSrcPlayback() throws Exception {
        enqueueMovie();

        mockMvc.perform(get("/api/movies/27205").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id", is(27205)))
                .andExpect(jsonPath("$.title", is("Inception")))
                .andExpect(jsonPath("$.genres[0]", is("Action")))
                .andExpect(jsonPath("$.video.provider", is("vidsrc")))
                .andExpect(jsonPath("$.video.embedUrl", is("https://vidsrcme.ru/embed/movie/27205")));
    }

    @Test
    void unknownMovieReturnsJson404() throws Exception {
        tmdbServer.enqueue(new MockResponse().setResponseCode(404).setBody("{\"status_message\":\"Not found\"}"));

        mockMvc.perform(get("/api/movies/1/videos").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)))
                .andExpect(jsonPath("$.message", is("Movie not found.")))
                .andExpect(jsonPath("$.path", is("/api/movies/1/videos")))
                .andExpect(jsonPath("$.timestamp").exists());
    }

    private void enqueueMovie() {
        tmdbServer.enqueue(new MockResponse()
                .setHeader("Content-Type", "application/json")
                .setBody("""
                        {
                          "id": 27205,
                          "title": "Inception",
                          "overview": "A thief who steals corporate secrets.",
                          "poster_path": "/poster.jpg",
                          "backdrop_path": "/backdrop.jpg",
                          "vote_average": 8.3,
                          "release_date": "2010-07-16",
                          "imdb_id": "tt1375666",
                          "genres": [{"id": 28, "name": "Action"}, {"id": 878, "name": "Science Fiction"}]
                        }
                        """));
    }
}
