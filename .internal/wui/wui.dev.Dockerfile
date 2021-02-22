FROM node:alpine

WORKDIR /usr/iotstack_wui

# node_modules is ignored with this copy, as specified in .dockerignore
COPY ./.internal/wui ./
RUN npm install

EXPOSE 32777
CMD [ "npm", "start" ]
