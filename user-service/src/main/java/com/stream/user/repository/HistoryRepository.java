package com.stream.user.repository;

import com.stream.user.domain.WatchHistoryItem;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface HistoryRepository extends MongoRepository<WatchHistoryItem, String> {
    List<WatchHistoryItem> findByUserIdOrderByWatchedAtDesc(String userId);
}
