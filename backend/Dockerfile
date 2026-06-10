FROM node:18-alpine

WORKDIR /app

# Copy package configuration and install dependencies
COPY package*.json ./
RUN npm install

# Copy backend source code
COPY . .

# Expose backend API port
EXPOSE 3001

# Start the backend server
CMD ["npm", "start"]
