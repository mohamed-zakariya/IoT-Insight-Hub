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
                        grep -vE '(PASSWORD|SECRET|KEY|MAIL)' .env || true
                    '''
                }
            }
        }

        stage('Deploy Containers with docker-compose') {
            steps {
        sh '''
         # Use explicit project name in the command itself
            docker-compose  down
           docker-compose up -d
            '''

            script {
                   
                    echo 'Deployment completed successfully.'
                }
            }
        }

stage('Run Backend Tests') {
    steps {
        script {
            echo 'Starting backend build and tests.'

            // Define the image name
            def imageName = "${DOCKER_REGISTRY}/dxc_backend:test"
            
            
            echo 'Building Docker test image...'
            docker.build(imageName, "-f DXC_Backend/dockerfile.test DXC_Backend")
            
           
            echo 'Running backend tests inside the Docker container...'
            try {
                sh "docker run --rm --network iot-hub-network ${imageName}"
                echo 'JUnit tests executed successfully.'
            } catch (Exception e) {
                echo 'Tests failed. Please check the logs for details.'
                error("Backend tests failed: ${e.message}")
            }
        }
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