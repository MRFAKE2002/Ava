# Use node 18 Alpine image
FROM node:18-alpine

# Labels
LABEL maintainer="علی"
LABEL description="React + TypeScript + Vite App"

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the app
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Run Vite dev server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
