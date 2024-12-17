import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Configuration } from '@prisma/client';

@Injectable()
export class ConfigurationService {
  constructor(private readonly prisma: PrismaService) {}

  async getConfiguration(): Promise<Configuration> {
    return this.prisma.configuration.findFirst();
  }

  async updateConfiguration(
    config: Partial<Configuration>,
  ): Promise<Configuration> {
    return this.prisma.configuration.update({
      where: { id: 1 },
      data: config,
    });
  }
}
