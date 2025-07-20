FROM node:18-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Build the application for production
RUN npm run build

# Use PORT environment variable from hosting platform, fallback to 5000
EXPOSE ${PORT:-5000}

# Start the application
CMD ["npm", "start"]
