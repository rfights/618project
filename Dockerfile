FROM node:20 AS build
ARG VITE_BACKEND_URL
WORKDIR /build
COPY package.json .
COPY package-lock.json .
RUN npm install
COPY . .

RUN npm run build

FROM nginx AS final
WORKDIR /usr/share/nginx/html
COPY --from=build /build/dist .
COPY nginx.conf /etc/nginx/conf.d/default.conf