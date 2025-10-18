FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
EXPOSE 3000
RUN npm install
COPY . .

CMD ["npm", "run", "start:dev"]