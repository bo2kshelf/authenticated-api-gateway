import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import supertokens from 'supertokens-node';
import EmailPassword from 'supertokens-node/recipe/emailpassword';
import Session from 'supertokens-node/recipe/session';
import {createApolloServer} from './apollo';
import {env} from './env';

supertokens.init({
  supertokens: {
    connectionURI: env.supertokens.connectionURI,
  },
  appInfo: {
    appName: env.supertokens.appName,
    apiDomain: env.supertokens.domains.api,
    websiteDomain: env.supertokens.domains.website,
  },
  recipeList: [Session.init(), EmailPassword.init()],
});

(() => {
  const app = express();
  app.use(morgan('dev'));
  app.use(compression());
  app.use(helmet({contentSecurityPolicy: false}));
  app.use(
    cors({
      origin: env.supertokens.domains.website,
      allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
      credentials: true,
    }),
  );
  app.use(['/graphql'], Session.verifySession({sessionRequired: false}));

  const server = createApolloServer();
  server.applyMiddleware({app, cors: false});

  app.listen({port: env.port});
})();
