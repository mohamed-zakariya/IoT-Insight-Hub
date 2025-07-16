pipeline {
  /* 1) Change 'openshift' to the name of your Kubernetes/OpenShift cloud in Jenkins */
  agent {
    kubernetes {
      cloud 'openshift'
      defaultContainer 'jnlp'
      yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
    - name: docker
      image: docker:24.0.2-dind
      securityContext:
        privileged: true
      volumeMounts:
        - name: docker-sock
          mountPath: /var/run/docker.sock
  volumes:
    - name: docker-sock
      emptyDir: {}
"""
    }
  }

  environment {
    DOCKER_REGISTRY = 'iotinsighthub'
  }

  stages {
    stage('Clone Repository') {
      steps {
        git branch: 'S5_Devops',
            url: 'https://github.com/mohamed-zakariya/IoT-Insight-Hub.git'
      }
    }

    stage('Build Backend Docker Image') {
      steps {
        container('docker') {
          sh '''
            dockerd-entrypoint.sh & sleep 5
            docker build -t ${DOCKER_REGISTRY}/dxc_backend:latest \
                         -f DXC_Backend/Dockerfile DXC_Backend
          '''
        }
      }
    }

    stage('Build Frontend Docker Image') {
      steps {
        container('docker') {
          sh '''
            dockerd-entrypoint.sh & sleep 5
            docker build -t ${DOCKER_REGISTRY}/insight-hub-dashboard:latest \
                         -f insight-hub-dashboard/Dockerfile insight-hub-dashboard
          '''
        }
      }
    }

    stage('Push Docker Images') {
      steps {
        container('docker') {
          withCredentials([usernamePassword(
            credentialsId: 'dockerhub-credentials',
            usernameVariable: 'DOCKERHUB_USER',
            passwordVariable: 'DOCKERHUB_PSW'
          )]) {
            sh '''
              echo $DOCKERHUB_PSW | docker login --username $DOCKERHUB_USER --password-stdin
              docker push ${DOCKER_REGISTRY}/dxc_backend:latest
              docker push ${DOCKER_REGISTRY}/insight-hub-dashboard:latest
            '''
          }
        }
      }
    }

    stage('Write .env File') {
      steps {
        withCredentials([file(
          credentialsId: 'env-file-content',
          variable: 'SECRET_ENV_FILE'
        )]) {
          sh '''
            cp "$SECRET_ENV_FILE" .env
            echo "Environment file prepared. (sanitized view):"
            grep -vE '(PASSWORD|SECRET|KEY|MAIL)' .env || true
          '''
        }
      }
    }

    stage('Deploy with Docker Compose') {
      steps {
        container('docker') {
          sh '''
            dockerd-entrypoint.sh & sleep 5
            docker compose down
            docker compose up -d
          '''
        }
        echo 'Deployment completed successfully.'
      }
    }

    stage('Run Backend Tests') {
      steps {
        container('docker') {
          sh '''
            dockerd-entrypoint.sh & sleep 5
            docker build -t ${DOCKER_REGISTRY}/dxc_backend:test \
                         -f DXC_Backend/dockerfile.test DXC_Backend
            docker run --rm --network iot-hub-network \
                       ${DOCKER_REGISTRY}/dxc_backend:test
          '''
        }
      }
      post {
        success { echo 'Backend tests passed.' }
        failure {
          echo 'Tests failed—see logs.'
          error 'Failing pipeline due to test errors.'
        }
      }
    }
  }

  post {
    cleanup {
      sh '''
        if [ -f .env ]; then
          shred -u .env 2>/dev/null || rm -f .env
        fi
      '''
    }
  }
}

























// pipeline {
//     agent any

//     environment {
//         DOCKER_REGISTRY = "iotinsighthub"
//         DOCKER_IMAGE = "iotinsighthub"
        
//     }

//     stages {
//         stage('Clone Repository') {
//             steps {
//                 git branch: 'S5_Devops', url: 'https://github.com/mohamed-zakariya/IoT-Insight-Hub.git'
//             }
//         }

//         stage('Build Backend Docker Image') {
//             steps {
//                 script {
//                     docker.build("${DOCKER_REGISTRY}/dxc_backend:latest", "-f DXC_Backend/Dockerfile DXC_Backend")
//                 }
//             }
//         }

//         stage('Build Frontend Docker Image') {
//             steps {
//                 script {
//                     docker.build("${DOCKER_REGISTRY}/insight-hub-dashboard:latest", "-f insight-hub-dashboard/Dockerfile insight-hub-dashboard")
//                 }
//             }
//         }

//         stage('Push Docker Images') {
//             steps {
//                 withDockerRegistry(credentialsId: 'dockerhub-credentials', url: '') {
//                     script {
//                         docker.image("${DOCKER_REGISTRY}/dxc_backend:latest").push()
//                         docker.image("${DOCKER_REGISTRY}/insight-hub-dashboard:latest").push()
//                     }
//                 }
//             }
//         }

//         stage('Write .env File') {
//             steps {
//                 withCredentials([file(credentialsId: 'env-file-content', variable: 'SECRET_ENV_FILE')]) {
//                     sh '''
//                         # Copy the secret file to .env
//                         cp "$SECRET_ENV_FILE" .env
//                         # Safe debugging - show non-sensitive info
//                         echo "Environment file prepared. Contents (sanitized):"
//                         grep -vE '(PASSWORD|SECRET|KEY|MAIL)' .env || true
//                     '''
//                 }
//             }
//         }

//         stage('Deploy Containers with docker-compose') {
//             steps {
//         sh '''
//          # Use explicit project name in the command itself
//             docker-compose  down
//            docker-compose up -d
//             '''

//             script {
                   
//                     echo 'Deployment completed successfully.'
//                 }
//             }
//         }

// stage('Run Backend Tests') {
//     steps {
//         script {
//             echo 'Starting backend build and tests.'

//             // Define the image name
//             def imageName = "${DOCKER_REGISTRY}/dxc_backend:test"
            
            
//             echo 'Building Docker test image...'
//             docker.build(imageName, "-f DXC_Backend/dockerfile.test DXC_Backend")
            
           
//             echo 'Running backend tests inside the Docker container...'
//             try {
//                 sh "docker run --rm --network iot-hub-network ${imageName}"
//                 echo 'JUnit tests executed successfully.'
//             } catch (Exception e) {
//                 echo 'Tests failed. Please check the logs for details.'
//                 error("Backend tests failed: ${e.message}")
//             }
//         }
//     }
// }



//     }

//     post {
//         cleanup {
//             sh '''
//                 # Securely remove .env file
//                 if [ -f .env ]; then
//                     shred -u .env 2>/dev/null || rm -f .env
//                 fi
//             '''
//         }
//     }
// }