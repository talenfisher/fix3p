FROM nginx

WORKDIR /tmp/fix3p
COPY . .

# Install NPM & Dependencies
RUN apt-get update && apt-get install --no-install-recommends --no-install-suggests curl gnupg2 apt-transport-https ca-certificates -y
RUN curl -sL https://deb.nodesource.com/setup_10.x | bash - && apt-get install nodejs -y
RUN npm install

# Build 
RUN npm run build

# Cleanup
RUN cp -r src/* /usr/share/nginx/html
RUN cd ../ && rm -rf fix3p

EXPOSE 80
