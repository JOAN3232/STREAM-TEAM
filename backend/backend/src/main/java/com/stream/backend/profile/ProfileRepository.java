package com.stream.backend.profile;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository
        extends MongoRepository<Profile, String> {

    List<Profile> findByUserId(String userId);

    Optional<Profile> findByIdAndUserId(
            String id,
            String userId
    );
}