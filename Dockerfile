FROM node:18-alpine

WORKDIR /app

# Copy package configuration and install dependencies
COPY package*.json ./
RUN npm install

# Copy frontend source code
COPY . .

# Expose Vite development port
EXPOSE 5173

# Run Vite with host exposure so it is accessible outside the container
CMD ["npm", "run", "dev", "--", "--host"]
