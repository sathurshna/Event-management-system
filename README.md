# Eventra - Event Management Platform

![Eventra Cover](https://via.placeholder.com/1200x400?text=Eventra)

Eventra is a modern, full-stack event management application that allows users to seamlessly discover, create, and manage events. Designed with a sleek "glassmorphism" aesthetic, Eventra delivers a premium user experience across both Web and Mobile platforms.

## ✨ Features

- **User Authentication**: Secure JWT-based login and registration.
- **Event Discovery**: Browse public events with advanced filtering (by search term, category, and date).
- **Event Management**: Create, edit, and delete events.
- **RSVP System**: RSVP to events (Attending, Maybe, Cant Go) and track attendees.
- **Calendar View**: A comprehensive monthly, weekly, and daily view of all your events.
- **Real-time Notifications**: Receive updates when someone RSVPs to your event or invites you to an event.
- **Mobile Support**: Fully responsive web design and a standalone React Native mobile app.

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL (via `mysql2`)
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest & Supertest

### Frontend (Web)
- **Framework**: React 18
- **Routing**: React Router v7
- **Styling**: Vanilla CSS (Custom Design System & Glassmorphism)
- **Icons**: Lucide React
- **Calendar**: FullCalendar
- **Testing**: Playwright

### Frontend (Mobile)
- **Framework**: React Native (Expo)
- **Styling**: StyleSheet
- **Navigation**: React Navigation

## 🚀 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [MySQL](https://www.mysql.com/) (v8 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for mobile development)

## 💻 Local Setup Instructions

### 1. Clone the repository
```bash
git clone https://github.com/your-username/event-management-system.git
cd event-management-system
```

### 2. Database Setup
1. Log into your local MySQL instance.
2. Create a new database: `CREATE DATABASE event_management;`
3. Run the initialization script located in `backend/scripts/init_db.sql` to create all required tables.

### 3. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory using the environment variables reference below.
```bash
npm run dev
```

### 4. Web Frontend Setup
```bash
cd frontend/web
npm install
npm run dev
```
The web app will be accessible at `http://localhost:5173`.

### 5. Mobile App Setup
```bash
cd frontend/mobile
npm install
npx expo start
```

## 🔐 Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `PORT` | The port the backend server runs on | `3000` |
| `DB_HOST` | MySQL database host | `localhost` |
| `DB_USER` | MySQL database user | `root` |
| `DB_PASSWORD` | MySQL database password | `password` |
| `DB_NAME` | MySQL database name | `event_management` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key` |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |

## 🧪 Testing

### Backend Unit Tests
The backend uses Jest for unit testing.
```bash
cd backend
npm test
```

### Frontend End-to-End Tests
The frontend uses Playwright for comprehensive E2E testing.
```bash
cd frontend/web
npx playwright test
```

## 🤝 Contributing
Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
