FROM node:alpine

WORKDIR /usr/iotstack_wui

# node_modules is ignored with this copy, as specified in .dockerignore
COPY ./.internal/wui ./
RUN npm install
RUN npm run build

EXPOSE 32777
CMD [ "npm", "run", "serve" ]
