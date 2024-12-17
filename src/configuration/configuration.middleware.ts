import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigurationService } from './configuration.service';

@Injectable()
export class ConfigurationMiddleware implements NestMiddleware {
  constructor(private readonly configurationService: ConfigurationService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if (req.method === 'PATCH') {
      const config = await this.configurationService.getConfiguration();
      const {
        slotDuration,
        maxSlotsPerAppointment,
        operationalStart,
        operationalEnd,
        daysOff,
        unavailableHours,
        isWeekendOff,
      } = req.body;

      // Validate incoming data
      if (
        slotDuration !== undefined &&
        (typeof slotDuration !== 'number' || slotDuration < 5)
      ) {
        throw new BadRequestException({
          message: '`slotDuration` must be a number and at least 5 minutes.',
          code: 'CONFIG-01',
        });
      }

      if (
        maxSlotsPerAppointment !== undefined &&
        (typeof maxSlotsPerAppointment !== 'number' ||
          maxSlotsPerAppointment < 1 ||
          maxSlotsPerAppointment > 5)
      ) {
        throw new BadRequestException({
          message: '`maxSlotsPerAppointment` must be a number between 1 and 5.',
          code: 'CONFIG-02',
        });
      }

      if (
        operationalStart !== undefined &&
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(operationalStart)
      ) {
        throw new BadRequestException({
          message: '`operationalStart` must be in the format HH:mm.',
          code: 'CONFIG-03',
        });
      }

      if (
        operationalEnd !== undefined &&
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(operationalEnd)
      ) {
        throw new BadRequestException({
          message: '`operationalEnd` must be in the format HH:mm.',
          code: 'CONFIG-04',
        });
      }

      if (daysOff !== undefined && typeof daysOff !== 'string') {
        throw new BadRequestException({
          message: '`daysOff` must be a comma-separated string of dates.',
          code: 'CONFIG-05',
        });
      }

      if (daysOff) {
        const dates = daysOff.split(',').map((date) => date.trim());
        const dateRegex =
          /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
        for (const date of dates) {
          if (!dateRegex.test(date)) {
            throw new BadRequestException({
              message: `Invalid date format in \`daysOff\`: ${date}. Expected format is YYYY-MM-DD.`,
              code: 'CONFIG-06',
            });
          }
        }
      }

      if (
        unavailableHours !== undefined &&
        typeof unavailableHours !== 'string'
      ) {
        throw new BadRequestException({
          message:
            '`unavailableHours` must be a comma-separated string of hours.',
          code: 'CONFIG-07',
        });
      }

      if (unavailableHours) {
        const hours = unavailableHours.split(',').map((hour) => hour.trim());
        const timeFormatRegex = /^([01]\d|2[0-3]):00$/;
        const operationalStartDate = new Date(
          `1970-01-01T${config.operationalStart}`,
        );
        const operationalEndDate = new Date(
          `1970-01-01T${config.operationalEnd}`,
        );

        for (const hour of hours) {
          if (!timeFormatRegex.test(hour)) {
            throw new BadRequestException({
              message: `Invalid hour format in \`unavailableHours\`: ${hour}. Expected format is HH:00.`,
              code: 'CONFIG-08',
            });
          }

          const unavailableHourDate = new Date(`1970-01-01T${hour}`);

          if (
            unavailableHourDate < operationalStartDate ||
            unavailableHourDate >= operationalEndDate
          ) {
            throw new BadRequestException({
              message: `Unavailable hour \`${hour}\` must be within operational hours: ${config.operationalStart} to ${config.operationalEnd}.`,
              code: 'CONFIG-09',
            });
          }
        }
      }

      if (isWeekendOff !== undefined && typeof isWeekendOff !== 'boolean') {
        throw new BadRequestException({
          message: '`isWeekendOff` must be a boolean value.',
          code: 'CONFIG-10',
        });
      }

      next();
    } else {
      next();
    }
  }
}
