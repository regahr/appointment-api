import { Controller, Get, Body, Res, Patch } from '@nestjs/common';
import { Response } from 'express';
import { ConfigurationService } from './configuration.service';
import { Configuration } from '@prisma/client';

@Controller('configuration')
export class ConfigurationController {
  constructor(private readonly configurationService: ConfigurationService) {}

  @Get()
  async getConfiguration() {
    return this.configurationService.getConfiguration();
  }

  @Patch()
  async updateConfiguration(
    @Body() configuration: Partial<Configuration>,
    @Res() res: Response,
  ) {
    const response =
      await this.configurationService.updateConfiguration(configuration);
    return res.status(200).json(response);
  }
}
