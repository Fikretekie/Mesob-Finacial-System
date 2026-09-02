# syntax=docker/dockerfile:1

# ---------------------------------------------------------------------------
# Stage 1: Build the React app
# ---------------------------------------------------------------------------
FROM node:20-alpine AS build

WORKDIR /app

# CRA bakes REACT_APP_* vars into the JS bundle at build time, so they must
# be passed as build args (docker build --build-arg REACT_APP_ENV=production ...)
# or via the "args:" block in docker-compose.yml — setting them at `docker run`
# time has no effect once the image is built.
ARG REACT_APP_ENV=production
ARG REACT_APP_STAGING_APP_URL
ARG REACT_APP_PRODUCTION_APP_URL
ARG REACT_APP_STAGING_GOOGLE_CLIENT_ID
ARG REACT_APP_STAGING_APPLE_CLIENT_ID
ARG REACT_APP_PRODUCTION_COGNITO_USER_POOL_ID
ARG REACT_APP_PRODUCTION_COGNITO_CLIENT_ID
ARG REACT_APP_PRODUCTION_COGNITO_DOMAIN
ARG REACT_APP_PRODUCTION_GOOGLE_CLIENT_ID
ARG REACT_APP_PRODUCTION_APPLE_CLIENT_ID

ENV REACT_APP_ENV=$REACT_APP_ENV \
    REACT_APP_STAGING_APP_URL=$REACT_APP_STAGING_APP_URL \
    REACT_APP_PRODUCTION_APP_URL=$REACT_APP_PRODUCTION_APP_URL \
    REACT_APP_STAGING_GOOGLE_CLIENT_ID=$REACT_APP_STAGING_GOOGLE_CLIENT_ID \
    REACT_APP_STAGING_APPLE_CLIENT_ID=$REACT_APP_STAGING_APPLE_CLIENT_ID \
    REACT_APP_PRODUCTION_COGNITO_USER_POOL_ID=$REACT_APP_PRODUCTION_COGNITO_USER_POOL_ID \
    REACT_APP_PRODUCTION_COGNITO_CLIENT_ID=$REACT_APP_PRODUCTION_COGNITO_CLIENT_ID \
    REACT_APP_PRODUCTION_COGNITO_DOMAIN=$REACT_APP_PRODUCTION_COGNITO_DOMAIN \
    REACT_APP_PRODUCTION_GOOGLE_CLIENT_ID=$REACT_APP_PRODUCTION_GOOGLE_CLIENT_ID \
    REACT_APP_PRODUCTION_APPLE_CLIENT_ID=$REACT_APP_PRODUCTION_APPLE_CLIENT_ID

# Install deps first so this layer is cached unless package*.json changes
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .
RUN npm run build

# ---------------------------------------------------------------------------
# Stage 2: Serve the static build with Nginx
# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS production

COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
