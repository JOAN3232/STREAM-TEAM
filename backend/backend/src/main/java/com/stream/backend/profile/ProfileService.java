package com.stream.backend.profile;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public List<Profile> getAllProfiles() {
        return profileRepository.findAll();
    }

    public Profile createProfile(Profile profile) {
        return profileRepository.save(profile);
    }

    public void deleteProfile(String id) {
        profileRepository.deleteById(id);
    }
}