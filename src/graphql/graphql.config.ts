import {registerAs} from '@nestjs/config';

export default registerAs('graphql', () => ({
  booksUrl: process.env.BOOKS_API_URL!,
}));
