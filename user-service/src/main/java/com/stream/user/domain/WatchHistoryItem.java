package com.stream.user.domain;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "watchHistory")
public class WatchHistoryItem {
    @Id
    private String id;
    private String userId;
    private long movieId;
    private int progress;
    private Instant watchedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public long getMovieId() { return movieId; }
    public void setMovieId(long movieId) { this.movieId = movieId; }
    public int getProgress() { return progress; }
    public void setProgress(int progress) { this.progress = progress; }
    public Instant getWatchedAt() { return watchedAt; }
    public void setWatchedAt(Instant watchedAt) { this.watchedAt = watchedAt; }
}
