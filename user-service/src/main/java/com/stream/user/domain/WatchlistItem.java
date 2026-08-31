package com.stream.user.domain;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "watchlists")
@CompoundIndex(name = "user_movie", def = "{'userId': 1, 'movieId': 1}", unique = true)
public class WatchlistItem {
    @Id
    private String id;
    private String userId;
    private long movieId;
    private Instant addedAt;

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public long getMovieId() { return movieId; }
    public void setMovieId(long movieId) { this.movieId = movieId; }
    public Instant getAddedAt() { return addedAt; }
    public void setAddedAt(Instant addedAt) { this.addedAt = addedAt; }
}
