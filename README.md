# STREAM-TEAM

Netflix-style streaming application with a React/Vite frontend and Spring Boot microservices.

## Architecture

- `frontend` → React + Vite
- `api-gateway` → Spring Cloud Gateway
- `movie-service` → TMDB metadata + VidSrc playback abstraction
- `auth-service` → registration, login, JWT, email verification
- `user-service` → watchlist, history, subscriptions, payments

## Services

### Frontend
- Local dev URL: `http://localhost:5173`
- Required frontend env:
  - `VITE_API_URL`

### API Gateway
- Port: `8080`
- Routes:
  - `/api/movies/**`
  - `/api/auth/**`
  - `/api/users/**`
  - `/api/watchlist/**`
  - `/api/history/**`
  - `/api/subscriptions/**`
  - `/api/payments/**`

### Movie Service
- Port: `8082`
- Endpoints:
  - `GET /api/movies/trending`
  - `GET /api/movies/popular`
  - `GET /api/movies/search?q=`
  - `GET /api/movies/{tmdbId}`
  - `GET /api/movies/{tmdbId}/videos`

### Auth Service
- Port: `8081`
- Endpoints:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/verify-email`
  - `GET /api/auth/verify-email?token=...`
  - `POST /api/auth/resend-verification`

### User Service
- Port: `8083`
- Endpoints:
  - `GET /api/users/me`
  - `GET /api/watchlist`
  - `POST /api/watchlist/{movieId}`
  - `DELETE /api/watchlist/{movieId}`
  - `GET /api/history`
  - `POST /api/history`
  - `GET /api/subscriptions/me`
  - `POST /api/subscriptions`
  - `POST /api/payments/initialize`
  - `GET /api/payments/verify/{reference}`

## Environment variables

Copy `.env.example` to `.env` locally and fill in your real values.

Never commit:
- `.env`
- MongoDB credentials
- JWT secrets
- TMDB credentials
- Resend API keys
- Paystack secret keys

## Local development

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend services
Run each service separately or use Docker Compose.

## Docker

### Start all services
```bash
docker compose up --build
```

### Start with local MongoDB container profile
```bash
docker compose --profile localdb up --build
```

Notes:
- If using MongoDB Atlas, keep `MONGODB_URI` pointed at Atlas.
- The `mongodb` service is optional and placed behind the `localdb` profile.
- Gateway is exposed on `http://localhost:8080`.

## Jenkins

A simple `Jenkinsfile` is included to:
- checkout code
- install frontend dependencies
- build/test all Spring services
- build frontend
- build Docker images

## Deployment

### Frontend on Vercel
- Project root: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable:
  - `VITE_API_URL=https://your-gateway-service.onrender.com`

### Backend on Render
Deploy each backend service separately as a Web Service:
- `api-gateway`
- `movie-service`
- `auth-service`
- `user-service`

Suggested Render configuration:

| Service | Root Dir | Build Command | Start Command |
|--------|----------|---------------|---------------|
| api-gateway | `api-gateway` | `mvn package -DskipTests` | `java -jar target/api-gateway-0.0.1-SNAPSHOT.jar` |
| movie-service | `movie-service` | `./mvnw package -DskipTests` | `java -jar target/movie-service-0.0.1-SNAPSHOT.jar` |
| auth-service | `auth-service` | `mvn package -DskipTests` | `java -jar target/auth-service-0.0.1-SNAPSHOT.jar` |
| user-service | `user-service` | `mvn package -DskipTests` | `java -jar target/user-service-0.0.1-SNAPSHOT.jar` |

Required backend environment variables depend on the service, but at minimum configure:
- `CORS_ALLOWED_ORIGINS`
- `JWT_SECRET`
- `MONGODB_URI`
- `TMDB_API_KEY` or `TMDB_READ_ACCESS_KEY`
- `RESEND_API_KEY`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`
- `PAYSTACK_CALLBACK_URL`
- `FRONTEND_URL`
- service-to-service URLs for the gateway

### CORS
Do not use wildcard CORS in production.
Set `CORS_ALLOWED_ORIGINS` to your local frontend URLs and Vercel production domain.

## Validation commands

```bash
cd movie-service && ./mvnw test
cd api-gateway && mvn test
cd auth-service && mvn test
cd user-service && mvn test
cd frontend && npm run build
```
