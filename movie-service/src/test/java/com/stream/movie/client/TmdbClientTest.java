package com.stream.movie.client;

import com.stream.movie.config.TmdbProperties;
import com.stream.movie.dto.tmdb.TmdbPagedResponse;
import com.stream.movie.exception.ApiException;
import com.stream.movie.exception.TmdbException;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import okhttp3.mockwebserver.RecordedRequest;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class TmdbClientTest {

    private MockWebServer server;
    private TmdbProperties properties;

    @BeforeEach
    void startServer() throws Exception {
        server = new MockWebServer();
        server.start();
        properties = new TmdbProperties();
        properties.setBaseUrl(server.url("/").toString().replaceAll("/$", ""));
        properties.setApiKey("test-api-key");
        properties.setReadAccessKey("");
    }

    @AfterEach
    void stopServer() throws Exception {
        server.shutdown();
    }

    @Test
    void fetchesTrendingMoviesWithApiKey() throws Exception {
        server.enqueue(new MockResponse()
                .setBody("{\"results\":[{\"id\":1,\"title\":\"Dune\",\"overview\":\"x\",\"poster_path\":\"/p.jpg\",\"backdrop_path\":\"/b.jpg\",\"vote_average\":8.1,\"release_date\":\"2021-10-22\",\"genre_ids\":[878]}]}")
                .addHeader("Content-Type", "application/json"));

        TmdbPagedResponse response = newClient().getTrendingMovies();

        assertThat(response.results()).hasSize(1);
        assertThat(response.results().get(0).title()).isEqualTo("Dune");

        RecordedRequest request = server.takeRequest();
        assertThat(request.getPath()).contains("/trending/movie/week");
        assertThat(request.getPath()).contains("api_key=test-api-key");
        assertThat(request.getHeader("Authorization")).isNull();
    }

    @Test
    void mapsTmdbHttpErrors() {
        server.enqueue(new MockResponse().setResponseCode(401).setBody("{\"status_message\":\"Invalid\"}"));

        assertThatThrownBy(() -> newClient().getTrendingMovies())
                .isInstanceOf(TmdbException.class)
                .hasMessageContaining("401");
    }

    @Test
    void rejectsMissingCredentials() {
        properties.setApiKey("");
        properties.setReadAccessKey("");

        assertThatThrownBy(() -> newClient().getTrendingMovies())
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("TMDB credentials");
    }

    private TmdbClient newClient() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        RestClient restClient = RestClient.builder()
                .baseUrl(properties.getBaseUrl())
                .requestFactory(factory)
                .defaultHeader("Accept", "application/json")
                .build();
        return new TmdbClient(restClient, properties);
    }
}
