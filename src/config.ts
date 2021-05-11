/* eslint-disable no-process-env */
import Session from 'supertokens-node/recipe/session';
import ThirdParty from 'supertokens-node/recipe/thirdparty';

export const PORT = process.env.PORT;

export const WEBSITE_DOMAIN = process.env.SUPERTOKENS_WEBSITE_DOMAIN!;

export const supertoken = {
  supertokens: {
    connectionURI: process.env.SUPERTOKENS_CONNECTION_URI!,
  },
  appInfo: {
    appName: process.env.SUPERTOKENS_APP_NAME!,
    websiteDomain: WEBSITE_DOMAIN,
    apiDomain: process.env.SUPERTOKENS_API_DOMAIN!,
  },
  recipeList: [
    Session.init(),
    ThirdParty.init({
      signInAndUpFeature: {
        providers: [
          ThirdParty.Github({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
          }),
        ],
      },
    }),
  ],
};

export const serviceList = [
  {
    name: 'bookcover',
    url: process.env.BOOKCOVER_SERVICE_URL!,
  },
  {
    name: 'readUsers',
    url: process.env.READ_USERS_SERVICE_URL!,
  },
  {
    name: 'usersPicture',
    url: process.env.USERS_PICTURE_SERVICE_URL!,
  },
  {
    name: 'readContents',
    url: process.env.READ_CONTENTS_SERVICE_URL!,
  },
  {
    name: 'readRecords',
    url: process.env.READ_RECORDS_SERVICE_URL!,
  },
  {
    name: 'currentUser',
    url: process.env.CURRENT_USER_SERVICE_URL!,
  },
];

export const JWT_SECRET = process.env.JWT_SECRET!;
