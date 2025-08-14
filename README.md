# Booking Management System

A PayloadCMS-based booking management system with automatic waitlist promotion, notifications, and logs.

---

## Table of Contents
1. [Setup Instructions](#setup-instructions)  
2. [Architecture](#architecture)  
3. [Sample Workflows](#sample-workflows)  
4. [Demo Credentials](#demo-credentials)  
5. [Deployment Guide](#deployment-guide)  

---

## Setup Instructions

Follow these steps to get the project running locally:

1. **Clone the repository**
```bash
git clone https://github.com/NANTHA2001/weframetech-backend.git
cd weframetech-backend

2. **Install dependencies**
    npm install
    # or
    yarn install

3. Setup environment variables
Create a .env file at the root with:

  DATABASE_URL=""
  PAYLOAD_SECRET=""
  PAYLOAD_PUBLIC_SERVER_URL=""

  
### Setting up Neon PostgreSQL Database

1. **Sign up / Log in to Neon**  
   Go to [https://neon.tech](https://neon.tech) and create an account or log in.

2. **Create a new project**  
   - Click **New Project**.  
   - Enter a project name (e.g., `booking-system`).  
   - Choose a region closest to your server.

3. **Create a database branch**  
   - Click **Create Branch** (usually `main`).  
   - This will automatically provision a PostgreSQL database.

4. **Get the connection string**  
   - Go to **Settings → Connection Strings**.  
   - Copy the `PostgreSQL URI` (it looks like `postgres://<username>:<password>@<host>:<port>/<database>`).

5. **Add the connection string to your project**  
   - Create a `.env` file in the project root if it doesn’t exist.  
   - Add the following:

```ini
DATABASE_URL=postgres://<username>:<password>@<host>:<port>/<database>
PAYLOAD_SECRET=<your-secret-key>
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000


4. Architecture

src/
│
├─ payload.config.ts 
│
├─ access/ 
│ ├─ roles.ts 
│ └─ tenant.ts 
│
├─ collections/ 
│ ├─ Tenants.ts
│ ├─ Users.ts
│ ├─ Events.ts
│ ├─ Bookings.ts
│ ├─ Notifications.ts
│ └─ BookingLogs.ts
│
├─ routes/ 
│ ├─ booking.ts
│ └─ dashboard.ts
│
├─ utils/
│ ├─ notifications.ts 
│ ├─ logs.ts 
│ └─ promotion.ts 
│
└─ seed/ 
└─ seed.ts

## Logic Overview

- **Bookings collection:** Manages event bookings with status (`confirmed`, `waitlisted`, `canceled`).  
- **BookingLogs collection:** Records every booking change with action and notes.  
- **Utils:**
  - `writeBookingLog`: Creates a log entry after each booking change.  
  - `createNotificationForStatus`: Sends notifications to users when their booking status changes.  
  - `promoteOldestWaitlisted`: Automatically promotes the oldest waitlisted user when a confirmed booking is canceled.  
- **Hooks:** `beforeValidate` and `afterChange` ensure capacity checks, automatic promotion, notifications, and logs.  

---

## Sample Workflows

### 1. Booking Creation
1. User creates a booking.  
2. Status is set:
   - If event capacity is available → `confirmed`  
   - Else → `waitlisted`  
3. Log entry is created with action: `create_request` or `auto_waitlist`.  

### 2. Booking Cancellation
1. Admin cancels a confirmed booking.  
2. Booking status is updated to `canceled`.  
3. Oldest waitlisted booking is promoted to `confirmed`.  
4. Logs and notifications are generated for both canceled and promoted bookings.  

### 3. Waitlist Promotion
1. If a spot opens up in a fully booked event:  
   - The oldest waitlisted booking is promoted.  
   - `_promoted` flag is set to `true`.  
   - Notifications are sent and logs are created.  


##Demo Credentials

| Role     | Email                    | Password  |
| -------- | ------------------------ | --------- |
| Admin    | [admin@example.com]      | Admin@123  | # use this
| Reviewer | [reviewer@example.com]   | review123 |



## Deployment Guide

### Deploy to Vercel

1. Push your repository to GitHub/GitLab.  
2. Create a new Vercel project and connect your repository.  
3. Set environment variables in Vercel:

```ini
PAYLOAD_SECRET=<your-secret-key>
DATABASE_URL=<your-db-connection-string>
PAYLOAD_PUBLIC_SERVER_URL=<your-deployed-url>

4. Set the build command:
  npm run build

5.Set the output directory to:
  .
6. Start the server with:
   npm run start