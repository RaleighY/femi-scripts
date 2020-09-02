### stage: build ###
FROM node:10.18-alpine3.10 AS build
LABEL MAINTAINER="raleighy <raleighy@163.com>"

# change to cnpm registry
RUN yarn global add nrm
RUN nrm use taobao

# install dependences
COPY package.json yarn.lock /source/
RUN cd /source && yarn
COPY ./ /source
RUN cd /source && yarn build

### stage: run ###
FROM node:10.18 AS RUN
COPY --from=build /source/dist /rally
RUN cd /rally && yarn run
EXPOSE 7000
CMD [ "forever", "/rally/dist/js/main.js" ]