FROM node as development
WORKDIR /var/fix3p
COPY . .
RUN npm install && npm run build

FROM nginx as production
WORKDIR /usr/share/nginx/html
COPY --from=development /var/fix3p/dist .
EXPOSE 80
