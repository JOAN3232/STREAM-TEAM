package com.stream.backend;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = {
        "PAYSTACK_SECRET_KEY=test_paystack_key",
        "MAIL_USERNAME=test@example.com",
        "MAIL_APP_PASSWORD=test_password",
        "spring.mongodb.uri=mongodb://localhost:27017/stream_test"
})

class BackendApplicationTests {

    @Test
    void contextLoads() {
    }
}