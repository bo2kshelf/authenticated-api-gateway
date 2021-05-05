import {registerAs} from '@nestjs/config';

export const AppConfig = registerAs('app', () => ({
  endpoints: {
    services: {
      bookcover: process.env.BOOKCOVER_SERVICE_URL!,
      readUsers: process.env.READ_USERS_SERVICE_URL!,
      readContents: process.env.READ_CONTENTS_SERVICE_URL!,
      readRecords: process.env.READ_RECORDS_SERVICE_URL!,
      currentUser: process.env.CURRENT_USER_SERVICE_URL!,
    },
  },
}));
