import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { PrismaService } from '../prisma/prisma.service';
import { AppointmentMiddleware } from './appointment.middleware';
import { ConfigurationService } from 'src/configuration/configuration.service';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService, PrismaService, ConfigurationService],
})
export class AppointmentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AppointmentMiddleware).forRoutes(AppointmentController);
  }
}
