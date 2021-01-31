import {RemoteGraphQLDataSource} from '@apollo/gateway';
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigType} from '@nestjs/config';
import {GATEWAY_BUILD_SERVICE, GraphQLGatewayModule} from '@nestjs/graphql';
import {parse} from 'querystring';
import GraphqlConfig from './graphql/graphql.config';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  private readonly tokenKey: string;

  constructor(config: any, tokenKey: string) {
    super(config);
    this.tokenKey = tokenKey;
  }

  async willSendRequest({request, context}: any) {
    if (context?.req?.headers?.authorization) {
      request.http.headers.set(
        'authorization',
        context?.req?.headers?.authorization,
      );
    } else if (
      context?.req?.headers?.cookie &&
      parse(context.req.headers.cookie)?.[this.tokenKey]
    ) {
      request.http.headers.set(
        'Authorization',
        `Bearer ${parse(context.req.headers.cookie)[this.tokenKey]!}`,
      );
    }
  }
}

@Module({
  imports: [ConfigModule.forFeature(GraphqlConfig)],
  providers: [
    {
      provide: AuthenticatedDataSource,
      useValue: AuthenticatedDataSource,
    },
    {
      provide: GATEWAY_BUILD_SERVICE,
      inject: [GraphqlConfig.KEY, AuthenticatedDataSource],
      useFactory: (
        graphqlConfig: ConfigType<typeof GraphqlConfig>,
        AuthenticatedDataSource,
      ) => {
        return ({url}: {name: unknown; url: unknown}) =>
          new AuthenticatedDataSource({url}, graphqlConfig.cookieTokenKey);
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
          cors: false,
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
