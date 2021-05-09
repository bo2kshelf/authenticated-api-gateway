import {ApolloGateway, RemoteGraphQLDataSource} from '@apollo/gateway';
import {ApolloServer} from 'apollo-server-express';
import jwt from 'jsonwebtoken';
import {SessionContainer} from 'supertokens-node/recipe/session';
import {env} from './env';

export class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  willSendRequest({context, request}: any) {
    request.http.headers.set('authorization', context.authorization);
  }
}

export const createApolloGateway = () => {
  return new ApolloGateway({
    serviceList: [
      env.services.bookcover,
      env.services.readUsers,
      env.services.readContents,
      env.services.readRecords,
      env.services.currentUser,
    ],
    serviceHealthCheck: true,
    buildService({url}) {
      return new AuthenticatedDataSource({url});
    },
  });
};

export const createApolloServer = () => {
  return new ApolloServer({
    gateway: createApolloGateway(),
    subscriptions: false,
    context: async ({req}) => {
      if (req.headers?.authorization)
        return {authorization: req.headers.authorization};

      if ('session' in req && (req as any).session) {
        const session: SessionContainer = (req as any).session;
        const uid = session.getUserId();

        const token = await jwt.sign({uid}, env.jwt.secret, {
          expiresIn: '1m',
        });

        return {authorization: `Bearer ${token}`};
      }

      return {};
    },
  });
};
