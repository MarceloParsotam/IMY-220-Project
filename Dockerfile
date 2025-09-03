# Use official Node.js runtime as base image
FROM node:18-alpine

# Set working directory
WORKDIR /u22491717-Pos7-Project

# Copy package.json and package-lock.json
COPY package*.json ./

# Install ALL dependencies (including dev dependencies like nodemon)
RUN npm install --include=dev

# Copy all application files
COPY . .

# Build the application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]