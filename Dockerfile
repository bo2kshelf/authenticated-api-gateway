FROM node:14.14.0@sha256:87f17449625c680c58348d6c8b242564b718e6fa8056c4fa86389e48eb5ee145 AS build

WORKDIR /app

COPY package.json yarn.lock ./
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:14.14.0-slim@sha256:3f0e71eee1467ac6d0a16ea66da16e1e0092c56d7e06ebaf2695b5de175cd4d9

ENV PORT 4000

WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=build /app/dist ./dist

RUN yarn install --frozen-lockfile --production

EXPOSE $PORT

CMD ["node", "dist/main.js"]
