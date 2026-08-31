pipeline {
  agent any

  tools {
    jdk 'jdk21'
    maven 'maven3'
    nodejs 'node20'
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
          sh 'npm install'
        }
      }
    }

    stage('Build and Test Services') {
      parallel {
        stage('Movie Service') {
          steps {
            dir('movie-service') {
              sh './mvnw test package -DskipTests=false'
            }
          }
        }
        stage('API Gateway') {
          steps {
            dir('api-gateway') {
              sh 'mvn test package -DskipTests=false'
            }
          }
        }
        stage('Auth Service') {
          steps {
            dir('auth-service') {
              sh 'mvn test package -DskipTests=false'
            }
          }
        }
        stage('User Service') {
          steps {
            dir('user-service') {
              sh 'mvn test package -DskipTests=false'
            }
          }
        }
      }
    }

    stage('Build Frontend') {
      steps {
        dir('frontend') {
          sh 'npm run build'
        }
      }
    }

    stage('Build Docker Images') {
      steps {
        sh 'docker build -t streamteam-api-gateway ./api-gateway'
        sh 'docker build -t streamteam-auth-service ./auth-service'
        sh 'docker build -t streamteam-movie-service ./movie-service'
        sh 'docker build -t streamteam-user-service ./user-service'
      }
    }
  }
}
