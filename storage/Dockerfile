FROM node:8.7.0

WORKDIR /app

COPY dist /app/dist
COPY public /app/public
COPY package.json /app

RUN npm install

EXPOSE 3001

CMD [ "npm", "run", "start" ]
