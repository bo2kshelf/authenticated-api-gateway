import {registerAs} from '@nestjs/config';

export const AppConfig = registerAs('app', () => ({
  jwt: {
    secret: process.env.JWT_SECRET!,
  },
  api: {users: {endpoint: process.env.USER_API_ENDPOINT!}},
  endpoints: {
    services: {
      neo4j: process.env.BOOKS_API_URL!,
      bookcovoer: process.env.BOOKCOVER_API_URL!,
      search: process.env.SEARCH_API_URL!,
      users: process.env.USERS_API_URL!,
    },
    authServer: process.env.AUTH_SERVER_ENDPOINT!,
  },
}));
