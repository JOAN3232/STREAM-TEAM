package com.stream.movie;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "tmdb.api-key=",
        "tmdb.read-access-key="
})
@AutoConfigureMockMvc
class MovieTrendingNoCredentialsTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void trendingReturns503WhenTmdbIsNotConfigured() throws Exception {
        mockMvc.perform(get("/api/movies/trending").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.status", is(503)))
                .andExpect(jsonPath("$.message").value(org.hamcrest.Matchers.containsString("TMDB credentials")))
                .andExpect(jsonPath("$.path", is("/api/movies/trending")))
                .andExpect(jsonPath("$.timestamp").exists());
    }
}
