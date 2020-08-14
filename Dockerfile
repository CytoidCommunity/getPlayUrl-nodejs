FROM node:12-alpine

RUN yarn install

CMD ["node","index.js"]
USER node