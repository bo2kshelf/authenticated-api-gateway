import {registerAs} from '@nestjs/config';

export default registerAs('graphql', () => ({
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
