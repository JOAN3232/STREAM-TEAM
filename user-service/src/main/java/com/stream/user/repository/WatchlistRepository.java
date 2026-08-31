package com.stream.user.repository;

import com.stream.user.domain.WatchlistItem;
import java.util.List;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface WatchlistRepository extends MongoRepository<WatchlistItem, String> {

    List<WatchlistItem> findByUserIdOrderByAddedAtDesc(String userId);

    Optional<WatchlistItem> findByUserIdAndMovieId(String userId, long movieId);

    void deleteByUserIdAndMovieId(String userId, long movieId);
}
