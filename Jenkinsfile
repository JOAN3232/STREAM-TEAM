pipeline {
    agent any

    options {
        timestamps()
        ansiColor('xterm')
        disableConcurrentBuilds()
    }

    environment {
        KUBE_NAMESPACE = 'stream-team'

    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Frontend Install') {
            steps {
                dir('frontend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Frontend Production Build') {
            steps {
                dir('frontend') {
                    withCredentials([
                        string(credentialsId: 'stream-team-vite-api-gateway-url', variable: 'VITE_API_GATEWAY_URL')
                    ]) {
                        bat 'npm run build'
                    }
                }
            }
        }

        stage('Backend Tests') {
            steps {
                dir('backend/backend') {
                    bat 'mvnw.cmd test'
                }
            }
        }

        stage('Movie Service Tests') {
            steps {
                dir('movie-service') {
                    bat 'mvnw.cmd test'
                }
            }
        }

        stage('API Gateway Tests') {
            steps {
                dir('api-gateway') {
                    bat 'mvn test'
                }
            }
        }

        stage('Docker Compose Build') {
            steps {
                withCredentials([
                    string(credentialsId: 'stream-team-vite-api-gateway-url', variable: 'VITE_API_GATEWAY_URL'),
                    string(credentialsId: 'stream-team-mongodb-uri', variable: 'MONGODB_URI'),
                    string(credentialsId: 'stream-team-tmdb-api-key', variable: 'TMDB_API_KEY'),
                    string(credentialsId: 'stream-team-tmdb-read-access-key', variable: 'TMDB_READ_ACCESS_KEY'),
                    string(credentialsId: 'stream-team-paystack-secret-key', variable: 'PAYSTACK_SECRET_KEY'),
                    string(credentialsId: 'stream-team-paystack-callback-url', variable: 'PAYSTACK_CALLBACK_URL'),
                    string(credentialsId: 'stream-team-mail-username', variable: 'MAIL_USERNAME'),
                    string(credentialsId: 'stream-team-mail-app-password', variable: 'MAIL_APP_PASSWORD'),
                    string(credentialsId: 'stream-team-app-frontend-base-url', variable: 'APP_FRONTEND_BASE_URL'),
                    string(credentialsId: 'stream-team-cors-allowed-origins', variable: 'CORS_ALLOWED_ORIGINS')
                ]) {
                    bat 'docker compose build'
                }
            }
        }

        stage('Docker Image Tag and Push') {
            steps {
                withCredentials([
                    string(credentialsId: 'stream-team-registry-url', variable: 'REGISTRY_URL'),
                    string(credentialsId: 'stream-team-registry-namespace', variable: 'REGISTRY_NAMESPACE'),
                    usernamePassword(credentialsId: 'stream-team-registry-creds', usernameVariable: 'REGISTRY_USERNAME', passwordVariable: 'REGISTRY_PASSWORD')
                ]) {
                    bat 'echo %REGISTRY_PASSWORD% | docker login %REGISTRY_URL% -u %REGISTRY_USERNAME% --password-stdin'
                    bat 'docker tag stream-team-frontend:latest %REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-frontend:%BUILD_NUMBER%'
                    bat 'docker tag stream-team-backend:latest %REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-backend:%BUILD_NUMBER%'
                    bat 'docker tag stream-team-movie-service:latest %REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-movie-service:%BUILD_NUMBER%'
                    bat 'docker tag stream-team-api-gateway:latest %REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-api-gateway:%BUILD_NUMBER%'
                    bat 'docker push %REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-frontend:%BUILD_NUMBER%'
                    bat 'docker push %REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-backend:%BUILD_NUMBER%'
                    bat 'docker push %REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-movie-service:%BUILD_NUMBER%'
                    bat 'docker push %REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-api-gateway:%BUILD_NUMBER%'
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    file(credentialsId: 'stream-team-kubeconfig', variable: 'KUBECONFIG_FILE'),
                    string(credentialsId: 'stream-team-kube-context', variable: 'KUBE_CONTEXT'),
                    string(credentialsId: 'stream-team-registry-url', variable: 'REGISTRY_URL'),
                    string(credentialsId: 'stream-team-registry-namespace', variable: 'REGISTRY_NAMESPACE'),
                    string(credentialsId: 'stream-team-mongodb-uri', variable: 'MONGODB_URI'),
                    string(credentialsId: 'stream-team-tmdb-api-key', variable: 'TMDB_API_KEY'),
                    string(credentialsId: 'stream-team-tmdb-read-access-key', variable: 'TMDB_READ_ACCESS_KEY'),
                    string(credentialsId: 'stream-team-paystack-secret-key', variable: 'PAYSTACK_SECRET_KEY'),
                    string(credentialsId: 'stream-team-paystack-callback-url', variable: 'PAYSTACK_CALLBACK_URL'),
                    string(credentialsId: 'stream-team-mail-username', variable: 'MAIL_USERNAME'),
                    string(credentialsId: 'stream-team-mail-app-password', variable: 'MAIL_APP_PASSWORD')
                ]) {
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% config use-context %KUBE_CONTEXT%'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% apply -f k8s/namespace.yaml'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% apply -f k8s/configmap.yaml'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% create secret generic stream-team-secrets --namespace=%KUBE_NAMESPACE% --from-literal=MONGODB_URI=%MONGODB_URI% --from-literal=TMDB_API_KEY=%TMDB_API_KEY% --from-literal=TMDB_READ_ACCESS_KEY=%TMDB_READ_ACCESS_KEY% --from-literal=PAYSTACK_SECRET_KEY=%PAYSTACK_SECRET_KEY% --from-literal=PAYSTACK_CALLBACK_URL=%PAYSTACK_CALLBACK_URL% --from-literal=MAIL_USERNAME=%MAIL_USERNAME% --from-literal=MAIL_APP_PASSWORD=%MAIL_APP_PASSWORD% --dry-run=client -o yaml | kubectl --kubeconfig=%KUBECONFIG_FILE% apply -f -'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% apply -f k8s/mongodb.yaml'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% apply -f k8s/backend.yaml'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% apply -f k8s/movie-service.yaml'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% apply -f k8s/api-gateway.yaml'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% apply -f k8s/frontend.yaml'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% apply -f k8s/ingress.yaml'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% set image deployment/frontend frontend=%REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-frontend:%BUILD_NUMBER% -n %KUBE_NAMESPACE%'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% set image deployment/backend backend=%REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-backend:%BUILD_NUMBER% -n %KUBE_NAMESPACE%'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% set image deployment/movie-service movie-service=%REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-movie-service:%BUILD_NUMBER% -n %KUBE_NAMESPACE%'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% set image deployment/api-gateway api-gateway=%REGISTRY_URL%/%REGISTRY_NAMESPACE%/stream-team-api-gateway:%BUILD_NUMBER% -n %KUBE_NAMESPACE%'
                }
            }
        }

        stage('Wait for Readiness') {
            steps {
                withCredentials([
                    file(credentialsId: 'stream-team-kubeconfig', variable: 'KUBECONFIG_FILE')
                ]) {
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% rollout status deployment/mongodb -n %KUBE_NAMESPACE% --timeout=180s'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% rollout status deployment/backend -n %KUBE_NAMESPACE% --timeout=300s'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% rollout status deployment/movie-service -n %KUBE_NAMESPACE% --timeout=300s'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% rollout status deployment/api-gateway -n %KUBE_NAMESPACE% --timeout=300s'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% rollout status deployment/frontend -n %KUBE_NAMESPACE% --timeout=300s'
                }
            }
        }

        stage('Post-Deployment Health Check') {
            steps {
                withCredentials([
                    file(credentialsId: 'stream-team-kubeconfig', variable: 'KUBECONFIG_FILE')
                ]) {
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% get pods -n %KUBE_NAMESPACE%'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% get svc -n %KUBE_NAMESPACE%'
                    bat 'kubectl --kubeconfig=%KUBECONFIG_FILE% get ingress -n %KUBE_NAMESPACE%'
                }
            }
        }
    }

    post {
        always {
            script {
                withCredentials([
                    string(credentialsId: 'stream-team-registry-url', variable: 'REGISTRY_URL')
                ]) {
                    bat 'docker logout %REGISTRY_URL%'
                }
            }
        }
        failure {
            echo 'Pipeline failed. Review the failed stage logs for the blocking build, test, Docker, or Kubernetes step.'
        }
        success {
            echo 'STREAM-TEAM CI/CD pipeline completed successfully.'
        }
    }
}
