#  🚀 IoT-Insight-Hub
is a real-time sensor data platform designed to collect, process, and visualize information from environmental and traffic-related sensors. The system provides a centralized dashboard that delivers actionable insights on weather conditions, road congestion, and more, enabling smarter monitoring and decision-making.

---

## 📁 Project Structure


---

## 🌐 Frontend Setup (Angular)

You can run the frontend in **two ways**:

### 🔧 Option 1: Manual Setup (Local Environment)

> Recommended for development

1. **Install [Node.js](https://nodejs.org/) (v18.x or later)**
2. **Install Angular CLI globally**
   ```bash
   npm install -g @angular/cli
   cd frontend
   npm install
   ng serve
   ```
Visit the app in your browser at http://localhost:4200

### 🐳 Option 2: Using Docker
> Recommended for deployment or isolated testing environments

#### ✅ Prerequisites
Make sure Docker is installed on your system:
🔗 [Install Docker](https://docs.docker.com/engine/install/)

#### 🛠️ Build the Docker Image
Open your terminal and navigate to the project root directory, then run:

  ```bash
  docker build -t iot-frontend ./frontend
  ```
#### ▶️ Run the Docker Container
Once the image is built, run the container using:
  ```bash
  docker run -p 4200:80 iot-frontend
  ```
* This maps port 80 inside the container to port 4200 on your local machine.

#### 🌐 Access the App
Visit the application in your browser:
  👉 http://localhost:4200

---

## ⚙️ Backend Setup (Sprint Boot)
> Backend setup instructions coming soon...

