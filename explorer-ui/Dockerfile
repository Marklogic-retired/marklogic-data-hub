# Stage 0
# Frontend build based on Node.js
FROM node:11.12.0-alpine as build-stage
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
ENV PATH /usr/src/app/node_modules/.bin:$PATH
COPY package.json /usr/src/app/package.json
RUN npm install
RUN npm install react-scripts@3.3.1 -g
COPY . /usr/src/app
# RUN CI=true npm test
RUN npm run build

# Stage 1
# Production build based on Nginx with artifacts from Stage 0
FROM nginx:1.15.9-alpine
COPY config/ca/intermediate/certs/www.explorer.com.cert.pem /etc/nginx/www.explorer.com.cert.pem
COPY config/ca/intermediate/private/www.explorer.com.key.pem /etc/nginx/www.explorer.com.key.pem
COPY config/nginx.conf.template /etc/nginx/conf.d/default.conf.template
COPY config/docker-entrypoint.sh /
ENTRYPOINT ["sh", "/docker-entrypoint.sh"]
COPY --from=build-stage /usr/src/app/build /usr/share/nginx/html
EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]