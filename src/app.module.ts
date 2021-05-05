import {RemoteGraphQLDataSource} from '@apollo/gateway';
import {Module} from '@nestjs/common';
import {ConfigModule, ConfigType} from '@nestjs/config';
import {GATEWAY_BUILD_SERVICE, GraphQLGatewayModule} from '@nestjs/graphql';
import {AppConfig} from './app.config';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  async willSendRequest({request, context}: any) {
    request.http.headers.set('authorization', context.authorization);
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
      imports: [ConfigModule.forFeature(AppConfig), BuildServiceModule],
      inject: [AppConfig.KEY, GATEWAY_BUILD_SERVICE],
      useFactory: async (config: ConfigType<typeof AppConfig>) => ({
        server: {
          context: ({req}) => ({authorization: req.headers.authorization}),
        },
        gateway: {
          serviceList: [
            {
              name: 'bookcover',
              url: config.endpoints.services.bookcover,
            },
            {
              name: 'readUsers',
              url: config.endpoints.services.readUsers,
            },
            {
              name: 'readContents',
              url: config.endpoints.services.readContents,
            },
            {
              name: 'readRecords',
              url: config.endpoints.services.readRecords,
            },
            {
              name: 'currentUser',
              url: config.endpoints.services.currentUser,
            },
          ],
          serviceHealthCheck: true,
        },
      }),
    }),
  ],
})
export class AppModule {}
