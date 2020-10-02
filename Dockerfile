FROM node:12

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV PORT=4444

EXPOSE 4444

CMD ["npm", "start"]