import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const existingConfig = await prisma.configuration.findFirst();

  // Check if a configuration already exists
  if (!existingConfig) {
    // Create a default configuration
    await prisma.configuration.create({
      data: {
        slotDuration: 30, // Default slot duration
        maxSlotsPerAppointment: 1, // Default max slots
        operationalStart: '09:00', // Default start time
        operationalEnd: '18:00', // Default end time
        daysOff: '', // Default days off (empty)
        unavailableHours: '', // Default unavailable hours (empty),
        isWeekendOff: true, // Default value for weekend off
      },
    });
    console.log('Default configuration created.');
  } else {
    console.log('Configuration already exists. No action taken.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
