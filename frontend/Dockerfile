FROM node:8.7.0

WORKDIR /app

COPY dist /app/dist
COPY package.json /app

RUN npm install

EXPOSE 3000

CMD [ "npm", "run", "start" ]
