FROM node:18 as builder
WORKDIR /app

ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY
ARG NEXT_PUBLIC_TINY_APIKEY
ARG NEXT_PUBLIC_GA_TRACKING_ID
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

COPY --chown=node:node . .

RUN /app/node_modules/.bin/next build

FROM gcr.io/distroless/nodejs:16
WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/.next /app/.next
COPY --from=builder /app/public /app/public
COPY --from=builder /app/next.config.js /app/next.config.js

EXPOSE 3000

CMD ["/app/node_modules/.bin/next","start","-p","80"]