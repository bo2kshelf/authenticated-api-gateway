FROM node:14.15.4@sha256:cb01e9d98a50cab46bf75357fe4843cbfd3acca5d99c5f72794acf16c5db4f5f AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean

COPY tsconfig.json tsconfig.build.json ./
COPY src ./src
RUN yarn build

FROM node:14.15.4-slim@sha256:4f4e17e43e434774aac4d323b5b1d277028bfc646d3685883fea17ac9286b382

ENV PORT 4000

WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=build /app/dist ./dist

RUN yarn install --frozen-lockfile --production && yarn cache clean

EXPOSE $PORT

CMD ["node", "dist/main.js"]
