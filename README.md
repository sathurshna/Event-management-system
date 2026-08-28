<div align="center">
  
# 🗓️ Eventra 
# Event Management System

A modern, full-stack event management platform supporting beautiful Web and Mobile client applications. Plan, host, discover, and RSVP to events with ease!

![Architecture](https://img.shields.io/badge/Architecture-REST_API-indigo.svg)
![Backend](https://img.shields.io/badge/Backend-Express.js_%7C_MySQL-green.svg)
![Web](https://img.shields.io/badge/Web-React_%7C_Vite-blue.svg)
![Mobile](https://img.shields.io/badge/Mobile-React_Native_%7C_Expo-black.svg)

</div>

## ✨ Key Features

- **Cross-Platform Access:** Fully functional React Web Dashboard and a companion React Native (Expo) Mobile App.
- **Dynamic Calendar Views:** Color-coded calendar interface separating personal events from public discoveries.
- **RSVP & Invites:** Send email invites to guests and track live RSVP statuses (Attending, Maybe, Declined).
- **Real-Time Notifications:** Live polling for in-app unread notifications and dropdown panels.
- **Background Cron Jobs:** Automated reminders sent exactly 24 hours before an event begins.
- **Glassmorphic UI:** A highly polished, modern user interface featuring dark mode and translucent glass elements.

---

## 🚀 Tech Stack

### Backend (API)
- **Runtime:** Node.js + Express.js
- **Database:** MySQL
- **Driver:** `mysql2` (Raw SQL architecture—optimized for high performance without ORM overhead)
- **Validation:** Zod
- **Auth:** JWT + bcrypt

### Frontend (Web)
- **Framework:** React + TypeScript
- **Bundler:** Vite
- **Styling:** Custom CSS (Glassmorphism, CSS Variables)
- **Routing:** React Router DOM
- **Components:** FullCalendar, Lucide Icons

### Mobile (iOS/Android)
- **Framework:** React Native + TypeScript
- **Toolchain:** Expo
- **Navigation:** Expo Router (`app/` directory)

---

## 📂 Project Structure

```text
📦 Event Management System
 ┣ 📂 backend/         # Express REST API & MySQL Database logic
 ┣ 📂 frontend/
 ┃ ┗ 📂 web/           # React Web Application
 ┗ 📂 frontend/
   ┗ 📂 mobile/        # React Native (Expo) Application
```

---

## 🛠️ Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MySQL Server (running locally or remotely)
- Expo Go App (on your mobile device for testing)

### 1. Setup the Database
Create the database and load the schema directly into MySQL:
```bash
cd backend
mysql -u root -p -e "DROP DATABASE IF EXISTS event_management; CREATE DATABASE event_management;"
mysql -u root -p event_management < src/config/schema.sql
```

### 2. Configure Environment Variables
Inside the `backend/` directory, create a `.env` file and configure your variables:
```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=event_management
JWT_SECRET=super_secret_key
CLIENT_URL=http://localhost:5173
```

### 3. Run the Backend API
Start the Node.js server.
```bash
cd backend
npm install
npm run dev
```

### 4. Run the Web Application
Start the React Vite development server.
```bash
cd frontend/web
npm install
npm run dev
```

### 5. Run the Mobile App
Start the Expo Metro bundler. Scan the generated QR code using the **Expo Go** app on your phone.
```bash
cd frontend/mobile
npm install
npx expo start
```

---

## 🚀 Future Improvements & Production Readiness

While the current application is fully functional, moving to a production environment requires a few final setup steps:

### 1. Real Email Integration (Nodemailer)
The application is currently designed to use local/development configurations for the email service. For production, you must use a real authenticated SMTP provider (e.g. Gmail, SendGrid, Amazon SES) so that invites and reminders actually reach users' inboxes.

**Gmail Example Setup:**
Generate a 16-character [Google App Password](https://myaccount.google.com/) under Security > 2-Step Verification, then update the backend `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=your_real_email@gmail.com
SMTP_PASS=your_16_char_app_password
```

### 2. Expo Application Services (EAS) Setup
Push notifications are currently delivered as local notifications in the simulator for testing. To send native push notifications over the air to real devices, link the Expo project to an EAS backend by running `eas init` in the mobile directory and providing a real `projectId` to the notification service.

