# Movie Ticket Booking System

A Movie ticket booking system is build using TypeScript, Express.js, Kysely with SQLite, Zod, Vitest, supertest, ESLint, and Prettier.

## Technical Stack
- TypeScript
- Express.js
- Kysely
- Better-sqlite3
- Zod
- Vitest
- supertest
- ESLint
- Prettier

## Installation

1. Clone the repository

    ```bash
    git clone https://github.com/RaimisM/Movie-ticket-booking-system.git
   ```
2. Install dependencies
    ```bash
    npm install
   ```
3. Run server
    ```bash
    npm run dev
   ```
4. Run unit tests
    ```bash
    npm test
   ```
5. Run with coverage
    ```bash
    npm run test:coverage
   ```
## Requirements
### Administrator Requirements:
1. Create New Screenings
    - Input:
        - Movie ID (must exist in the database)
        - Screening timestamp (must be in the future)
        - Total ticket allocation (must be a positive integer)
    - Output:
        - Created screening details including ID, movie information, timestamp, and ticket allocation
    - Constraints:
        - Cannot create screenings for non-existent movies
        - Screening time must be in the future
        - Ticket allocation must be a positive integer
2. Delete Screenings (Optional)
    - Input: Screening ID
    - Output: Confirmation of deletion
    - Constraints:
        - Can only delete screenings that have no tickets booked
        - Screening must exist
3. Update Screening Ticket Allocation (Optional)
    - Input:
        - Screening ID
        - New ticket allocation
        - Total ticket allocation (must be a positive integer)
    - Output: Updated screening details
    - Constraints:
        - Cannot reduce allocation below the number of tickets already booked
        - New allocation must be a positive integer
        - Screening must exist
### User Requirements:
#### Movie Information
1. Get Movies by IDs
    - Input: List of movie IDs (query parameter)
    - Output: List of movies with their title and year
    - Constraints:
        - If a provided ID doesn't exist, it should be omitted from the results
#### Screening Information
1. Get Movies by IDs
    - Input: Optional filters (e.g., date range, movie ID)
    - Output: List of screenings with:
        - Screening ID
        - Movie title and year
        - Timestamp
        - Total tickets
        - Tickets remaining
    - Constraints:
        - Only return screenings with available tickets
        - Only show screenings scheduled in the future
#### Ticket Management
1. List User Bookings
    - Input: User ID
    - Output: List of bookings including:
        - Booking ID
        - Movie title and year
        - Screening timestamp
        - Number of tickets booked
    - Constraints:
        - Only return bookings for the specified user
2. Create Booking
    - Input:
        - User ID
        - Screening ID
        - Number of tickets to book
    - Output: Booking confirmation with details
    - Constraints:
        - Screening must exist
        - Screening must have enough tickets available
        - Number of tickets must be positive
        - Cannot book tickets for past screenings


## Setup

**Note:** For this exercise, we have provided an `.env` file with the database connection string. Normally, you would not commit this file to version control. We are doing it here for simplicity and given that we are using a local SQLite database.

## Migrations

Before running the migrations, we need to create a database. We can do this by running the following command:

```bash
npm run migrate:latest
```

## Running the server

In development mode:

```bash
npm run dev
```

In production mode:

```bash
npm run start
```

## Updating types

If you make changes to the database schema, you will need to update the types. You can do this by running the following command:

```bash
npm run generate-types
```
