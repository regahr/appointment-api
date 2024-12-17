import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigurationController } from './configuration.controller';
import { ConfigurationService } from './configuration.service';
import { ConfigurationMiddleware } from './configuration.middleware';

@Module({
  controllers: [ConfigurationController],
  providers: [ConfigurationService, PrismaService],
  exports: [ConfigurationService],
})
export class ConfigurationModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ConfigurationMiddleware).forRoutes(ConfigurationController);
  }
}
