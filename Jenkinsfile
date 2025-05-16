pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "iotinsighthub"
        DOCKER_IMAGE = "iotinsighthub"
        ENV_FILE_CONTENT = credentials('env-file-content') // Jenkins secret with multiline env variables
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

        stage('Write .env file securely') {
            steps {
                script {
                    // Write the .env file from secret without interpolation
                    writeFile file: '.env', text: env.ENV_FILE_CONTENT

                    // Validate presence of important environment variables in the file
                    sh '''
                    echo "Checking .env content for required variables..."
                    grep -E "^(MYSQL_ROOT_PASSWORD|MYSQL_DATABASE|SPRING_MAIL_USERNAME|SPRING_MAIL_PASSWORD)=" .env || echo "Warning: Some required variables are missing in .env"
                    '''
                }
            }
        }

        stage('Deploy Containers with docker-compose') {
            steps {
                script {
                    sh '''
                    docker-compose --env-file .env config || { echo "docker-compose config failed"; exit 1; }
                    docker-compose down
                    docker-compose --env-file .env up -d
                    '''
                }
            }
        }
    }

    post {
        cleanup {
            // Remove .env file after pipeline execution for security
            sh 'rm -f .env'
        }
    }
}
