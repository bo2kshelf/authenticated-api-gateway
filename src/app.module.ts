import {RemoteGraphQLDataSource} from '@apollo/gateway';
import {
  BadRequestException,
  HttpModule,
  HttpService,
  Module,
  UnauthorizedException,
} from '@nestjs/common';
import {ConfigModule, ConfigType} from '@nestjs/config';
import {GATEWAY_BUILD_SERVICE, GraphQLGatewayModule} from '@nestjs/graphql';
import {JwtModule, JwtService} from '@nestjs/jwt';
import {AppConfig} from './app.config';

class AuthenticatedDataSource extends RemoteGraphQLDataSource {
  async willSendRequest({request, context}: any) {
    request.permissions = context.permissions;
    request.user = context.user;
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
        HttpModule,
        ConfigModule.forFeature(AppConfig),
        JwtModule.registerAsync({
          imports: [ConfigModule.forFeature(AppConfig)],
          inject: [AppConfig.KEY],
          useFactory: async (config: ConfigType<typeof AppConfig>) => ({
            secret: config.jwt.secret,
          }),
        }),
        BuildServiceModule,
      ],
      inject: [AppConfig.KEY, HttpService, JwtService, GATEWAY_BUILD_SERVICE],
      useFactory: async (
        config: ConfigType<typeof AppConfig>,
        httpService: HttpService,
        jwtService: JwtService,
      ) => ({
        server: {
          context: async ({req}) => {
            const authorization: string = req.headers.authorization;
            if (!authorization) return {req};

            if (!/^(B|b)earer .*$/.test(authorization))
              throw new BadRequestException();

            const token = authorization.slice(7);

            const payload = await jwtService.verify<{
              userId?: string;
              permissions?: string[];
            }>(token);
            if (!payload.permissions) throw new UnauthorizedException();

            if (!payload.userId)
              return {
                permissions: payload.permissions,
                req,
              };

            const user: {id: string} | void = await httpService
              .get<{id: string}>(
                new URL('/users', config.api.users.endpoint).toString(),
                {params: {id: payload.userId}},
              )
              .toPromise()
              .then(({data: user}) => user)
              .then(({id, ...other}) => ({id}))
              .catch(() => {});
            if (!user) throw new UnauthorizedException();

            return {
              permissions: payload.permissions,
              user,
              req,
            };
          },
        },
        gateway: {
          serviceList: [
            {name: 'books', url: config.endpoints.services.neo4j},
            {name: 'bookcover', url: config.endpoints.services.bookcovoer},
            {name: 'search', url: config.endpoints.services.search},
            {name: 'users', url: config.endpoints.services.users},
          ],
          serviceHealthCheck: true,
        },
      }),
    }),
  ],
})
export class AppModule {}
