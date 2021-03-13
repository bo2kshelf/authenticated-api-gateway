import {RemoteGraphQLDataSource} from '@apollo/gateway';
import {HttpModule, HttpService, Module} from '@nestjs/common';
import {ConfigModule, ConfigType} from '@nestjs/config';
import {GATEWAY_BUILD_SERVICE, GraphQLGatewayModule} from '@nestjs/graphql';
import GraphqlConfig from './graphql/graphql.config';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  async willSendRequest({request, context}: any) {
    request.http.headers.set(
      'authorization',
      context?.req?.headers?.authorization,
    );
  }
}

@Module({
  providers: [
    {provide: AuthenticatedDataSource, useValue: AuthenticatedDataSource},
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
      imports: [
        ConfigModule.forFeature(GraphqlConfig),
        HttpModule,
        BuildServiceModule,
      ],
      inject: [GraphqlConfig.KEY, HttpService, GATEWAY_BUILD_SERVICE],
      useFactory: async (
        config: ConfigType<typeof GraphqlConfig>,
        httpService: HttpService,
      ) => ({
        server: {
          context: async ({req}) => {
            if (req.headers.authorization) return {req};
            if (req.headers.cookie)
              await httpService
                .get<string>(
                  new URL(
                    '/auth/token',
                    config.endpoints.authServer,
                  ).toString(),
                  {headers: {cookie: req.headers.cookie}},
                )
                .toPromise()
                .then(({data: token}) => token)
                .then((token) => {
                  req.headers.authorization = `Bearer ${token}`;
                });
            return {req};
          },
        },
        gateway: {
          serviceList: [
            {name: 'books', url: config.endpoints.services.neo4j},
            {name: 'bookcover', url: config.endpoints.services.bookcovoer},
            {name: 'search', url: config.endpoints.services.search},
            {name: 'users', url: config.endpoints.services.users},
          ],
        },
      }),
    }),
  ],
})
export class AppModule {}
