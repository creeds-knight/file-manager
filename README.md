# File Manager Project

A file management application built with **Node.js**, **Express.js**, **MongoDB**, **Redis**, and **Docker**. This project allows users to upload, manage, and serve files while supporting background tasks like generating image thumbnails.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Docker Usage](#docker-usage)
- [API Documentation](#api-documentation)
- [License](#license)

---

## Project Overview

The **File Manager** application provides an API to handle file uploads, file retrieval, user authentication, and more. It uses **MongoDB** for file storage and **Redis** for caching and session management. The entire project is containerized using **Docker**.

---

## Features

- **User Authentication**: Allows users to sign up, log in, and authenticate using JWT tokens.
- **File Upload & Management**: Users can upload files, create folders, and organize files hierarchically.
- **Image Thumbnail Generation**: Background jobs (using Bull) generate thumbnails for image files.
- **Public & Private Files**: Users can make files either public or private.
- **Dockerized**: The project is fully containerized with Docker for easy deployment.

---

## Technologies Used

- **Node.js**: Backend server and API.
- **Express.js**: Web framework for building the REST API.
- **MongoDB**: NoSQL database for file storage.
- **Redis**: Caching and session storage.
- **Docker**: For containerization.
- **Bull**: Queue system for background jobs (e.g., image thumbnail generation).
- **JWT**: For user authentication and session management.

---

## Getting Started

### Prerequisites

- **Docker**: Ensure Docker is installed. You can download Docker from [here](https://www.docker.com/get-started).
- **Node.js**: If running outside of Docker, install Node.js from [here](https://nodejs.org/).

### Installing

1. Clone the repository:

    ```bash
    git clone https://github.com/your-username/file-manager.git
    cd file-manager
    ```

2. Build and start the Docker containers:

    ```bash
    docker-compose up --build
    ```

    This will start the app, MongoDB, Redis, and the worker service.

3. Once the services are running, you can access the app at `http://localhost:3000`.

---

## Project Structure

/file-manager ├── /src │ ├── /Controllers # API controllers for handling routes │ ├── /Models # MongoDB models (if applicable) │ ├── /Utils # Utility functions and helpers │ ├── app.js # Express app configuration │ └── server.js # Server entry point ├── /config # Docker and app configuration files ├── Dockerfile # Dockerfile for building the app container ├── docker-compose.yml # Docker Compose configuration ├── .env # Environment variables (not in version control) ├── package.json # Node.js dependencies and scripts └── README.md


## Environment Variables

The application uses the following environment variables, which should be set in a `.env` file:

- **DB_HOST**: MongoDB host (default: `mongodb`)
- **DB_PORT**: MongoDB port (default: `27017`)
- **DB_DATABASE**: MongoDB database name (default: `files_manager`)
- **REDIS_HOST**: Redis host (default: `redis`)
- **REDIS_PORT**: Redis port (default: `6379`)
- **APP_PORT**: Application port (default: `3000`)

---

## Docker Usage

1. **Building the App**:

    ```bash
    docker-compose build
    ```

2. **Running the Containers**:

    ```bash
    docker-compose up
    ```

3. **Stopping the Containers**:

    ```bash
    docker-compose down
    ```

4. **Accessing Services**: After starting the containers, you can access the app at:

    - App: `http://localhost:3000`
    - MongoDB: `mongodb://localhost:27017`
    - Redis: `localhost:6380`

---

## API Documentation

### **Authentication & User Management**

#### `POST /auth/new`
- **Description**: Register a new user.
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securePassword"
  }```

- **Response**:
    - 201: Created: User successfully created
    - 400 Bad Request: Missing email or password, or user already exists

