pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "iotinsighthub"
        DOCKER_IMAGE = "iotinsighthub"
        ENV_FILE_CONTENT = credentials('env-file-content')  // Multiline secret with env vars per line
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
                script {
                    // Write multiline .env file from Jenkins secret
                    writeFile file: '.env', text: env.ENV_FILE_CONTENT

                    // Optional: print to verify (remove this in production!)
                    sh 'cat .env'
                }
            }
        }
        stage('Debug .env File') {
                 steps {
                      sh 'cat -A .env'  // shows special characters including newlines as ^M or $ for line ends
             }
        }

        

        stage('Validate .env Variables') {
            steps {
                script {
                    echo "Checking .env content for required variables..."
                    sh "grep -E '^(MYSQL_ROOT_PASSWORD|MYSQL_DATABASE|SPRING_MAIL_USERNAME|SPRING_MAIL_PASSWORD)=' .env"
                }
            }
        }

        stage('Deploy Containers with docker-compose') {
            steps {
                script {
                    sh '''
                    docker-compose down
                    docker-compose --env-file .env up -d
                    '''
                }
            }
        }
    }

    post {
        cleanup {
            // Remove .env file after deployment to keep secrets safe
            // sh 'rm -f .env'
            
        }
    }
}
