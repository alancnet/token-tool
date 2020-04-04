FROM node:13.12.0 AS builder

WORKDIR /app
ADD package.json yarn.lock /app/
RUN yarn
COPY . /app/
RUN yarn build

FROM node:13.12.0
WORKDIR /app
RUN yarn global add http-server
COPY --from=builder /app/dist/ /app/dist/
CMD http-server -p 80 /app/dist/