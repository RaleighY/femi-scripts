### stage: build ###
FROM node:12 AS build
LABEL MAINTAINER="rally <raleighy@163.com>"

# npm -------- https://registry.npmjs.org/
# yarn ------- https://registry.yarnpkg.com/
# cnpm ------- http://r.cnpmjs.org/
# taobao ----- https://registry.npm.taobao.org/
# nj --------- https://registry.nodejitsu.com/
# npmMirror -- https://skimdb.npmjs.com/registry/
# edunpm ----- http://registry.enpmjs.org/
# didi-old --- http://registry.npm.xiaojukeji.com/
# didi-new --- http://npm.intra.xiaojukeji.com/

# install dependences
WORKDIR /source
COPY package.json yarn.lock /source/
RUN yarn --registry=https://registry.npm.taobao.org/
COPY ./ /source
RUN yarn build 

### stage: run ###
FROM node:12-alpine AS RUN
RUN yarn global add forever --registry=https://registry.npm.taobao.org/
COPY --from=build /source/dist /source/dist
COPY --from=build /source/package.json /source/
WORKDIR /source
CMD [ "npm", "run", "go" ]
EXPOSE 7000 