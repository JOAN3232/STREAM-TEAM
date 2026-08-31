# User Service

Spring Boot user library and billing service for STREAM.

Default port: `8083`

## Responsibilities

- Current user profile lookup
- Watchlist
- Watch history
- Subscriptions
- Paystack TEST payment initialization and verification

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users/me` | Current authenticated user |
| GET | `/api/watchlist` | Get watchlist |
| POST | `/api/watchlist/{movieId}` | Add a movie to watchlist |
| DELETE | `/api/watchlist/{movieId}` | Remove a movie from watchlist |
| GET | `/api/history` | Get watch history |
| POST | `/api/history` | Save watch progress |
| GET | `/api/subscriptions/me` | Get current subscription |
| POST | `/api/subscriptions` | Select a plan |
| POST | `/api/payments/initialize` | Start Paystack TEST checkout |
| GET | `/api/payments/verify/{reference}` | Verify Paystack payment |
| GET | `/actuator/health` | Health check |

## Environment variables

| Name | Required | Purpose |
|------|----------|---------|
| `SERVER_PORT` | no | Defaults to `8083` |
| `MONGODB_URI` | yes | MongoDB Atlas or local Mongo URI |
| `JWT_SECRET` | yes | Must match auth-service JWT secret |
| `PAYSTACK_SECRET_KEY` | yes for payment flow | Paystack test secret key |
| `PAYSTACK_PUBLIC_KEY` | no | Exposed by backend response when needed |
| `PAYSTACK_BASE_URL` | no | Defaults to `https://api.paystack.co` |
| `PAYSTACK_CALLBACK_URL` | yes | Frontend callback URL after checkout |
| `CORS_ALLOWED_ORIGINS` | no | Comma-separated frontend origins |

## Run locally

```bash
cd user-service
mvn spring-boot:run
```

## Test

```bash
cd user-service
mvn test
```

## Render deployment

- Service type: Web Service
- Root directory: `user-service`
- Build command: `mvn package -DskipTests`
- Start command: `java -jar target/user-service-0.0.1-SNAPSHOT.jar`
- Environment:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `PAYSTACK_SECRET_KEY`
  - `PAYSTACK_PUBLIC_KEY`
  - `PAYSTACK_BASE_URL`
  - `PAYSTACK_CALLBACK_URL`
  - `CORS_ALLOWED_ORIGINS`
