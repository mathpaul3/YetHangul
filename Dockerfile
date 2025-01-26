FROM alpine:3.21 AS build

ENV NODE_VERSION 22.13.1
ENV YARN_VERSION 1.22.22

# FROM node:lts AS build
WORKDIR /app
COPY package.json .
RUN yarn

COPY . .
RUN yarn build

FROM nginx:stable-alpine
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html