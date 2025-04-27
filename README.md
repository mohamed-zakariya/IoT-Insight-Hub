# IoT-Insight-Hub
is a real-time sensor data platform designed to collect, process, and visualize information from environmental and traffic-related sensors. The system provides a centralized dashboard that delivers actionable insights on weather conditions, road congestion, and more, enabling smarter monitoring and decision-making.














































# Backend API - Spring Boot and Java 21

## Overview
This project is a backend API built with Spring Boot using Java 21. It provides endpoints for various functionalities, integrates a Swagger-based API documentation system, and includes a file management system. The backend can be containerized using Docker and orchestrated with Docker Compose to seamlessly integrate with the frontend and database.

## Dependencies
Java 21 Jdk 21.0.7

The project uses Maven for dependency management. Key dependencies include:

- **Spring Boot Starter Web**: For building RESTful web services.
- **Spring Boot Starter Data JPA**: For database interaction.
- **Spring Boot Starter Security**: For securing the API.
- **Springdoc OpenAPI**: For API documentation with Swagger UI.
- **Java 21**: The latest long-term support version of Java.

Ensure Maven is installed on your machine. Verify it by running:
```bash
mvn -v
```

## Project Structure
The project follows a modular structure with the following key components:

### Controllers
- Handle incoming HTTP requests and return appropriate responses.
- Example: `FileController` for file management operations.

### Services
- Contain business logic and interact with repositories.
- Example: `FileService` for processing file operations.

### Repositories
- Interface with the database.
- Example: `FileRepository` for CRUD operations on file data.

### Entities
- Represent database tables as Java objects.
- Example: `FileEntity` for storing file-related metadata.

## Swagger API Documentation
Swagger is integrated for API documentation. Once the backend is running, access the Swagger UI at:
```
http://localhost:8080/swagger-ui.html
```

## How to Run the Backend

### Using Maven
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```
2. Build the project:
   ```bash
   mvn clean install
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### Using Shell Script
A shell script is provided for easier execution. Run:
```bash
./run-backend.sh
```
Ensure the script has executable permissions. If not, make it executable using:
```bash
chmod +x run-backend.sh
```

## Docker Setup

### Building and Running with Docker Compose
You can containerize the backend, frontend, and database using Docker Compose. A `docker-compose.yml` file is provided for this purpose.

1. Build and run all services:
   ```bash
   docker-compose up --build
   ```
2. Alternatively, pull pre-built images from Docker Hub:
   ```bash
   docker-compose up
   ```

**Note**: Update the `docker-compose.yml` file with your Docker Hub repository names where applicable.

### Using the Main Shell Script
A main shell script, `build-and-run.sh`, is provided to:
- Build all Docker images for the backend, frontend, and database.
- Run the entire stack.

To execute:
```bash
./build-and-run.sh
```

Or,pull them seperatly:

````bash
docker pull <docker-repo-name/backend>
docker pull <docker-repo-name/frontend>
docker pull <docker-repo-name/database>
````

Or, pull images directly from Docker Hub:
```bash
./build-and-run.sh --pull
```

## File System Management
The backend includes a file management system with the following components:

### Core Components
- **Controller**: `FileController.java`
    - Handles endpoints like `/upload`, `/download`, and `/delete`.
- **Service**: `FileService.java`
    - Implements logic for file operations such as uploading, retrieving, and deleting files.
- **Model**: `Model.java`
    - Represents file metadata stored in the database.

### Example Endpoints
Here's a more concise and simplified version of the API documentation for your README file:

---

# API Documentation

### **User API**
**Base URL**: `/api/users`

- `GET /api/users`  
  **Description**: Get all users. For testing only.  
  **Response**: List of users.

- `POST /api/users`  
  **Description**: Add a new user (no validation).  
  **Request**: `{"username": "string", "email": "string", "password": "string"}`  
  **Response**: Created user.

- `GET /api/users/{email}`  
  **Description**: Get user by email (for password change).  
  **Response**: User object.

- `POST /api/users/signin/email`  
  **Description**: Sign in with email and password.  
  **Request**: `{"email": "string", "password": "string"}`  
  **Response**: Tokens (access & refresh).

- `POST /api/users/signin/username`  
  **Description**: Sign in with username and password.  
  **Request**: `{"username": "string", "password": "string"}`  
  **Response**: Tokens (access & refresh).

- `POST /api/users/create`  
  **Description**: Register a new user (with validation).  
  **Request**: `{"username": "string", "email": "string", "password": "string"}`  
  **Response**: Created user & tokens.

- `PUT /api/users/{id}`  
  **Description**: Update user profile (with valid JWT).  
  **Header**: `accessToken`  
  **Request**: Updated user details.  
  **Response**: Updated user.

- `PUT /api/users/{id}/password`  
  **Description**: Update password (with valid JWT).  
  **Header**: `accessToken`  
  **Request**: `{"oldPassword": "string", "newPassword": "string"}`  
  **Response**: Password updated.

---

### **Password Reset API**
**Base URL**: `/api/auth`

- `POST /api/auth/forgot-password`  
  **Description**: Send OTP to email for password reset.  
  **Param**: `email`  
  **Response**: OTP sent.

- `POST /api/auth/verify-otp`  
  **Description**: Verify OTP and reset password.  
  **Params**: `email`, `otp`

---

### **Auth API**
**Base URL**: `/auth`

- `POST /auth/generate-access-token`  
  **Description**: Generate an access token.  
  **Param**: `username`

- `POST /auth/generate-refresh-token`  
  **Description**: Generate and save a refresh token.  
  **Param**: `username`

- `POST /auth/validate-access-token`  
  **Description**: Validate the access token.  
  **Param**: `token`

- `POST /auth/validate-refresh-token`  
  **Description**: Validate the refresh token.  
  **Param**: `token`

- `POST /auth/refresh-token`  
  **Description**: Validate refresh token and issue new access token.  
  **Param**: `refreshToken`

---

## Contributing
Contributions are welcome! Submit a pull request or raise an issue for any enhancements or bug fixes.

---








































