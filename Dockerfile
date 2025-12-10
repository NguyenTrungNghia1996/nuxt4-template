FROM node:20-alpine AS nodebuilder

WORKDIR /app
COPY package.json .
COPY yarn.lock .
RUN yarn install
COPY . .
RUN yarn build

FROM node:20-alpine AS bin

# Build metadata (can be overridden by build args)
ARG BUILD_TAG=dev
ARG BUILD_SHA=dev
ARG BUILD_TIME

# Expose build metadata to the running container (Nuxt public runtime)
ENV NUXT_PUBLIC_BUILD_TAG=$BUILD_TAG \
    NUXT_PUBLIC_BUILD_SHA=$BUILD_SHA \
    NUXT_PUBLIC_BUILD_TIME=$BUILD_TIME

COPY --from=nodebuilder /app/.output ./.output
CMD ["node", ".output/server/index.mjs"]