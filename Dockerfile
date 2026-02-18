# Use the official Node.js image as the base
FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run prisma:generate

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
ENV NODE_ENV production
RUN mkdir -p .next/standalone/public .next/standalone/public/_next/static
RUN cp -r public .next/standalone
RUN cp -r .next/static .next/standalone/public/_next
EXPOSE 3000

# Start the application
CMD ["npm", "start"]