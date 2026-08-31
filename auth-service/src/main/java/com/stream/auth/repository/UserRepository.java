package com.stream.auth.repository;

import com.stream.auth.domain.User;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    Optional<User> findByVerificationTokenHash(String verificationTokenHash);

    boolean existsByEmailIgnoreCase(String email);
}
