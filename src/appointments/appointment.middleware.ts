import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class AppointmentMiddleware implements NestMiddleware {
  constructor(private readonly configurationService: ConfigurationService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Retrieve configuration settings
    const config = await this.configurationService.getConfiguration();
    if (req.method === 'GET') {
      const { date } = req.query;

      // Check if date is provided in the query
      if (!date) {
        throw new BadRequestException({
          message: '`date` is required in the query',
          code: 'SLOTS-01',
        });
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
      if (!dateRegex.test(date as string)) {
        throw new BadRequestException({
          message:
            '`date` must be in the format YYYY-MM-DD with valid month and day',
          code: 'SLOTS-02',
        });
      }
    }

    if (req.method === 'POST') {
      const { date, time } = req.body;

      if (!date && !time) {
        throw new BadRequestException({
          message: '`date` and `time` are required in the body',
          code: 'BOOK-02',
        });
      }

      if (!date) {
        throw new BadRequestException({
          message: '`date` is required in the body',
          code: 'BOOK-03',
        });
      }

      if (!time) {
        throw new BadRequestException({
          message: '`time` is required in the body',
          code: 'BOOK-04',
        });
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
      if (!dateRegex.test(date)) {
        throw new BadRequestException({
          message:
            '`date` must be in the format YYYY-MM-DD with valid month and day',
          code: 'BOOK-05',
        });
      }

      // Check for backdating with time consideration
      const inputDateTime = new Date(`${date}T${time}:00`);
      const now = new Date();

      if (inputDateTime < now) {
        throw new BadRequestException({
          message: 'Appointments cannot be booked in the past',
          code: 'BOOK-06',
        });
      }

      // Validate time against operational hours
      const operationalStart = new Date(
        `${date}T${config.operationalStart}:00`,
      );
      const operationalEnd = new Date(`${date}T${config.operationalEnd}:00`);

      if (inputDateTime < operationalStart || inputDateTime > operationalEnd) {
        throw new BadRequestException({
          message: `\`time\` must be within operational hours: ${config.operationalStart} to ${config.operationalEnd}`,
          code: 'BOOK-07',
        });
      }

      // Validate time format based on slotDuration
      const slotDuration = config.slotDuration;
      const validTimes = this.generateValidTimes(
        slotDuration,
        config.operationalStart,
        config.operationalEnd,
      );

      if (!validTimes.includes(time)) {
        throw new BadRequestException({
          message:
            '`time` must be in the valid format based on the configured slot duration',
          code: 'BOOK-08',
        });
      }

      // Check if weekends are off and prevent booking on weekends
      const inputDate = new Date(date);
      const isWeekend = inputDate.getDay() === 0 || inputDate.getDay() === 6; // 0 = Sunday, 6 = Saturday

      if (config.isWeekendOff && isWeekend) {
        throw new BadRequestException({
          message: 'Appointments cannot be booked on weekends.',
          code: 'BOOK-09',
        });
      }

      // Check if the date is in the daysOff configuration
      const daysOff = config.daysOff.split(',').map((day) => day.trim());
      const formattedDate = inputDate.toISOString().split('T')[0];

      if (daysOff.includes(formattedDate)) {
        throw new BadRequestException({
          message:
            'Appointments cannot be booked on this day as it is a day off.',
          code: 'BOOK-10',
        });
      }

      // Check if the time is in the unavailableHours configuration
      const unavailableHours = config.unavailableHours
        .split(',')
        .map((hour) => hour.trim()); // Convert to array

      const inputTime = new Date(`${date}T${time}`);

      // Check if the requested time falls within any unavailable hour range
      for (const range of unavailableHours) {
        const [start] = range
          .split('-')
          .map((t) => new Date(`${date}T${t.trim()}`));
        const end = new Date(start);
        end.setHours(end.getHours() + 1);

        if (inputTime >= start && inputTime < end) {
          throw new BadRequestException({
            message:
              'Appointments cannot be booked at this time as it is unavailable.',
            code: 'BOOK-11',
          });
        }
      }
    }

    if (req.method === 'DELETE') {
      const { date, time } = req.body;

      if (!date && !time) {
        throw new BadRequestException({
          message: '`date` and `time` are required in the body',
          code: 'CANCEL-02',
        });
      }

      if (!date) {
        throw new BadRequestException({
          message: '`date` is required in the body',
          code: 'CANCEL-03',
        });
      }

      if (!time) {
        throw new BadRequestException({
          message: '`time` is required in the body',
          code: 'CANCEL-04',
        });
      }

      // Validate date format (YYYY-MM-DD)
      const dateRegex = /^(19|20)\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
      if (!dateRegex.test(date)) {
        throw new BadRequestException({
          message:
            '`date` must be in the format YYYY-MM-DD with valid month and day',
          code: 'CANCEL-05',
        });
      }

      // Check for backdating with time consideration
      const inputDateTime = new Date(`${date}T${time}:00`);
      const now = new Date();

      if (inputDateTime < now) {
        throw new BadRequestException({
          message: "Can't cancel past appointments",
          code: 'CANCEL-06',
        });
      }

      // Validate time against operational hours
      const operationalStart = new Date(
        `${date}T${config.operationalStart}:00`,
      );
      const operationalEnd = new Date(`${date}T${config.operationalEnd}:00`);

      if (inputDateTime < operationalStart || inputDateTime > operationalEnd) {
        throw new BadRequestException({
          message: `\`time\` must be within operational hours: ${config.operationalStart} to ${config.operationalEnd}`,
          code: 'CANCEL-07',
        });
      }

      // Validate time format based on slotDuration
      const slotDuration = config.slotDuration;
      const validTimes = this.generateValidTimes(
        slotDuration,
        config.operationalStart,
        config.operationalEnd,
      );

      if (!validTimes.includes(time)) {
        throw new BadRequestException({
          message:
            '`time` must be in the valid format based on the configured slot duration',
          code: 'CANCEL-08',
        });
      }
    }

    next();
  }

  private generateValidTimes(
    slotDuration: number,
    operationalStart: string,
    operationalEnd: string,
  ): string[] {
    const validTimes: string[] = [];
    const startTime = new Date(`1970-01-01T${operationalStart}:00`); // Start from operational start time
    const endTime = new Date(`1970-01-01T${operationalEnd}:00`); // End at operational end time

    for (
      let time = startTime;
      time <= endTime;
      time.setMinutes(time.getMinutes() + slotDuration)
    ) {
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      validTimes.push(`${hours}:${minutes}`);
    }

    return validTimes;
  }
}
