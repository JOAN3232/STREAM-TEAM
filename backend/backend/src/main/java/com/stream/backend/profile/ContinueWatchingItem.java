package com.stream.backend.profile;

import java.time.Instant;

public class ContinueWatchingItem {

    private String contentId;
    private String mediaType;
    private String title;
    private String overview;
    private String posterUrl;
    private String backdropUrl;
    private String year;

    private double progress;
    private double currentTime;

    private Instant watchedAt;

    public ContinueWatchingItem() {
    }

    public ContinueWatchingItem(
            String contentId,
            String mediaType,
            String title,
            String overview,
            String posterUrl,
            String backdropUrl,
            String year,
            double progress,
            double currentTime
    ) {
        this.contentId = contentId;
        this.mediaType = mediaType;
        this.title = title;
        this.overview = overview;
        this.posterUrl = posterUrl;
        this.backdropUrl = backdropUrl;
        this.year = year;
        this.progress = progress;
        this.currentTime = currentTime;
        this.watchedAt = Instant.now();
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

    public String getOverview() {
        return overview;
    }

    public void setOverview(String overview) {
        this.overview = overview;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getBackdropUrl() {
        return backdropUrl;
    }

    public void setBackdropUrl(String backdropUrl) {
        this.backdropUrl = backdropUrl;
    }

    public String getYear() {
        return year;
    }

    public void setYear(String year) {
        this.year = year;
    }

    public double getProgress() {
        return progress;
    }

    public void setProgress(double progress) {
        this.progress = progress;
    }

    public double getCurrentTime() {
        return currentTime;
    }

    public void setCurrentTime(double currentTime) {
        this.currentTime = currentTime;
    }

    public Instant getWatchedAt() {
        return watchedAt;
    }

    public void setWatchedAt(Instant watchedAt) {
        this.watchedAt = watchedAt;
    }
}