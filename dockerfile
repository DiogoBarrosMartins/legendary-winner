# Base image
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Install class-transformer and class-validator
RUN npm install class-transformer class-validator

# Copy application files
COPY . .

# Build the application
RUN npm run build

# Production image
FROM node:18-alpine
WORKDIR /app

# Copy only the necessary files
COPY --from=builder /app/dist ./dist
COPY package*.json ./

# Install production dependencies
RUN npm install --production

# Install class-transformer and class-validator in production image
RUN npm install class-transformer class-validator

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["node", "dist/main.js"]
