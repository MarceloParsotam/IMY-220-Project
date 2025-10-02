# IMY 220 Project - View Doc

## GitHub Repository
https://github.com/MarceloParsotam/IMY-220-Project/tree/master

## Docker Commands

### Build the Docker Image
docker build -t viewdoc-app .

### Run the Docker Container
docker run -p 3000:3000 viewdoc-app

### View Running Containers
docker ps

### View Container Logs
docker logs f042730fdeb785a3a736cae6a257c46ac882834618a6b9b1e295a1007ec1e04d

### Stop Container
docker stop f042730fdeb785a3a736cae6a257c46ac882834618a6b9b1e295a1007ec1e04d

### Remove Container
docker rm f042730fdeb785a3a736cae6a257c46ac882834618a6b9b1e295a1007ec1e04d

### Remove Image
docker rmi viewdoc-app

## Dockerfile Content
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --include=dev
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]

## Project Structure
- /frontend - React application
- /backend - Express.js API server
- /uploads - File storage directory
- Dockerfile - Container configuration

## MongoDB Atlas Connection
If using MongoDB Atlas, update your connection string in the environment variables:
MONGODB_URI = "mongodb+srv://test-user:test-password@imy220.44tnuyp.mongodb.net/ViewDocDB?retryWrites=true&w=majority&appName=IMY220";

## Application Access
After starting the container, access the application at:
http://localhost:3000

## Development Commands
npm run dev - Start development server
npm run build - Build for production
npm start - Start production server