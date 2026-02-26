FROM node:20-alpine

WORKDIR /app

# Provide dummy DATABASE_URL for Prisma generate
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# Clerk environment variables (required for build)
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_ZGVzaXJlZC1hbmVtb25lLTg5LmNsZXJrLmFjY291bnRzLmRldiQ
ENV CLERK_SECRET_KEY=sk_test_2tEqtrQS5BazzbGGhVo5e6UyfC3CIugNJvIZNhYtlB

# Copy package files
COPY package*.json ./

# Install deps
RUN npm install

# Copy rest of app
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Production env
ENV NODE_ENV=production

# Standalone output setup
RUN mkdir -p .next/standalone/public .next/standalone/public/_next/static
RUN cp -r public .next/standalone
RUN cp -r .next/static .next/standalone/public/_next

EXPOSE 3000

CMD ["npm", "start"]