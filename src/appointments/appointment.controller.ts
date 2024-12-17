import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  Res,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { Response } from 'express';

@Controller('appointments')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Get('slots')
  async getAvailableSlots(@Query('date') date: string, @Res() res: Response) {
    const slots = await this.appointmentService.getAvailableSlots(date);
    return res.status(200).json(slots);
  }

  @Post()
  async bookAppointment(
    @Body() bookingData: { date: string; time: string },
    @Res() res: Response,
  ) {
    const appointment =
      await this.appointmentService.bookAppointment(bookingData);
    return res.status(201).json(appointment);
  }

  @Delete()
  async cancelAppointment(
    @Body() bookingData: { date: string; time: string },
    @Res() res: Response,
  ) {
    const appointment =
      await this.appointmentService.cancelAppointment(bookingData);
    return res.status(200).json(appointment);
  }
}
