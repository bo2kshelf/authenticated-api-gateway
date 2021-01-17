import {RemoteGraphQLDataSource} from '@apollo/gateway';
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {GATEWAY_BUILD_SERVICE, GraphQLGatewayModule} from '@nestjs/graphql';
import graphqlConfig from './graphql/graphql.config';

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
      imports: [ConfigModule.forFeature(graphqlConfig), BuildServiceModule],
      inject: [ConfigService, GATEWAY_BUILD_SERVICE],
      useFactory: async (configs: ConfigService) => ({
        server: {
          cors: true,
          context: ({req}) => ({req}),
        },
        gateway: {
          serviceList: [
            {name: 'books', url: configs.get<string>('graphql.booksUrl')},
            {
              name: 'bookcover',
              url: configs.get<string>('graphql.bookcoverUrl'),
            },
            {name: 'search', url: configs.get<string>('graphql.searchUrl')},
            {name: 'users', url: configs.get<string>('graphql.usersUrl')},
          ],
        },
      }),
    }),
  ],
})
export class AppModule {}
