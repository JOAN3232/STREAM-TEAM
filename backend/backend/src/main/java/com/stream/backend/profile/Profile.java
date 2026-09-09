package com.stream.backend.profile;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "profiles")
public class Profile {

    @Id
    private String id;

    private String userId;

    private String name;

    private String avatarId;

    private boolean kids;

    private List<MyListItem> myList = new ArrayList<>();

    private List<ContinueWatchingItem> continueWatching = new ArrayList<>();

    public Profile() {
    }

    public Profile(
            String userId,
            String name,
            String avatarId,
            boolean kids
    ) {
        this.userId = userId;
        this.name = name;
        this.avatarId = avatarId;
        this.kids = kids;

        this.myList = new ArrayList<>();
        this.continueWatching = new ArrayList<>();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public List<MyListItem> getMyList() {
        if (myList == null) {
            myList = new ArrayList<>();
        }

        return myList;
    }

    public void setMyList(List<MyListItem> myList) {
        this.myList = myList;
    }

    public List<ContinueWatchingItem> getContinueWatching() {
        if (continueWatching == null) {
            continueWatching = new ArrayList<>();
        }

        return continueWatching;
    }

    public void setContinueWatching(
            List<ContinueWatchingItem> continueWatching
    ) {
        this.continueWatching = continueWatching;
    }
}