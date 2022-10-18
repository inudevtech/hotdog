FROM node:18 as builder
WORKDIR /app

ARG NEXT_PUBLIC_FIREBASE_API_KEY
ARG NEXT_PUBLIC_GOOGLE_RECAPTCHA_KEY
ARG NEXT_PUBLIC_TINY_APIKEY
ARG NEXT_PUBLIC_GA_TRACKING_ID
ARG NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN

ENV TINI_VERSION v0.19.0
ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini-static /tini
RUN chmod +x /tini

COPY --chown=node:node package.json yarn.lock ./
RUN yarn install --prod --frozen-lockfile

COPY --chown=node:node . .

RUN /app/node_modules/.bin/next build

FROM gcr.io/distroless/nodejs:18
WORKDIR /app

COPY --from=builder --chown=nonroot:nonroot /tini /tini
COPY --from=builder --chown=nonroot:nonroot /app/node_modules ./node_modules
COPY --from=builder --chown=nonroot:nonroot /app/.next ./.next
COPY --from=builder --chown=nonroot:nonroot /app/public ./public
COPY --from=builder --chown=nonroot:nonroot /app/next.config.js ./next.config.js

USER nonroot
EXPOSE 3000

ENTRYPOINT [ "/tini", "--", "/app/node_modules/.bin/next" ]
CMD ["start","-p","80"]