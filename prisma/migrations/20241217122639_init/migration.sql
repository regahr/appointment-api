-- CreateTable
CREATE TABLE "Appointment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Configuration" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slotDuration" INTEGER NOT NULL DEFAULT 30,
    "maxSlotsPerAppointment" INTEGER NOT NULL DEFAULT 1,
    "operationalStart" TEXT NOT NULL DEFAULT '09:00',
    "operationalEnd" TEXT NOT NULL DEFAULT '18:00',
    "daysOff" TEXT NOT NULL DEFAULT '',
    "unavailableHours" TEXT NOT NULL DEFAULT '',
    "isWeekendOff" BOOLEAN NOT NULL DEFAULT true
);
