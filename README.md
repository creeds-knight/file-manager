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

- **`server.js`**  
  The main entry point to the application. It initializes the app, configures the middleware, and starts the server on a specified port.

- **`/Controllers`**  
  Contains all the API controllers that manage the routes and logic for different resources:
  - **`AppController.js`**: Handles application-level API endpoints.
  - **`AuthController.js`**: Manages user authentication (e.g., login, registration).
  - **`FileController.js`**: Handles file-related operations like uploading, downloading, and managing files.
  - **`UsersController.js`**: Manages user-specific operations like user profile retrieval and deletion.

- **`/Utils`**  
  Utility functions and helper modules:
  - **`db.js`**: Functions for interacting with MongoDB, such as database connections and queries.
  - **`redis.js`**: Functions for interacting with Redis, such as caching and session storage.
  - **`mailer.js`**: Contains functions for sending emails (e.g., account confirmation, notifications).
  - **`getUserId.js`**: Utility to handle user authentication and extract user information from requests.

- **`/routes`**  
  Destructured API endpoints for organizing and routing requests:
  - **`index.js`**: Contains all the defined API routes, which connect controllers with the corresponding paths.

- **`DockerFile`**  
  The Dockerfile defines the instructions for building the Docker image for the application, including dependencies and configuration.

- **`docker-compose.yml`**  
  Configuration file for Docker Compose to define the multi-container setup for the application, including services like the app, database, and cache.

- **`worker.js`**  
  A utility script to handle background tasks such as processing queues or performing asynchronous operations.

---

This structure ensures that the code is modular, scalable, and easy to maintain. Each component is logically separated into specific folders, making it easy to navigate and extend the application.

    


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

### **APPLICATION STATUS**

#### `GET /status`
- **Summary**: Check the server status.
- **Tags**: App
- **Response**:
  - `200 OK`: 
  ```json 
  {"redis":true,
  "db":true
  }

#### `GET /stats`
- **Summary**: Get application statistics.
- **Tags**: App
- **Response**:
  - `200 OK`: 
  ```json
  {
    "users":4,
    "files":30
    }


###  **User Endpoints**

### `POST /users`
- **Summary**: Create a new user.
- **Tags**: Users
- **Request Body**:
    ```json
    {
        "email": "string",
        "password": "string"
    }

- **Response**:
    `200: OK`: Returns user details

### `GET /connect`
- **Summary**: Generates a token for user to login.
- **Tags**: Users
- **Request body**:  
    ```json 
        {
            "email": "string",
            "password": "string"
        }
- **Response**:
    `200: OK`:
    ```json
    {
        "token":"uuid-string"
    }

### `GET /disconnect`
- **Summary**: Logout the user.
- **Tags**: Users
- **Request body**:  
    ```json 
        {
            "email": "string",
            "password": "string"
        }
- **Response**:
    `200: OK`:

### `GET /users/me`
- **Summary**: Retrieves user Information.
- **Tags**: Users
- **Request header**:  
    ```json 
        {
            "x-token": "string",
        }
- **Response**:
    `200: OK`:
    ```json
    {
        "id":"string",
        "email":"string"
    }

### `GET /files`
- **Summary**: Upload a file.
- **Tags**: Files
- **Request header**:  
    ```json 
        {
            "x-token": "string",
        }
- **Request body**:
    ```json
    {
        "name": "string", 
        "type": ["file","folder","image"], /* Can be one of this*/
        "data": "SGVsbG8gV2Vic3RhY2shCg==",
        "parentId": "Interger",
        "isPublic": "boolean",
    }
- **Response**:
    `200:OK`:
    ```json
    {
        "id":"string",
        "userId":"String",
        "name":"String",
        "type":"String",
        "isPublic": "boolean",
        "parentId": "integer"
    }


## LICENSE
This markdown format cleanly organizes the API endpoints and responses, making it easy to read and reference for your project's documentation.