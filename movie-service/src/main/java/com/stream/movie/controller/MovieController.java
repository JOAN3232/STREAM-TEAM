package com.stream.movie.controller;

import com.stream.movie.dto.MovieCatalogResponse;
import com.stream.movie.dto.MovieResponse;
import com.stream.movie.dto.VideoInfo;
import com.stream.movie.service.MovieCatalogService;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieCatalogService movieCatalogService;

    public MovieController(MovieCatalogService movieCatalogService) {
        this.movieCatalogService = movieCatalogService;
    }

    @GetMapping("/trending")
    public List<MovieResponse> trending() {
        return movieCatalogService.getTrending();
    }

    @GetMapping("/popular")
    public List<MovieResponse> popular() {
        return movieCatalogService.getPopular();
    }

    @GetMapping("/search")
    public List<MovieResponse> search(@RequestParam("q") String query) {
        return movieCatalogService.search(query);
    }

    @GetMapping("/catalog")
    public MovieCatalogResponse catalog() {
        return movieCatalogService.getCatalog();
    }

    @GetMapping("/{tmdbId:\\d+}/recommendations")
    public List<MovieResponse> recommendations(@PathVariable long tmdbId) {
        return movieCatalogService.getRecommendations(tmdbId);
    }

    @GetMapping("/{tmdbId:\\d+}")
    public MovieResponse movie(@PathVariable long tmdbId) {
        return movieCatalogService.getMovie(tmdbId);
    }

    @GetMapping("/{tmdbId:\\d+}/videos")
    public VideoInfo videos(@PathVariable long tmdbId) {
        return movieCatalogService.getVideos(tmdbId);
    }
}
