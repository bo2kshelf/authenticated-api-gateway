import {Module} from '@nestjs/common';
import {ConfigModule, ConfigType} from '@nestjs/config';
import {GraphQLGatewayModule} from '@nestjs/graphql';
import GraphqlConfig from './graphql/graphql.config';

@Module({
  imports: [
    GraphQLGatewayModule.forRootAsync({
      imports: [ConfigModule.forFeature(GraphqlConfig)],
      inject: [GraphqlConfig.KEY],
      useFactory: async (graphqlConfig: ConfigType<typeof GraphqlConfig>) => ({
        server: {
          cors: true,
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
