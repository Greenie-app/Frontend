# syntax = docker/dockerfile:1

# Adjust NODE_VERSION as desired
ARG NODE_VERSION=25
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="NodeJS"

# NodeJS app lives here
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
RUN npm install -g --force corepack && corepack enable yarn


# Throw-away build stage to reduce size of final image
FROM base as build

# Install packages needed to build node modules
RUN apt-get update -qq && \
    apt-get install -y python-is-python3 pkg-config build-essential 

# Install node modules
COPY --link package.json yarn.lock .
RUN yarn install --immutable

# Copy application code
COPY --link . .

# Build application
RUN yarn run build

# Remove development dependencies
RUN yarn workspaces focus --production


# Final stage for app image
FROM nginx

COPY .docker/nginx.conf /etc/nginx/nginx.conf
COPY .docker/default.conf /etc/nginx/conf.d/default.conf

# Copy built application
COPY --from=build /app/dist /usr/share/nginx/html

# Start the server by default, this can be overwritten at runtime
EXPOSE 8080
CMD [ "/usr/sbin/nginx", "-g", "daemon off;" ]
