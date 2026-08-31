package com.stream.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.cloud.gateway.route.RouteLocator;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class GatewayRouteTest {

    @Autowired
    private RouteLocator routeLocator;

    @Test
    void loadsMovieAuthAndUserRoutes() {
        var ids = routeLocator.getRoutes().map(route -> route.getId()).collectList().block();
        assertThat(ids).contains("movie-service", "auth-service", "user-service");
    }
}
