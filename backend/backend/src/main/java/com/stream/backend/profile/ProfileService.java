package com.stream.backend.profile;

import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(
            ProfileRepository profileRepository
    ) {
        this.profileRepository = profileRepository;
    }

    /* ==========================================
       PROFILE
    ========================================== */

    public List<Profile> getProfilesForUser(
            String userId
    ) {
        validateUserId(userId);

        return profileRepository.findByUserId(userId);
    }

    public Profile createProfile(
            String userId,
            Profile profile
    ) {
        validateUserId(userId);

        profile.setId(null);

        // Ownership comes from authenticated user,
        // not from frontend profile data.
        profile.setUserId(userId);

        return profileRepository.save(profile);
    }

    public Profile updateProfile(
        String userId,
        String profileId,
        Profile updates
) {
    Profile profile =
            getOwnedProfile(userId, profileId);

    if (
            updates.getName() == null ||
            updates.getName().isBlank()
    ) {
        throw new IllegalArgumentException(
                "Profile name is required"
        );
    }

    String cleanName = updates.getName().trim();

    if (cleanName.length() > 30) {
        throw new IllegalArgumentException(
                "Profile name must be 30 characters or less"
        );
    }

    if (
            updates.getAvatarId() == null ||
            updates.getAvatarId().isBlank()
    ) {
        throw new IllegalArgumentException(
                "Avatar is required"
        );
    }

    profile.setName(cleanName);
    profile.setAvatarId(
            updates.getAvatarId().trim()
    );
    profile.setKids(updates.isKids());

    return profileRepository.save(profile);
}

    public boolean deleteProfile(
            String userId,
            String profileId
    ) {
        validateUserId(userId);

        return profileRepository
                .findByIdAndUserId(profileId, userId)
                .map(profile -> {
                    profileRepository.delete(profile);
                    return true;
                })
                .orElse(false);
    }

    /* ==========================================
       MY LIST
    ========================================== */

    public List<MyListItem> getMyList(
            String userId,
            String profileId
    ) {
        Profile profile =
                getOwnedProfile(userId, profileId);

        return profile.getMyList();
    }

    public MyListItem addToMyList(
            String userId,
            String profileId,
            MyListItem item
    ) {
        Profile profile =
                getOwnedProfile(userId, profileId);

        if (
                item.getContentId() == null ||
                item.getContentId().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Content ID is required"
            );
        }

        if (
                item.getMediaType() == null ||
                item.getMediaType().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Media type is required"
            );
        }

        boolean alreadyExists =
                profile.getMyList()
                        .stream()
                        .anyMatch(saved ->
                                saved.getContentId()
                                        .equals(item.getContentId())
                                &&
                                saved.getMediaType()
                                        .equalsIgnoreCase(
                                                item.getMediaType()
                                        )
                        );

        if (alreadyExists) {
            return profile.getMyList()
                    .stream()
                    .filter(saved ->
                            saved.getContentId()
                                    .equals(item.getContentId())
                            &&
                            saved.getMediaType()
                                    .equalsIgnoreCase(
                                            item.getMediaType()
                                    )
                    )
                    .findFirst()
                    .orElse(item);
        }

        if (item.getAddedAt() == null) {
            item.setAddedAt(Instant.now());
        }

        profile.getMyList().add(item);

        profileRepository.save(profile);

        return item;
    }

    public boolean removeFromMyList(
            String userId,
            String profileId,
            String mediaType,
            String contentId
    ) {
        Profile profile =
                getOwnedProfile(userId, profileId);

        boolean removed =
                profile.getMyList()
                        .removeIf(item ->
                                item.getContentId()
                                        .equals(contentId)
                                &&
                                item.getMediaType()
                                        .equalsIgnoreCase(mediaType)
                        );

        if (removed) {
            profileRepository.save(profile);
        }

        return removed;
    }

    /* ==========================================
       CONTINUE WATCHING
    ========================================== */

    public List<ContinueWatchingItem> getContinueWatching(
            String userId,
            String profileId
    ) {
        Profile profile =
                getOwnedProfile(userId, profileId);

        List<ContinueWatchingItem> items =
                profile.getContinueWatching();

        items.sort(
                Comparator.comparing(
                        ContinueWatchingItem::getWatchedAt,
                        Comparator.nullsLast(
                                Comparator.reverseOrder()
                        )
                )
        );

        return items;
    }

    public ContinueWatchingItem saveContinueWatching(
            String userId,
            String profileId,
            ContinueWatchingItem item
    ) {
        Profile profile =
                getOwnedProfile(userId, profileId);

        if (
                item.getContentId() == null ||
                item.getContentId().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Content ID is required"
            );
        }

        if (
                item.getMediaType() == null ||
                item.getMediaType().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "Media type is required"
            );
        }

        /*
         * 95% or more = considered finished.
         * Remove it from Continue Watching.
         */
        if (item.getProgress() >= 95) {
            removeFromContinueWatching(
                    userId,
                    profileId,
                    item.getMediaType(),
                    item.getContentId()
            );

            return item;
        }

        /*
         * Remove old progress for this title
         * before inserting the newest progress.
         */
        profile.getContinueWatching()
                .removeIf(saved ->
                        saved.getContentId()
                                .equals(item.getContentId())
                        &&
                        saved.getMediaType()
                                .equalsIgnoreCase(
                                        item.getMediaType()
                                )
                );

        item.setWatchedAt(Instant.now());

        /*
         * Newest watched title appears first.
         */
        profile.getContinueWatching()
                .add(0, item);

        /*
         * Keep only the latest 20 titles.
         */
        if (
                profile.getContinueWatching().size() > 20
        ) {
            profile.setContinueWatching(
                    new java.util.ArrayList<>(
                            profile.getContinueWatching()
                                    .subList(0, 20)
                    )
            );
        }

        profileRepository.save(profile);

        return item;
    }

    public boolean removeFromContinueWatching(
            String userId,
            String profileId,
            String mediaType,
            String contentId
    ) {
        Profile profile =
                getOwnedProfile(userId, profileId);

        boolean removed =
                profile.getContinueWatching()
                        .removeIf(item ->
                                item.getContentId()
                                        .equals(contentId)
                                &&
                                item.getMediaType()
                                        .equalsIgnoreCase(
                                                mediaType
                                        )
                        );

        if (removed) {
            profileRepository.save(profile);
        }

        return removed;
    }

    /* ==========================================
       HELPERS
    ========================================== */

    private Profile getOwnedProfile(
            String userId,
            String profileId
    ) {
        validateUserId(userId);

        return profileRepository
                .findByIdAndUserId(
                        profileId,
                        userId
                )
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Profile not found"
                        )
                );
    }

    private void validateUserId(
            String userId
    ) {
        if (
                userId == null ||
                userId.isBlank()
        ) {
            throw new IllegalArgumentException(
                    "User authentication is required"
            );
        }
    }
}