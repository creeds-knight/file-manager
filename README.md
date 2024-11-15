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

/file-manager
    ├──server.js # Main Entry Point to the application
    ├── /Controllers 
        ├──AppController.js # Implementation of Application Management API's
        ├──AuthController.js # Implementation of Authentication endpoints
        ├──FileController.js # Implementation of File Endpoints
        ├──UsersController.js # Implementation of User Endpoints
    ├── /Utils 
        ├──db.js # Contains functions for running mongodb
        ├──redis.js #Contains functions for running redis
        ├──mailer.js # Contains functions for sending an email
        ├──getUserId.js # Contains functions to process User authentication and retrieval
    ├──routes
        ├──index.js # Destructed API endpoints.
    ├──DockerFile # Docker utility file 
    ├──docker-compose.yml # Utility for Containerization of application
    ├──worker.js # Utitlity to start background processing


    


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