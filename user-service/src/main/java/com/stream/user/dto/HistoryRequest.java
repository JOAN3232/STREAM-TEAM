package com.stream.user.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

public class HistoryRequest {

    @NotNull(message = "Movie ID is required.")
    private Long movieId;

    @NotNull(message = "Progress is required.")
    @DecimalMin(value = "0.0", message = "Progress must be at least 0.")
    @DecimalMax(value = "100.0", message = "Progress must be 100 or less.")
    private Double progress;

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public Double getProgress() {
        return progress;
    }

    public void setProgress(Double progress) {
        this.progress = progress;
    }
}
