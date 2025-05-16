pipeline {
    agent any

    environment {
        DOCKER_REGISTRY = "iotinsighthub"
        DOCKER_IMAGE = "iotinsighthub"
        ENV_FILE_CONTENT = credentials('env-file-content') // Use the stored Jenkins secret
        
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

stages {
    stage('Debug and Write .env') {
      steps {
        script {
          // Print the secret content (WARNING: This exposes secrets in logs, only do in secure environment)
          echo "ENV_FILE_CONTENT (raw):"
          echo "${env.ENV_FILE_CONTENT}"

          // Write .env file with the content from the credential
          writeFile file: '.env', text: env.ENV_FILE_CONTENT

          // Print the .env file content after writing
          sh 'cat .env'
        }
      }
    }
  }


        stage('Deploy Containers') {
            steps {
                script {
                    writeFile file: '.env', text: "${ENV_FILE_CONTENT}"
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
            // Ensure the .env file is removed after the pipeline execution
            sh 'rm -f .env'
        }
    }
}
