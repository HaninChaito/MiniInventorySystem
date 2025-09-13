# ---- Base Stage ----
# Use an official Node.js runtime as a parent image.
# We choose a specific version for consistency. 'alpine' is a lightweight version.
FROM node:20-alpine AS base

# Set the working directory inside the container
WORKDIR /usr/src/app


# ---- Dependencies Stage ----
# This stage is only for installing dependencies
FROM base AS dependencies

# Copy package.json and package-lock.json first
# This takes advantage of Docker's layer caching. As long as these files don't change,
# Docker won't re-run 'npm install', making builds much faster.
COPY package*.json ./
RUN npm install


# ---- Build Stage ----
# This stage is for building our NestJS application
FROM dependencies AS build

# Copy all the source code into the container
COPY . .

# Copy the installed node_modules from the 'dependencies' stage
COPY --from=dependencies /usr/src/app/node_modules ./node_modules

# Run Prisma Generate, this is a critical step
RUN npx prisma generate

# Build the NestJS application
RUN npm run build


# ---- Production Stage ----
# This is the final, lean image that we will actually run.
FROM base AS production

# Copy only the necessary files from the previous stages
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# The command that will be run when a container starts from this image
CMD ["node", "dist/main"]