import {registerAs} from '@nestjs/config';

export default registerAs('graphql', () => ({
  booksUrl: process.env.BOOKS_API_URL!,
  bookcoverUrl: process.env.BOOKCOVER_API_URL!,
  searchUrl: process.env.SEARCH_API_URL!,
}));
