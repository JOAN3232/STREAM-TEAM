package com.stream.backend.profile;

import java.time.Instant;

public class MyListItem {

    private String contentId;

    private String mediaType;

    private String title;

    private String posterPath;

    private String backdropPath;

    private Instant addedAt;

    public MyListItem() {
    }

    public MyListItem(
            String contentId,
            String mediaType,
            String title,
            String posterPath,
            String backdropPath
    ) {
        this.contentId = contentId;
        this.mediaType = mediaType;
        this.title = title;
        this.posterPath = posterPath;
        this.backdropPath = backdropPath;
        this.addedAt = Instant.now();
    }

    public String getContentId() {
        return contentId;
    }

    public void setContentId(String contentId) {
        this.contentId = contentId;
    }

    public String getMediaType() {
        return mediaType;
    }

    public void setMediaType(String mediaType) {
        this.mediaType = mediaType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPosterPath() {
        return posterPath;
    }

    public void setPosterPath(String posterPath) {
        this.posterPath = posterPath;
    }

    public String getBackdropPath() {
        return backdropPath;
    }

    public void setBackdropPath(String backdropPath) {
        this.backdropPath = backdropPath;
    }

    public Instant getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(Instant addedAt) {
        this.addedAt = addedAt;
    }
}