package com.stream.user.service;

import com.stream.user.domain.Profile;
import com.stream.user.dto.ProfileRequest;
import com.stream.user.repository.ProfileRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final ProfileRepository repository;

    public ProfileService(ProfileRepository repository) {
        this.repository = repository;
    }

    public List<Profile> getProfiles(String userId) {
        return repository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    public Profile create(String userId, ProfileRequest request) {
        Profile profile = new Profile();
        profile.setUserId(userId);
        profile.setName(request.getName().trim());
        profile.setAvatarId(request.getAvatarId());
        profile.setAvatarName(request.getAvatarName());
        profile.setAvatarImage(request.getAvatarImage());
        profile.setKids(request.isKids());
        profile.setCreatedAt(Instant.now());
        return repository.save(profile);
    }

    public void delete(String userId, String profileId) {
        repository.findById(profileId)
                .filter(profile -> userId.equals(profile.getUserId()))
                .ifPresent(repository::delete);
    }
}
