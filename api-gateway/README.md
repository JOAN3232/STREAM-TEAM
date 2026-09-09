# API Gateway

Spring Cloud Gateway. Default port: `8080`.

The React app should call `VITE_API_URL` (this service), never TMDB, VidSrc, MongoDB, Resend, or Paystack.

## Run

```bash
cd api-gateway
mvn spring-boot:run
```

Movie Service must already be running on `8082` for `/api/movies/**`.

```bash
curl http://localhost:8080/api/movies/trending
curl http://localhost:8080/api/movies/27205/videos
```

## Routes

| Method | Path | Downstream |
|--------|------|------------|
| GET | `/api/movies/**` | movie-service (`MOVIE_SERVICE_URL`) |
| GET, POST | `/api/auth/**` | auth-service (`AUTH_SERVICE_URL`) |
| GET | `/api/users/**` | user-service |
| GET, POST, DELETE | `/api/watchlist/**` | user-service |
| GET, POST | `/api/history/**` | user-service |
| GET, POST | `/api/subscriptions/**` | user-service |
| GET, POST | `/api/payments/**` | user-service |

## Environment variables

See `.env.example`. CORS uses `CORS_ALLOWED_ORIGINS` (no wildcards in production).
