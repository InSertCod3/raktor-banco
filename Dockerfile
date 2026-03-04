FROM node:20-alpine

WORKDIR /app

# Clerk build args (declared early, before they're needed)
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY

# Dummy DATABASE_URL for Prisma generate (runtime URL injected via Cloud Run secrets)
ENV DATABASE_URL="postgresql://user:pass@localhost:5432/db"

# Copy package files first (better layer caching)
COPY package*.json ./

RUN npm ci --only=production=false

# Copy rest of app
COPY . .

# Generate Prisma client + build
RUN npx prisma generate
RUN npm run build

ENV NODE_ENV=production

# Standalone output setup
RUN cp -r public .next/standalone/ && \
    cp -r .next/static .next/standalone/.next/static

EXPOSE 3000

CMD ["node", ".next/standalone/server.js"]