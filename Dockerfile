FROM node:bullseye-slim

RUN mkdir -p /opt/app

WORKDIR /opt/app

COPY package.json package-lock.json .
RUN npm install

COPY .env .
COPY index.js .
COPY import/ ./import

CMD ["npm", "run", "import"]