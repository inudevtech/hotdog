FROM node:16 as builder
WORKDIR /app

ARG NEXT_PUBLIC_FIREBASE_API_KEY

COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

COPY --chown=node:node . .
RUN /app/node_modules/.bin/next build

FROM gcr.io/distroless/nodejs:16
WORKDIR /app

COPY --from=builder /app/node_modules /app/node_modules
COPY --from=builder /app/.next /app/.next

EXPOSE 3000

CMD ["/app/node_modules/.bin/next","start","-p","80"]