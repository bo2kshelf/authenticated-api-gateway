import {registerAs} from '@nestjs/config';

export default registerAs('graphql', () => ({
  cookieTokenKey: process.env.GRAPHQL_COOKIE_TOKEN_KEY!,
  booksUrl: process.env.BOOKS_API_URL!,
  bookcoverUrl: process.env.BOOKCOVER_API_URL!,
  searchUrl: process.env.SEARCH_API_URL!,
  usersUrl: process.env.USERS_API_URL!,
}));
