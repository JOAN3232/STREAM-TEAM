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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class MovieTrendingEndpointTest {

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
        registry.add("cors.allowed-origins", () -> "http://localhost:5173");
    }

    @BeforeEach
    void resetServer() throws InterruptedException {
        while (tmdbServer.getRequestCount() > 0 && tmdbServer.takeRequest(1, java.util.concurrent.TimeUnit.MILLISECONDS) != null) {
            // drain leftover requests between tests
        }
    }

    @Test
    void trendingReturnsCleanMoviePayload() throws Exception {
        tmdbServer.enqueue(new MockResponse()
                .setHeader("Content-Type", "application/json")
                .setBody("""
                        {
                          "results": [
                            {
                              "id": 27205,
                              "title": "Inception",
                              "overview": "A thief who steals corporate secrets.",
                              "poster_path": "/poster.jpg",
                              "backdrop_path": "/backdrop.jpg",
                              "vote_average": 8.3,
                              "release_date": "2010-07-16",
                              "genre_ids": [28, 878]
                            }
                          ]
                        }
                        """));

        mockMvc.perform(get("/api/movies/trending").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].id", is(27205)))
                .andExpect(jsonPath("$[0].title", is("Inception")))
                .andExpect(jsonPath("$[0].posterUrl", is("https://image.tmdb.org/t/p/w500/poster.jpg")))
                .andExpect(jsonPath("$[0].backdropUrl", is("https://image.tmdb.org/t/p/original/backdrop.jpg")))
                .andExpect(jsonPath("$[0].rating", is(8.3)))
                .andExpect(jsonPath("$[0].releaseDate", is("2010-07-16")))
                .andExpect(jsonPath("$[0].genres[0]", is("Action")))
                .andExpect(jsonPath("$[0].video.provider", is("vidsrc")))
                .andExpect(jsonPath("$[0].video.videoId", is("27205")))
                .andExpect(jsonPath("$[0].video.embedUrl", is("https://vidsrcme.ru/embed/movie/27205")));
    }

    @Test
    void trendingReturnsJsonErrorWhenTmdbFails() throws Exception {
        tmdbServer.enqueue(new MockResponse().setResponseCode(500).setBody("upstream error"));

        mockMvc.perform(get("/api/movies/trending").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.status", is(502)))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("TMDB")))
                .andExpect(jsonPath("$.path", is("/api/movies/trending")))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
