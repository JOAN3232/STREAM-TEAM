package com.stream.user;

import com.stream.user.domain.WatchlistItem;
import com.stream.user.domain.Profile;
import com.stream.user.repository.HistoryRepository;
import com.stream.user.repository.PaymentRepository;
import com.stream.user.repository.ProfileRepository;
import com.stream.user.repository.SubscriptionRepository;
import com.stream.user.repository.WatchlistRepository;
import okhttp3.mockwebserver.MockResponse;
import okhttp3.mockwebserver.MockWebServer;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.autoconfigure.exclude="
                + "org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration,"
                + "org.springframework.boot.autoconfigure.data.mongo.MongoDataAutoConfiguration",
        "jwt.secret=test-secret-key-must-be-at-least-32b",
        "paystack.secret-key=test-key",
        "paystack.public-key=pk_test_demo"
})
@AutoConfigureMockMvc
class UserApiTest {

    private static final String SECRET = "test-secret-key-must-be-at-least-32b";
    private static final MockWebServer PAYSTACK_SERVER = startServer();

    @Autowired
    private MockMvc mockMvc;

    private static MockWebServer startServer() {
        MockWebServer server = new MockWebServer();
        try {
            server.start();
        } catch (java.io.IOException e) {
            throw new IllegalStateException("Could not start Paystack mock server", e);
        }
        return server;
    }

    @org.junit.jupiter.api.AfterAll
    static void stopServer() throws java.io.IOException {
        PAYSTACK_SERVER.shutdown();
    }

    @org.springframework.test.context.DynamicPropertySource
    static void configure(org.springframework.test.context.DynamicPropertyRegistry registry) {
        registry.add("paystack.base-url", () -> PAYSTACK_SERVER.url("/").toString().replaceAll("/$", ""));
    }

    @MockBean
    private WatchlistRepository watchlistRepository;
    @MockBean
    private HistoryRepository historyRepository;
    @MockBean
    private SubscriptionRepository subscriptionRepository;
    @MockBean
    private PaymentRepository paymentRepository;
    @MockBean
    private ProfileRepository profileRepository;

    @Test
    void meRequiresJwt() throws Exception {
        mockMvc.perform(get("/api/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void watchlistReturnsSavedTitles() throws Exception {
        WatchlistItem item = new WatchlistItem();
        item.setUserId("user-1");
        item.setMovieId(27205);
        when(watchlistRepository.findByUserIdOrderByAddedAtDesc("user-1")).thenReturn(List.of(item));
        when(watchlistRepository.findByUserIdAndMovieId(eq("user-1"), eq(27205L))).thenReturn(Optional.empty());
        when(watchlistRepository.save(any(WatchlistItem.class))).thenAnswer(invocation -> invocation.getArgument(0));

        mockMvc.perform(get("/api/watchlist").header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].movieId").value(27205));

        mockMvc.perform(post("/api/watchlist/27205").header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.movieId").value(27205));
    }


    @Test
    void profilesCanBeCreated() throws Exception {
        when(profileRepository.save(any(Profile.class))).thenAnswer(invocation -> {
            Profile saved = invocation.getArgument(0);
            saved.setId("profile-1");
            return saved;
        });

        mockMvc.perform(post("/api/profiles")
                        .header("Authorization", "Bearer " + token())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Praise",
                                  "avatarId": "classic-red",
                                  "avatarName": "Classic Red",
                                  "avatarImage": "/avatars/classic-red.png",
                                  "kids": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("profile-1"))
                .andExpect(jsonPath("$.name").value("Praise"))
                .andExpect(jsonPath("$.avatarId").value("classic-red"));
    }

    @Test
    void profilesCanBeListed() throws Exception {
        Profile profile = new Profile();
        profile.setId("profile-1");
        profile.setUserId("user-1");
        profile.setName("Praise");
        profile.setAvatarId("classic-red");
        profile.setAvatarName("Classic Red");
        profile.setAvatarImage("/avatars/classic-red.png");
        profile.setKids(false);
        profile.setCreatedAt(Instant.now());
        when(profileRepository.findByUserIdOrderByCreatedAtAsc("user-1")).thenReturn(List.of(profile));

        mockMvc.perform(get("/api/profiles")
                        .header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("profile-1"))
                .andExpect(jsonPath("$[0].name").value("Praise"));
    }

    @Test
    void verifyPaymentActivatesSubscription() throws Exception {
        when(paymentRepository.findByReference("ref-123")).thenReturn(Optional.empty());
        when(paymentRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));
        when(subscriptionRepository.findByUserId("user-1")).thenReturn(Optional.empty());
        when(subscriptionRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        PAYSTACK_SERVER.enqueue(new MockResponse()
                .setHeader("Content-Type", "application/json")
                .setBody("""
                        {
                          "status": true,
                          "data": {
                            "status": "success",
                            "metadata": {
                              "plan": "PREMIUM"
                            }
                          }
                        }
                        """));

        mockMvc.perform(get("/api/payments/verify/ref-123")
                        .header("Authorization", "Bearer " + token()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.plan").value("PREMIUM"))
                .andExpect(jsonPath("$.status").value("ACTIVE"));
    }

    private String token() {
        byte[] bytes = SECRET.getBytes(StandardCharsets.UTF_8);
        SecretKey key = Keys.hmacShaKeyFor(bytes.length >= 32 ? bytes : java.util.Arrays.copyOf(bytes, 32));
        Instant now = Instant.now();
        return Jwts.builder()
                .subject("user-1")
                .claim("email", "a@b.com")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(3600)))
                .signWith(key)
                .compact();
    }
}
