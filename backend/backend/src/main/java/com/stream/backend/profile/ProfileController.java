package com.stream.backend.profile;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(
            ProfileService profileService
    ) {
        this.profileService = profileService;
    }

    /* ==========================================
       PROFILES
    ========================================== */

    @GetMapping
    public ResponseEntity<?> getProfiles(
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) String userId
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Authentication required"
                            )
                    );
        }

        List<Profile> profiles =
                profileService.getProfilesForUser(userId);

        return ResponseEntity.ok(profiles);
    }

    @PostMapping
    public ResponseEntity<?> createProfile(
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) String userId,
            @RequestBody Profile profile
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Authentication required"
                            )
                    );
        }

        Profile savedProfile =
                profileService.createProfile(
                        userId,
                        profile
                );

        return ResponseEntity.ok(savedProfile);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProfile(
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) String userId,
            @PathVariable String id
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Authentication required"
                            )
                    );
        }

        boolean deleted =
                profileService.deleteProfile(
                        userId,
                        id
                );

        if (!deleted) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Profile not found"
                            )
                    );
        }

        return ResponseEntity.noContent().build();
    }

    /* ==========================================
       MY LIST
    ========================================== */

    @GetMapping("/{profileId}/my-list")
    public ResponseEntity<?> getMyList(
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) String userId,
            @PathVariable String profileId
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Authentication required"
                            )
                    );
        }

        try {
            return ResponseEntity.ok(
                    profileService.getMyList(
                            userId,
                            profileId
                    )
            );
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", exception.getMessage()
                            )
                    );
        }
    }

    @PostMapping("/{profileId}/my-list")
    public ResponseEntity<?> addToMyList(
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) String userId,
            @PathVariable String profileId,
            @RequestBody MyListItem item
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Authentication required"
                            )
                    );
        }

        try {
            MyListItem savedItem =
                    profileService.addToMyList(
                            userId,
                            profileId,
                            item
                    );

            return ResponseEntity.ok(savedItem);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", exception.getMessage()
                            )
                    );
        }
    }

    @DeleteMapping(
            "/{profileId}/my-list/{mediaType}/{contentId}"
    )
    public ResponseEntity<?> removeFromMyList(
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) String userId,
            @PathVariable String profileId,
            @PathVariable String mediaType,
            @PathVariable String contentId
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Authentication required"
                            )
                    );
        }

        try {
            boolean removed =
                    profileService.removeFromMyList(
                            userId,
                            profileId,
                            mediaType,
                            contentId
                    );

            if (!removed) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                Map.of(
                                        "success", false,
                                        "message",
                                        "Title not found in My List"
                                )
                        );
            }

            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", exception.getMessage()
                            )
                    );
        }
    }

    /* ==========================================
       CONTINUE WATCHING
    ========================================== */

    @GetMapping("/{profileId}/continue-watching")
    public ResponseEntity<?> getContinueWatching(
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) String userId,
            @PathVariable String profileId
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Authentication required"
                            )
                    );
        }

        try {
            return ResponseEntity.ok(
                    profileService.getContinueWatching(
                            userId,
                            profileId
                    )
            );
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", exception.getMessage()
                            )
                    );
        }
    }

    @PutMapping("/{profileId}/continue-watching")
    public ResponseEntity<?> saveContinueWatching(
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) String userId,
            @PathVariable String profileId,
            @RequestBody ContinueWatchingItem item
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Authentication required"
                            )
                    );
        }

        try {
            ContinueWatchingItem savedItem =
                    profileService.saveContinueWatching(
                            userId,
                            profileId,
                            item
                    );

            return ResponseEntity.ok(savedItem);
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .badRequest()
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", exception.getMessage()
                            )
                    );
        }
    }

    @DeleteMapping(
            "/{profileId}/continue-watching/{mediaType}/{contentId}"
    )
    public ResponseEntity<?> removeFromContinueWatching(
            @RequestHeader(
                    value = "X-User-Id",
                    required = false
            ) String userId,
            @PathVariable String profileId,
            @PathVariable String mediaType,
            @PathVariable String contentId
    ) {
        if (userId == null || userId.isBlank()) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", "Authentication required"
                            )
                    );
        }

        try {
            boolean removed =
                    profileService.removeFromContinueWatching(
                            userId,
                            profileId,
                            mediaType,
                            contentId
                    );

            if (!removed) {
                return ResponseEntity
                        .status(HttpStatus.NOT_FOUND)
                        .body(
                                Map.of(
                                        "success", false,
                                        "message",
                                        "Title not found in Continue Watching"
                                )
                        );
            }

            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException exception) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body(
                            Map.of(
                                    "success", false,
                                    "message", exception.getMessage()
                            )
                    );
        }
    }
}