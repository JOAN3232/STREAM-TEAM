# Auth Service

Spring Boot authentication service for STREAM.

Default port: `8081`

## Responsibilities

- Register users
- Hash passwords with BCrypt
- Login with JWT
- README.md:47: POST /api/auth/resend-verification
api-gateway/README.md:5: ...never TMDB, VidSrc, MongoDB, Resend, or Paystack.
auth-service/README.md:23: POST /api/auth/resend-verification
- Store users in MongoDB Atlas or local MongoDB

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Create a user and send verification email |
| POST | `/api/auth/login` | Authenticate verified user |
| POST | `/api/auth/verify-email` | Verify by request body token |
| GET | `/api/auth/verify-email?token=...` | Verify by link token |
| POST | `/api/auth/resend-verification` | Send a new verification email |
| GET | `/actuator/health` | Health check |

## Environment variables

| Name | Required | Purpose |
|------|----------|---------|
| `SERVER_PORT` | no | Defaults to `8081` |
| `MONGODB_URI` | yes | MongoDB Atlas or local Mongo URI |
| `JWT_SECRET` | yes | JWT signing secret |
| `JWT_EXPIRATION` | no | Token lifetime in ms |
| `RESEND_API_KEY` | yes for email sending | Resend API key |
| `MAIL_FROM` | yes for email sending | Sender email |
| `FRONTEND_URL` | yes | Used in email verification links |
| `CORS_ALLOWED_ORIGINS` | no | Comma-separated frontend origins |

## Run locally

```bash
cd auth-service
mvn spring-boot:run
```

## Test

```bash
cd auth-service
mvn test
```

## Render deployment

- Service type: Web Service
- Root directory: `auth-service`
- Build command: `mvn package -DskipTests`
- Start command: `java -jar target/auth-service-0.0.1-SNAPSHOT.jar`
- Environment:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `JWT_EXPIRATION`
  - `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
  - `MAIL_FROM`
  - `FRONTEND_URL`
  - `CORS_ALLOWED_ORIGINS`
