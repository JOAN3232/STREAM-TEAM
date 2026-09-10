# STREAM-TEAM DevOps Deployment Guide

This repository contains the STREAM-TEAM application with the existing architecture preserved:

- React/Vite frontend
- Spring Boot backend
- Spring Boot movie-service
- Spring Cloud API Gateway
- MongoDB
- Docker / Docker Compose
- Jenkins pipeline
- Kubernetes manifests

## Architecture

```text
Browser
  -> Frontend
  -> API Gateway
     -> Backend
     -> Movie Service
  -> MongoDB
```

- The frontend is built as a production static site and served with nginx.
- The API Gateway routes `/api/auth/**`, `/api/payments/**`, `/api/profiles/**`, and `/api/movies/**`.
- MongoDB remains the persistent data store.
- TMDB access stays on the backend/movie-service side.

## Docker Compose

From the repository root:

```sh
docker compose config
docker compose build
docker compose up -d
docker compose ps
docker compose logs -f
docker compose down
```

Frontend will be exposed on `http://localhost:5173` and the gateway on `http://localhost:8084`.

## Jenkins Pipeline

A root-level `Jenkinsfile` is included for:

1. checkout
2. frontend install
3. frontend production build
4. backend tests
5. movie-service tests
6. API gateway tests
7. Docker Compose image build
8. registry push
9. Kubernetes deployment
10. rollout wait and health checks

The pipeline is designed to fail when any required build, test, Docker, or deployment step fails.

## Kubernetes Deployment

All Kubernetes manifests are in `k8s/`:

- `namespace.yaml`
- `configmap.yaml`
- `secret.example.yaml`
- `mongodb.yaml`
- `backend.yaml`
- `movie-service.yaml`
- `api-gateway.yaml`
- `frontend.yaml`
- `ingress.yaml`

Apply manually with:

```sh
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mongodb.yaml
kubectl apply -f k8s/backend.yaml
kubectl apply -f k8s/movie-service.yaml
kubectl apply -f k8s/api-gateway.yaml
kubectl apply -f k8s/frontend.yaml
kubectl apply -f k8s/ingress.yaml
```

Create secrets separately from real values:

```sh
kubectl create secret generic stream-team-secrets \
  --namespace stream-team \
  --from-literal=MONGODB_URI=... \
  --from-literal=TMDB_API_KEY=... \
  --from-literal=TMDB_READ_ACCESS_KEY=... \
  --from-literal=PAYSTACK_SECRET_KEY=... \
  --from-literal=PAYSTACK_CALLBACK_URL=... \
  --from-literal=MAIL_USERNAME=... \
  --from-literal=MAIL_APP_PASSWORD=...
```

Check status with:

```sh
kubectl get pods -n stream-team
kubectl get svc -n stream-team
kubectl get ingress -n stream-team
kubectl rollout status deployment/backend -n stream-team
kubectl rollout status deployment/movie-service -n stream-team
kubectl rollout status deployment/api-gateway -n stream-team
kubectl rollout status deployment/frontend -n stream-team
```

## Required Environment Variables / Secrets

### Application / Docker / Kubernetes

- `MONGODB_URI`
- `TMDB_API_KEY`
- `TMDB_READ_ACCESS_KEY`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_BASE_URL`
- `PAYSTACK_CALLBACK_URL`
- `MAIL_USERNAME`
- `MAIL_APP_PASSWORD`
- `MAIL_HOST`
- `MAIL_PORT`
- `APP_FRONTEND_BASE_URL`
- `CORS_ALLOWED_ORIGINS`
- `TMDB_BASE_URL`
- `TMDB_IMAGE_BASE_URL`
- `VIDSRC_BASE_URL`
- `VITE_API_GATEWAY_URL`
- `MOVIE_SERVICE_URL`
- `AUTH_SERVICE_URL`
- `USER_SERVICE_URL`

### Jenkins Credentials / Variables

- `stream-team-registry-url`
- `stream-team-registry-namespace`
- `stream-team-registry-creds`
- `stream-team-kubeconfig`
- `stream-team-kube-context`
- `stream-team-vite-api-gateway-url`
- `stream-team-mongodb-uri`
- `stream-team-tmdb-api-key`
- `stream-team-tmdb-read-access-key`
- `stream-team-paystack-secret-key`
- `stream-team-paystack-callback-url`
- `stream-team-mail-username`
- `stream-team-mail-app-password`
- `stream-team-app-frontend-base-url`
- `stream-team-cors-allowed-origins`

## Notes

- No real secrets are committed in Git.
- Kubernetes image names default to local tags in the manifests; Jenkins updates them to pushed registry tags during deployment.
- The nginx ingress host in `k8s/ingress.yaml` should be replaced with your real production domain.
- If your cluster does not use nginx ingress, adapt `ingressClassName` or omit the ingress manifest.
