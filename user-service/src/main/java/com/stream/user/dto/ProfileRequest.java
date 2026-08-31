package com.stream.user.dto;

import jakarta.validation.constraints.NotBlank;

public class ProfileRequest {

    @NotBlank(message = "Profile name is required.")
    private String name;

    @NotBlank(message = "Avatar ID is required.")
    private String avatarId;

    @NotBlank(message = "Avatar name is required.")
    private String avatarName;

    @NotBlank(message = "Avatar image is required.")
    private String avatarImage;

    private boolean kids;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAvatarId() {
        return avatarId;
    }

    public void setAvatarId(String avatarId) {
        this.avatarId = avatarId;
    }

    public String getAvatarName() {
        return avatarName;
    }

    public void setAvatarName(String avatarName) {
        this.avatarName = avatarName;
    }

    public String getAvatarImage() {
        return avatarImage;
    }

    public void setAvatarImage(String avatarImage) {
        this.avatarImage = avatarImage;
    }

    public boolean isKids() {
        return kids;
    }

    public void setKids(boolean kids) {
        this.kids = kids;
    }
}
