import { Module } from '@nestjs/common';
import { AppointmentModule } from './appointments/appointment.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigurationModule } from './configuration/configuration.module';

@Module({
  imports: [AppointmentModule, PrismaModule, ConfigurationModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
