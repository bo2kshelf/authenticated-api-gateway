/* eslint-disable no-process-env */

export const env = {
  port: process.env.PORT,
  supertokens: {
    appName: process.env.SUPERTOKENS_APP_NAME!,
    connectionURI: process.env.SUPERTOKENS_CONNECTION_URI!,
    domains: {
      api: process.env.SUPERTOKENS_API_DOMAIN!,
      website: process.env.SUPERTOKENS_WEBSITE_DOMAIN!,
    },
  },
  jwt: {
    secret: process.env.JWT_SECRET!,
  },
  services: {
    bookcover: {
      name: 'bookcover',
      url: process.env.BOOKCOVER_SERVICE_URL!,
    },
    readUsers: {
      name: 'readUsers',
      url: process.env.READ_USERS_SERVICE_URL!,
    },
    readContents: {
      name: 'readContents',
      url: process.env.READ_CONTENTS_SERVICE_URL!,
    },
    readRecords: {
      name: 'readRecords',
      url: process.env.READ_RECORDS_SERVICE_URL!,
    },
    currentUser: {
      name: 'currentUser',
      url: process.env.CURRENT_USER_SERVICE_URL!,
    },
  },
};
