package com.stream.user.repository;

import com.stream.user.domain.Profile;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProfileRepository extends MongoRepository<Profile, String> {

    List<Profile> findByUserIdOrderByCreatedAtAsc(String userId);
}
