FROM node:14.15.4@sha256:c8000514cb7d4cf1fb3ea2e7f5d397512392b0bd70dc2c94ba89c147a3ba8414 AS build

WORKDIR /app

COPY package.json yarn.lock ./
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:14.15.4-slim@sha256:f386ed4ccc9e07acf595ef3d8d8060326e1ea3010f6603f7e853628f4c99ff03

ENV PORT 4000

WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=build /app/dist ./dist

RUN yarn install --frozen-lockfile --production

EXPOSE $PORT

CMD ["node", "dist/main.js"]
