package com.stream.user.controller;

import com.stream.user.dto.HistoryRequest;
import com.stream.user.security.CurrentUser;
import com.stream.user.service.LibraryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LibraryController {

    private final CurrentUser currentUser;
    private final LibraryService libraryService;

    public LibraryController(CurrentUser currentUser, LibraryService libraryService) {
        this.currentUser = currentUser;
        this.libraryService = libraryService;
    }

    @GetMapping("/api/watchlist")
    public Object getWatchlist() {
        return libraryService.watchlist(currentUser.require().userId());
    }

    @PostMapping("/api/watchlist/{movieId}")
    public Object addToWatchlist(@PathVariable long movieId) {
        return libraryService.addToWatchlist(currentUser.require().userId(), movieId);
    }

    @DeleteMapping("/api/watchlist/{movieId}")
    public void removeFromWatchlist(@PathVariable long movieId) {
        libraryService.removeFromWatchlist(currentUser.require().userId(), movieId);
    }

    @GetMapping("/api/history")
    public Object getHistory() {
        return libraryService.history(currentUser.require().userId());
    }

    @PostMapping("/api/history")
    public Object addHistory(@Valid @RequestBody HistoryRequest request) {
        return libraryService.addHistory(currentUser.require().userId(), request.getMovieId(), request.getProgress().intValue());
    }
}
