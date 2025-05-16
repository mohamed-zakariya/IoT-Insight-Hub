pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "iotinsighthub"
        DOCKER_IMAGE = "iotinsighthub"
        
    }

    stages {
        stage('Clone Repository') {
            steps {
                git branch: 'CiCdPipline', url: 'https://github.com/mohamed-zakariya/IoT-Insight-Hub.git'
            }
        }

        stage('Build Backend Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_REGISTRY}/dxc_backend:latest", "-f DXC_Backend/Dockerfile DXC_Backend")
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_REGISTRY}/insight-hub-dashboard:latest", "-f insight-hub-dashboard/Dockerfile insight-hub-dashboard")
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                withDockerRegistry(credentialsId: 'dockerhub-credentials', url: '') {
                    script {
                        docker.image("${DOCKER_REGISTRY}/dxc_backend:latest").push()
                        docker.image("${DOCKER_REGISTRY}/insight-hub-dashboard:latest").push()
                    }
                }
            }
        }

        stage('Write .env File') {
            steps {
                withCredentials([file(credentialsId: 'env-file-content', variable: 'SECRET_ENV_FILE')]) {
                    sh '''
                        # Copy the secret file to .env
                        cp "$SECRET_ENV_FILE" .env
                        # Safe debugging - show non-sensitive info
                        echo "Environment file prepared. Contents (sanitized):"
                        grep -vE '(PASSWORD|SECRET|KEY)' .env || true
                    '''
                }
            }
        }

        stage('Deploy Containers with docker-compose') {
            steps {
                sh '''
                    docker-compose down
                    docker-compose --env-file .env up -d
                '''
            }
        }
    }

    post {
        cleanup {
            sh '''
                # Securely remove .env file
                if [ -f .env ]; then
                    shred -u .env 2>/dev/null || rm -f .env
                fi
            '''
        }
    }
}