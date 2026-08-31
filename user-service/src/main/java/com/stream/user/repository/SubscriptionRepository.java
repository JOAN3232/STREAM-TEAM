package com.stream.user.repository;

import com.stream.user.domain.Subscription;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SubscriptionRepository extends MongoRepository<Subscription, String> {

    Optional<Subscription> findByUserId(String userId);
}
