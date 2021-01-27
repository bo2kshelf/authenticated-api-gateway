import {RemoteGraphQLDataSource} from '@apollo/gateway';
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigType} from '@nestjs/config';
import {GATEWAY_BUILD_SERVICE, GraphQLGatewayModule} from '@nestjs/graphql';
import GraphqlConfig from './graphql/graphql.config';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  async willSendRequest({request, context}: any) {
    const authorization = context?.req?.headers?.authorization;
    if (authorization) request.http.headers.set('authorization', authorization);
  }
}

@Module({
  providers: [
    {
      provide: AuthenticatedDataSource,
      useValue: AuthenticatedDataSource,
    },
    {
      provide: GATEWAY_BUILD_SERVICE,
      inject: [AuthenticatedDataSource],
      useFactory: (AuthenticatedDataSource) => {
        return ({url}: {name: unknown; url: unknown}) =>
          new AuthenticatedDataSource({url});
      },
    },
  ],
  exports: [GATEWAY_BUILD_SERVICE],
})
class BuildServiceModule {}

@Module({
  imports: [
    GraphQLGatewayModule.forRootAsync({
      imports: [ConfigModule.forFeature(GraphqlConfig), BuildServiceModule],
      inject: [GraphqlConfig.KEY, GATEWAY_BUILD_SERVICE],
      useFactory: async (graphqlConfig: ConfigType<typeof GraphqlConfig>) => ({
        server: {
          cors: true,
          context: ({req}) => ({req}),
        },
        gateway: {
          serviceList: [
            {name: 'books', url: graphqlConfig.booksUrl},
            {name: 'bookcover', url: graphqlConfig.bookcoverUrl},
            {name: 'search', url: graphqlConfig.searchUrl},
            {name: 'users', url: graphqlConfig.usersUrl},
          ],
        },
      }),
    }),
  ],
})
export class AppModule {}
