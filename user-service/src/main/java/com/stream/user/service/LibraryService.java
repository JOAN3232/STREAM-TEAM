package com.stream.user.service;

import com.stream.user.domain.WatchHistoryItem;
import com.stream.user.domain.WatchlistItem;
import com.stream.user.exception.ApiException;
import com.stream.user.repository.HistoryRepository;
import com.stream.user.repository.WatchlistRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class LibraryService {

    private final WatchlistRepository watchlistRepository;
    private final HistoryRepository historyRepository;

    public LibraryService(WatchlistRepository watchlistRepository, HistoryRepository historyRepository) {
        this.watchlistRepository = watchlistRepository;
        this.historyRepository = historyRepository;
    }

    public List<WatchlistItem> watchlist(String userId) {
        return watchlistRepository.findByUserIdOrderByAddedAtDesc(userId);
    }

    public WatchlistItem addToWatchlist(String userId, long movieId) {
        return watchlistRepository.findByUserIdAndMovieId(userId, movieId).orElseGet(() -> {
            WatchlistItem item = new WatchlistItem();
            item.setUserId(userId);
            item.setMovieId(movieId);
            item.setAddedAt(Instant.now());
            return watchlistRepository.save(item);
        });
    }

    public void removeFromWatchlist(String userId, long movieId) {
        watchlistRepository.deleteByUserIdAndMovieId(userId, movieId);
    }

    public List<WatchHistoryItem> history(String userId) {
        return historyRepository.findByUserIdOrderByWatchedAtDesc(userId);
    }

    public WatchHistoryItem addHistory(String userId, long movieId, int progress) {
        if (movieId <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "movieId is required.");
        }
        WatchHistoryItem item = new WatchHistoryItem();
        item.setUserId(userId);
        item.setMovieId(movieId);
        item.setProgress(Math.max(0, Math.min(progress, 100)));
        item.setWatchedAt(Instant.now());
        return historyRepository.save(item);
    }
}
