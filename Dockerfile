FROM node:14 AS builder

WORKDIR /app
ADD package.json yarn.lock /app/
RUN yarn
COPY . /app/
RUN yarn build

FROM node:14
WORKDIR /app
COPY --from=builder /app/dist/ /app/dist/
COPY server/ /app/server/
COPY assets/ /app/assets/
WORKDIR /app/server/
RUN yarn && rm -rf /usr/local/share/.cache
WORKDIR /app
CMD node server/main.js