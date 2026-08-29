# System Architecture

Eventra utilizes a decoupled client-server architecture. The system exposes a centralized REST API backend that services two distinct frontends: a React web application and a React Native mobile application.

## High-Level Architecture Diagram

```mermaid
graph TD
    ClientWeb[Web Client - React / Vite]
    ClientMobile[Mobile Client - React Native / Expo]
    
    API[Backend API - Node.js / Express]
    Cron[Cron Job Service - Event Reminders]
    
    DB[(Database - MySQL)]
    
    ClientWeb <--> |REST (JSON) over HTTP| API
    ClientMobile <--> |REST (JSON) over HTTP| API
    
    API <--> |Raw SQL Queries / mysql2 pooling| DB
    Cron --> |Polls hourly & Writes to| DB
```

## Architectural Components

### 1. The Data Layer (MySQL)
- **Engine**: MySQL 8+
- **Driver**: `mysql2` connection pooling.
- **ORM**: None. The project was deliberately migrated away from an ORM (like Prisma) to raw SQL to optimize query performance for complex calendar joins and dashboard aggregations.

### 2. The API Layer (Node.js + Express)
- **Statefulness**: Completely stateless REST API.
- **Authentication**: JWT-based authentication using short-lived Access Tokens and long-lived Refresh Tokens (stored in the database for secure revocation).
- **Validation**: All incoming requests are strictly validated at runtime using `zod` schema validation middleware.
- **Cron Jobs**: The backend runs a `node-cron` daemon inside the Node process that polls the database every hour and inserts in-app notifications for attendees exactly 24 hours before an event starts.

### 3. The Web Client (React)
- Built for desktop and responsive web viewing using Vite.
- Implements a dynamic UI containing a discovery Dashboard (for public events) and a strictly isolated FullCalendar view (for RSVP'd events).
- Utilizes background polling (every 30 seconds) to fetch unread notifications without requiring WebSockets.

### 4. The Mobile Client (React Native)
- Built using Expo and Expo Router for file-based navigation.
- Consumes the exact same REST API endpoints as the web client.
- Implements a custom bottom-tab navigation bar and slide-up modal interactions optimized for iOS and Android.
