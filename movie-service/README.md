# Movie Service

Independent Spring Boot service for STREAM movie metadata.

Default port: `8082`

**JDK:** Use **Java 21**. Java 26 works but Spring Boot 3.4 tests start slowly.

## Run

```bash
cd movie-service
# set TMDB_API_KEY or TMDB_READ_ACCESS_KEY (never put these in the React app)
mvn spring-boot:run
```

Then:

```bash
curl http://localhost:8082/api/movies/trending
curl http://localhost:8082/api/movies/27205
curl http://localhost:8082/api/movies/27205/videos
```

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/movies/trending` | Weekly trending movies from TMDB + VidSrc embed |
| GET | `/api/movies/popular` | Popular movies |
| GET | `/api/movies/search?q=` | Search by title |
| GET | `/api/movies/{tmdbId}` | Movie details + playback info |
| GET | `/api/movies/{tmdbId}/videos` | VidSrc iframe embed for Watch |
| GET | `/actuator/health` | Health check |

TMDB credentials stay on the server. The response never includes API keys.

## Playback (VidSrc)

This project uses **VidSrc** as the authorized streaming embed provider.

The service does **not** stream video bytes. It returns an iframe player URL built from the TMDB id:

```json
{
  "provider": "vidsrc",
  "videoId": "27205",
  "embedUrl": "https://vidsrcme.ru/embed/movie/27205",
  "title": "Inception",
  "thumbnail": "https://image.tmdb.org/t/p/w500/..."
}
```

`VideoProvider` is the abstraction. `VidSrcVideoProvider` is `@Primary`. `YouTubeVideoProvider` remains a stub so another authorized source can be added later without rewriting controllers.

Never return a raw `.mp4` or download URL.

## Environment variables

| Name | Required | Purpose |
|------|----------|---------|
| `TMDB_API_KEY` | one of key/token | TMDB v3 API key |
| `TMDB_READ_ACCESS_KEY` | one of key/token | TMDB v4 read access token (Bearer) |
| `SERVER_PORT` | no | Defaults to 8082 |
| `VIDSRC_BASE_URL` | no | VidSrc origin, default `https://vidsrcme.ru` |
| `CORS_ALLOWED_ORIGINS` | no | Comma-separated origins |

## Test

```bash
mvn test
```
