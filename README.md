 Appointment API

## Table of Contents
- [System Design](#system-design)
- [Database Design](#database-design)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Running the Application](#running-the-application)
- [Available APIs](#available-apis)
- [Using the APIs](#using-the-apis)
- [API Constraints](#api-constraints)

## System Design

The Appointment API is designed to manage appointment scheduling efficiently. Below is an simple diagram representing the system design:
```
+-------------------+
| Client (UI) |
+-------------------+
|
v
+-------------------+
| Appointment API |
| (NestJS + TypeScript) |
+-------------------+
|
v
+-------------------+
| Database |
| (SQLite) |
+-------------------+
```

## Database Design

The database is designed using SQLite, which is lightweight and easy to set up. The main tables include:

- **Configuration**: Stores system configuration settings such as operational hours, maximum slots per appointment, and unavailable hours.
- **Appointment**: Stores appointment details including date and time.

### Example Schema

```prisma
model Configuration {
  id Int @id @default(autoincrement())
  slotDuration Int @default(30) // Duration in minutes, minimum 5
  maxSlotsPerAppointment Int @default(1) // Maximum slots per appointment (1 to 5)
  operationalStart String @default("09:00") // Start time for appointments
  operationalEnd String @default("18:00") // End time for appointments
  daysOff String @default("") // Comma-separated string of days off
  unavailableHours String @default("") // Comma-separated string of unavailable hours
  isWeekendOff Boolean @default(false) // Flag to indicate if weekends are off
}

model Appointment {
  id Int @id @default(autoincrement())
  date String
  time String
}
```


## Technology Stack

- **NestJS**: A progressive Node.js framework for building efficient and scalable server-side applications. It provides a modular architecture and is built with TypeScript.
- **Prisma**: An ORM (Object-Relational Mapping) tool that simplifies database interactions and migrations.
- **SQLite**: A lightweight, serverless database that is easy to set up and ideal for small to medium-sized applications.

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- SQLite (for database management)

### Installation

1. Clone the repository:
   ```bash
   unzip appointment-api.zip
   cd appointment-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npm run prisma:migrate
   npm run prisma:generate
   ```

## Running the Application

To start the application, run the following command:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`.

## Available APIs

### 1. Create Appointment
- **Endpoint**: `POST /appointments`
- **Description**: Create a new appointment.
- **Request Body**:
  ```json
  {
    "date": "YYYY-MM-DD",
    "time": "HH:mm"
  }
  ```

### 2. Get Available Slots
- **Endpoint**: `GET /appointments/slots`
- **Description**: Retrieve available slots for a given date.
- **Query Parameters**:
  - `date`: The date for which to check available slots (format: YYYY-MM-DD).

### 3. Cancel Appointment
- **Endpoint**: `DELETE /appointments`
- **Description**: Cancel booked appointment.
- **Request Body**:
  ```json
  {
    "date": "YYYY-MM-DD",
    "time": "HH:mm"
  }
  ```  

### 4. Update Configuration
- **Endpoint**: `PATCH /configuration`
- **Description**: Update system configuration settings.
- **Request Body**:
  ```json
  {
    "slotDuration": 30,
    "maxSlotsPerAppointment": 3,
    "operationalStart": "09:00",
    "operationalEnd": "18:00",
    "daysOff": "2023-12-25,2023-12-31",
    "unavailableHours": "12:00,13:00",
    "isWeekendOff": true
  }
  ```

## Using the APIs

### Example Request to Create an Appointment
```bash
curl -X POST http://localhost:3000/appointments \
-H "Content-Type: application/json" \
-d '{"date": "2025-01-01", "time": "10:00"}'
```

### Example Request to Cancel an Appointment
```bash
curl -X DELETE http://localhost:3000/appointments \
-H "Content-Type: application/json" \
-d '{"date": "2025-01-01", "time": "10:00"}'
```

### Example Request to Get Available Slots
```bash
curl -X GET "http://localhost:3000/appointments/slots?date=2025-01-01"
```


## API Constraints

- **Create Appointment**:
  - Cannot book appointments on weekends if `isWeekendOff` is true.
  - Time must be within operational hours.
  - Cannot exceed the maximum slots per appointment.
  - Cannot book appointments with past date / time.

- **Cancel Appointment**:
  - Cannot cancel appointments with past date / time.
  - Time must be within operational hours.
 
- **Get Available Slots**:
  - Date must be in the format `YYYY-MM-DD`.
  - Only returns slots within operational hours.

- **Update Configuration**:
  - `slotDuration` must be at least 5 minutes.
  - `maxSlotsPerAppointment` must be between 1 and 5.
  - `unavailableHours` must be within operational hours.