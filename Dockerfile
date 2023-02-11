FROM node:19-alpine

RUN npm install -g pnpm

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

# Install all dependencies for the build step
RUN pnpm install  --frozen-lockfile

# Copy all files
COPY . .

# Initialize Sveltekit
RUN pnpm svelte-kit sync

# Generate Prisma Client
RUN pnpm prisma generate

# Run migrations
RUN pnpm prisma migrate dev

# Build the app
RUN pnpm run build

# Install only production dependencies
RUN pnpm install --prod --frozen-lockfile

# Expose the port the app runs in
EXPOSE 7869

# Serve the app
CMD [ "node", "build/index.js" ]
