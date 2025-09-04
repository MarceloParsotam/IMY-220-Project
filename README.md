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

## 🚀 Running the Project with Docker

This project is fully containerized with **Docker**. Follow the steps below to build and run it.

### 1. Prerequisites
Make sure you have:
- [Docker](https://docs.docker.com/get-docker/) installed  
- (Optional) [Docker Compose](https://docs.docker.com/compose/) if you want to extend into multi-container setups  

👉 You do **not** need Node.js installed on your host machine — everything runs inside Docker.

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
