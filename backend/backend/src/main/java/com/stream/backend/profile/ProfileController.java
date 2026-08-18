package com.stream.backend.profile;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<List<Profile>> getProfiles() {
        return ResponseEntity.ok(
                profileService.getAllProfiles()
        );
    }

    @PostMapping
    public ResponseEntity<Profile> createProfile(
            @RequestBody Profile profile
    ) {
        Profile savedProfile =
                profileService.createProfile(profile);

        return ResponseEntity.ok(savedProfile);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProfile(
            @PathVariable String id
    ) {
        profileService.deleteProfile(id);

        return ResponseEntity.noContent().build();
    }
}