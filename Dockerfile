FROM node:lts AS build
WORKDIR /app
COPY package.json .
RUN yarn

COPY . .
RUN yarn build

FROM nginx:stable-alpine
COPY ./default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html