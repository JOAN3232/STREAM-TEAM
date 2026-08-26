package com.stream.movie.controller;

import com.stream.movie.dto.MovieResponse;
import com.stream.movie.dto.SearchResponse;
import com.stream.movie.dto.VideoInfo;
import com.stream.movie.dto.tmdb.TmdbMovieDetails;
import com.stream.movie.dto.tmdb.TmdbSeasonDetails;
import com.stream.movie.service.MovieCatalogService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final MovieCatalogService movieCatalogService;

    public MovieController(
            MovieCatalogService movieCatalogService
    ) {

        this.movieCatalogService =
                movieCatalogService;
    }

    // =========================================================
    // MOVIES
    // =========================================================

    @GetMapping("/trending")
    public List<MovieResponse> trending() {

        return movieCatalogService.getTrending();
    }

    @GetMapping("/popular")
    public List<MovieResponse> popular() {

        return movieCatalogService.getPopular();
    }

    // =========================================================
    // TV
    // =========================================================

    @GetMapping("/tv/popular")
    public List<MovieResponse> popularTv() {

        return movieCatalogService.getPopularTv();
    }

    // =========================================================
    // SEARCH
    // =========================================================

    /*
     * Example:
     *
     * /api/movies/search?q=batman&type=all&page=1
     *
     * type:
     *
     * all
     * movie
     * tv
     *
     * STREAM returns up to 50 results per page.
     */
    @GetMapping("/search")
    public SearchResponse search(

            @RequestParam("q")
            String query,

            @RequestParam(
                    value = "page",
                    defaultValue = "1"
            )
            int page,

            @RequestParam(
                    value = "type",
                    defaultValue = "all"
            )
            String type
    ) {

        return movieCatalogService.search(
                query,
                page,
                type
        );
    }

    // =========================================================
    // CATALOG
    // =========================================================

    @GetMapping("/catalog")
    public Object catalog() {

        return movieCatalogService.getCatalog();
    }

    // =========================================================
    // MOVIE DETAILS
    // =========================================================

    @GetMapping("/{id}")
    public MovieResponse movie(
            @PathVariable long id
    ) {

        return movieCatalogService.getMovie(id);
    }

    @GetMapping("/{id}/videos")
    public VideoInfo videos(
            @PathVariable long id
    ) {

        return movieCatalogService.getVideos(id);
    }

    @GetMapping("/{id}/recommendations")
    public List<MovieResponse> recommendations(
            @PathVariable long id
    ) {

        return movieCatalogService.getRecommendations(
                id
        );
    }

    // =========================================================
    // TV DETAILS
    // =========================================================

    @GetMapping("/tv/{id}")
    public MovieResponse tv(
            @PathVariable long id
    ) {

        return movieCatalogService.getTv(id);
    }

    // =========================================================
    // TV SEASON
    // =========================================================

    @GetMapping(
            "/tv/{id}/season/{seasonNumber}"
    )
    public TmdbSeasonDetails tvSeason(

            @PathVariable long id,

            @PathVariable int seasonNumber
    ) {

        return movieCatalogService.getTvSeason(
                id,
                seasonNumber
        );
    }

    // =========================================================
    // TV EPISODE
    // =========================================================

    @GetMapping(
            "/tv/{id}/season/{seasonNumber}/episode/{episodeNumber}"
    )
    public TmdbMovieDetails tvEpisode(

            @PathVariable long id,

            @PathVariable int seasonNumber,

            @PathVariable int episodeNumber
    ) {

        return movieCatalogService.getTvEpisode(
                id,
                seasonNumber,
                episodeNumber
        );
    }
}
