package com.stream.user.controller;

import com.stream.user.dto.ProfileRequest;
import com.stream.user.security.CurrentUser;
import com.stream.user.service.ProfileService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profiles")
public class ProfileController {

    private final CurrentUser currentUser;
    private final ProfileService profileService;

    public ProfileController(CurrentUser currentUser, ProfileService profileService) {
        this.currentUser = currentUser;
        this.profileService = profileService;
    }

    @GetMapping
    public Object getProfiles() {
        return profileService.getProfiles(currentUser.require().userId());
    }

    @PostMapping
    public Object createProfile(@Valid @RequestBody ProfileRequest request) {
        return profileService.create(currentUser.require().userId(), request);
    }

    @DeleteMapping("/{profileId}")
    public void deleteProfile(@PathVariable String profileId) {
        profileService.delete(currentUser.require().userId(), profileId);
    }
}
