import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Appointment } from '@prisma/client';
import { ConfigurationService } from '../configuration/configuration.service';

@Injectable()
export class AppointmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configurationService: ConfigurationService,
  ) {}

  async getAvailableSlots(date: string): Promise<any[]> {
    const config = await this.configurationService.getConfiguration();

    // Check if the date is a weekend
    const inputDate = new Date(date);
    const isWeekend = inputDate.getDay() === 0 || inputDate.getDay() === 6; // 0 = Sunday, 6 = Saturday

    // If weekends are off, return no available slots for weekends
    if (config.isWeekendOff && isWeekend) {
      return [];
    }

    // Define the time slots from 09:00 to 18:00 with 30-minute intervals
    const timeSlots = this.generateTimeSlots(
      config.operationalStart,
      config.operationalEnd,
      config.slotDuration,
    );

    // Fetch booked appointments for the given date
    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        date: date,
      },
    });

    // Create a map to count booked slots for each time
    const bookedCountMap = bookedAppointments.reduce(
      (acc, appointment) => {
        const key = appointment.time;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Retrieve unavailable hours from configuration
    const unavailableHours = config.unavailableHours
      .split(',')
      .map((hour) => hour.trim()); // Convert to array

    // Generate the available slots based on booked times and configuration
    const availableSlots = timeSlots.map((time) => {
      const bookedCount = bookedCountMap[time] || 0;
      const availableSlots = Math.max(
        0,
        config.maxSlotsPerAppointment - bookedCount,
      );

      // Skip hours that are in the unavailableHours
      if (unavailableHours.includes(time)) {
        return {
          date,
          time,
          available_slots: 0,
        };
      }

      return {
        date,
        time,
        available_slots: availableSlots,
      };
    });

    return availableSlots;
  }

  private generateTimeSlots(
    start: string,
    end: string,
    duration: number,
  ): string[] {
    const slots: string[] = [];
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);

    for (
      let time = startTime;
      time <= endTime;
      time.setMinutes(time.getMinutes() + duration)
    ) {
      const hours = time.getHours().toString().padStart(2, '0');
      const minutes = time.getMinutes().toString().padStart(2, '0');
      slots.push(`${hours}:${minutes}`);
    }

    return slots;
  }

  async bookAppointment({
    date,
    time,
  }: {
    date: string;
    time: string;
  }): Promise<Appointment> {
    // Retrieve configuration settings
    const config = await this.configurationService.getConfiguration();

    // Check if the appointment slot is already booked
    const bookedAppointments = await this.prisma.appointment.findMany({
      where: {
        date: date,
        time: time,
      },
    });

    const bookedCount = bookedAppointments.length;

    // Check if the number of booked slots exceeds the maximum allowed
    if (bookedCount >= config.maxSlotsPerAppointment) {
      throw new BadRequestException({
        message: 'This time slot has reached the maximum number of bookings',
        code: 'BOOK-01',
      });
    }

    // Create the appointment
    return this.prisma.appointment.create({
      data: {
        date,
        time,
      },
    });
  }

  async cancelAppointment({
    date,
    time,
  }: {
    date: string;
    time: string;
  }): Promise<Appointment> {
    // Check if the appointment slot is already booked
    const existingAppointment = await this.prisma.appointment.findFirst({
      where: {
        date: date,
        time: time,
      },
    });

    if (!existingAppointment) {
      throw new BadRequestException({
        message: 'There is no available appointment to be cancelled',
        code: 'CANCEL-01',
      });
    }

    await this.prisma.appointment.delete({
      where: { id: existingAppointment.id },
    });

    return existingAppointment;
  }
}
