FROM node as development
WORKDIR /media/fix3p
COPY . .
RUN npm install && npm install http-server -g
RUN npm run build
CMD eval "http-server src -p 80 &" && npm run watch
EXPOSE 80


FROM nginx as production
WORKDIR /usr/share/nginx/html
COPY --from=development /media/fix3p/src .
EXPOSE 80
