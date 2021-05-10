import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import supertokens from 'supertokens-node';
import Session from 'supertokens-node/recipe/session';
import {createApolloServer} from './apollo';
import {PORT, supertoken, WEBSITE_DOMAIN} from './config';

supertokens.init(supertoken);

(() => {
  const app = express();
  app.use(morgan('dev'));
  app.use(compression());
  app.use(helmet({contentSecurityPolicy: false}));
  app.use(
    cors({
      origin: WEBSITE_DOMAIN,
      allowedHeaders: ['content-type', ...supertokens.getAllCORSHeaders()],
      credentials: true,
    }),
  );
  app.use(['/graphql'], Session.verifySession({sessionRequired: false}));
  app.use(supertokens.middleware());
  app.use(supertokens.errorHandler());

  const server = createApolloServer();
  server.applyMiddleware({app, cors: false});

  app.listen({port: PORT});
})();
