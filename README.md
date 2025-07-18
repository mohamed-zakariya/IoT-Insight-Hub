# 🚀 IoT-Insight-Hub

A real-time sensor data platform designed to collect, process, and visualize information from environmental and traffic-related sensors. The system provides a centralized dashboard that delivers actionable insights on weather conditions, road congestion, and more, enabling smarter monitoring and decision-making.

## 📋 Prerequisites

Before starting, ensure you have the following installed on your system:

- **Docker** 🐳 [Install Docker](https://docs.docker.com/engine/install/)
- **Node.js** (v18.x or later) 🔗 [Install Node.js](https://nodejs.org/)
- **Java 21 JDK** (JDK 21.0.7) ☕ [Install Java 21](https://openjdk.org/projects/jdk/21/)
- **Maven** 📦 [Install Maven](https://maven.apache.org/install.html)

Verify your installations:
```bash
docker --version
node --version
java --version
mvn --version
```
---

## SonarQube & Performance Testing Sprint Requirements

📁 [DXC_Sprint5_Documentation.pdf](https://github.com/user-attachments/files/21316191/DXC_Sprint5.pdf)

---

## 📁 Project Structure

```
iot-insight-hub/
├── insight-hub-dashboard/               # Angular application
│   ├── src/
│   ├── Dockerfile
│   └── package.json
├── DXC_Backend/               # Spring Boot application
│   ├── src/
│   ├── Dockerfile
│   └── pom.xml
├── Database/               # Database
│   ├── Dockerfile
├── docker-compose.yml     # Docker Compose configuration
├── build-and-run.sh      # Main setup script
└── README.md
```

---

## 🚀 Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/mohamed-zakariya/IoT-Insight-Hub.git
   cd iot-insight-hub
   ```

2. **Start with Docker Compose:**
   ```bash
   docker-compose up --build
   ```

3. **Access the application:**
   - Frontend: http://localhost:4200
   - Backend API: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html

---



## 🗄️ Database Setup (MySQL)

### Using Docker

1. **Build MySQL Docker image:**
   ```bash
   docker build -t custom-mysql:8.3 ./Database
   ```

2. **Run MySQL container:**
   ```bash
   docker run -d --name iot_mysql --platform linux/amd64 -e MYSQL_ROOT_PASSWORD=GmNgl69ZW9 -e MYSQL_DATABASE=sql8774445 -p 3306:3306 -v mysql_data:/var/lib/mysql custom-mysql:8.3
   ```

3. **Verify MySQL is running:**
   ```bash
   docker ps
   docker logs iot_mysql
   ```

---


## ⚙️ Backend Setup (Spring Boot)

### Option 1: Manual Setup (Development)

1. **Navigate to backend directory:**
   ```bash
   cd DXC_Backend
   ```

2. **Build and run:**
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```

3. **Access Swagger API Documentation:**
   ```
   http://localhost:8080/swagger-ui.html
   ```

### Option 2: Using Docker

1. **Build backend Docker image:**
   ```bash
   docker build -t iot-backend ./DXC_Backend
   ```

2. **Run backend container:**
   ```bash
   docker run -p 8080:8080 --name iot-backend iot-backend
   ```

---

## 🌐 Frontend Setup (Angular)

### Option 1: Manual Setup (Development)

1. **Install Angular CLI globally:**
   ```bash
   npm install -g @angular/cli
   ```

2. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start development server:**
   ```bash
   ng serve
   ```

5. **Access the application:**
   ```
   http://localhost:4200
   ```

### Option 2: Using Docker

1. **Build frontend Docker image:**
   ```bash
   docker build -t iot-frontend ./frontend
   ```

2. **Run frontend container:**
   ```bash
   docker run -p 4200:80 --name iot-frontend iot-frontend
   ```

3. **Access the application:**
   ```
   http://localhost:4200
   ```

---

## 📄 License

This project is licensed under the MIT License.
