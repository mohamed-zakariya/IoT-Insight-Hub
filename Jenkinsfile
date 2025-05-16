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
                    docker.build("${DOCKER_REGISTRY}/dxc_backend:latest", "-f DXC_Backend/dockerfile .")
                }
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                script {
                    docker.build("${DOCKER_REGISTRY}/insight-hub-dashboard:latest", "-f insight-hub-dashboard/dockerfile .")
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

        stage('Deploy Containers') {
            steps {
                script {
                    sh '''
                    docker-compose down
                    docker-compose up -d
                    '''
                }
            }
        }
    }
}
