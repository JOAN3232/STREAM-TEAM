package com.stream.backend.profile;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "profiles")
public class Profile {

    @Id
    private String id;

    private String name;
    private String avatarId;
    private boolean kids;

    public Profile() {
    }

    public Profile(String name, String avatarId, boolean kids) {
        this.name = name;
        this.avatarId = avatarId;
        this.kids = kids;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

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

    public boolean isKids() {
        return kids;
    }

    public void setKids(boolean kids) {
        this.kids = kids;
    }
}