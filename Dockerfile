FROM node:14-slim

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install @tensorflow/tfjs-node

COPY . .

EXPOSE 8080

CMD ["node", "src/server.js"]