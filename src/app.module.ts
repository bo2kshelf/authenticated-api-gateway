import {Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {GraphQLGatewayModule} from '@nestjs/graphql';
import graphqlConfig from './graphql/graphql.config';

@Module({
  imports: [
    GraphQLGatewayModule.forRootAsync({
      imports: [ConfigModule.forFeature(graphqlConfig)],
      inject: [ConfigService],
      useFactory: async (configs: ConfigService) => ({
        server: {
          cors: true,
        },
        gateway: {
          serviceList: [
            {name: 'books', url: configs.get<string>('graphql.booksUrl')},
            {
              name: 'bookcover',
              url: configs.get<string>('graphql.bookcoverUrl'),
            },
            {name: 'search', url: configs.get<string>('graphql.searchUrl')},
          ],
        },
      }),
    }),
  ],
})
export class AppModule {}
