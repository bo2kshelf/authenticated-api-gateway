FROM node:14.15.4@sha256:cb01e9d98a50cab46bf75357fe4843cbfd3acca5d99c5f72794acf16c5db4f5f AS build

WORKDIR /app

COPY package.json yarn.lock ./
COPY tsconfig.json tsconfig.build.json ./
COPY src ./src

RUN yarn install --frozen-lockfile
RUN yarn build

FROM node:14.15.4-slim@sha256:4ec1416247273c7318c0351e04ed997dd8c8059fc53c94e6c5a65773a299395f

ENV PORT 4000

WORKDIR /app

COPY package.json yarn.lock ./
COPY --from=build /app/dist ./dist

RUN yarn install --frozen-lockfile --production

EXPOSE $PORT

CMD ["node", "dist/main.js"]
