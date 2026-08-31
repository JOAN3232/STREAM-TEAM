package com.stream.user.service;

import com.stream.user.security.AuthenticatedUser;
import java.util.Map;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    public Map<String, Object> getCurrentUser(AuthenticatedUser user) {
        return Map.of(
                "id", user.userId(),
                "email", user.email()
        );
    }
}
