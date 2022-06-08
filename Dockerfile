FROM node:14-slim

WORKDIR /app

COPY package.json ./app

RUN npm install

COPY . .

EXPOSE 8080

CMD ["node", "src/server.js"]