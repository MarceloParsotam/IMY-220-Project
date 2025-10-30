# IMY-220-Project

<p align="center">
  <img src="public/assets/logo.png" alt="Logo" width="400"/>
</p>

---

## Introduction

Welcome to my Version Control Website where all you can do is Go On Documents

---

## Who Am I

I am Marcelo Parsotam, student number u22491717

This is my project for my IMY 220 Module

---

## Running the Project with Docker D1

This project is fully containerized with **Docker**. Follow the steps below to build and run it.

### 1. Prerequisites
Make sure you have:
- [Docker](https://docs.docker.com/get-docker/) installed  
- (Optional) [Docker Compose](https://docs.docker.com/compose/) if you want to extend into multi-container setups  

You do **not** need Node.js installed on your host machine — everything runs inside Docker.

---

### 2. Build the Docker Image
In the root of the project (where the `Dockerfile` is located), run:

```bash
docker build -t imy220-project .
```
### 3. Running Docker Image
In the same location as where you built the project, run:

```bash
docker run -p 3000:3000 imy220-project
```
## Running the Project with Docker D2

# IMY 220 Project - View Doc

## GitHub Repository
https://github.com/MarceloParsotam/IMY-220-Project/tree/master

## Docker Commands

### Build the Docker Image
```bash
docker build -t viewdoc-app .
```
### Run the Docker Container
```bash
docker run -p 3000:3000 viewdoc-app
```
### View Running Containers
docker ps

## Dockerfile Content
```bash
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Project Structure
- /frontend - React application
- /backend - Express.js API server
- /uploads - File storage directory
- Dockerfile - Container configuration

## MongoDB Atlas Connection
If using MongoDB Atlas, update your connection string in the environment variables:
```bash
MONGODB_URI = "mongodb+srv://test-user:test-password@imy220.44tnuyp.mongodb.net/ViewDocDB?retryWrites=true&w=majority&appName=IMY220";
```
## Application Access
After starting the container, access the application at:
```bash
http://localhost:3000
```

## Development Commands
```npm run dev``` - Start development server
```npm run build``` - Build for production
```npm start``` - Start production server

## Running the Project with Docker D2

# IMY 220 Project - View Doc

## GitHub Repository
https://github.com/MarceloParsotam/IMY-220-Project/tree/master

## Docker Commands

#### 1. Build the Docker Image

```bash
docker build -t viewdoc-app .
```

#### 2. Run the Docker Container

```bash
docker run -p 3000:3000 viewdoc-app
```

### View Running Containers
```bash
docker ps
```

## Dockerfile Content

```bash
FROM node:20-alpine
WORKDIR /u22491717-Pos7-Project-D3
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```
## Project Structure
- /frontend - React application
- /backend - Express.js API server
- /uploads - File storage directory
- Dockerfile - Container configuration

## MongoDB Atlas Connection
If using MongoDB Atlas, update your connection string in the environment variables:
```bash
MONGODB_URI = "mongodb+srv://test-user:test-password@imy220.44tnuyp.mongodb.net/ViewDocDB?retryWrites=true&w=majority&appName=IMY220";
```
## Application Access
After starting the container, access the application at:
```bash
http://localhost:3000
```

## Development Commands
```npm run dev``` - Start development server
```npm run build``` - Build for production
```npm start``` - Start production server

