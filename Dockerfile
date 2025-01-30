# Stage 1: Build the application
FROM node:20.18-bullseye AS builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build arguments
ARG NEXT_PUBLIC_SERVER_ENDPOINT

# Environment variable
ENV NEXT_PUBLIC_SERVER_ENDPOINT=${NEXT_PUBLIC_SERVER_ENDPOINT}

# Build the Next.js application
RUN npm run build

# Stage 2: Run the application
FROM node:20.18-bullseye-slim AS runner

# Set environment variables
ENV NODE_ENV=production

# Set the working directory
WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Install only production dependencies
RUN npm install --production

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]