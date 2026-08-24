# Event Management System

A modern, full-stack event management platform supporting Web and Mobile clients, built with a robust, scalable architecture.

## 🚀 Tech Stack (Migrated Architecture)

### Backend (API)
- **Runtime:** Node.js + Express.js
- **Language:** TypeScript
- **Database:** MySQL
- **Driver:** `mysql2` (Raw SQL queries, No ORM)
- **Validation:** Zod
- **Auth:** JWT + bcrypt

### Frontend (Web)
- **Framework:** React
- **Bundler:** Vite
- **Language:** TypeScript
- **Styling:** Custom CSS (Glassmorphism, Dark Mode)
- **Routing:** React Router DOM

### Mobile (iOS/Android)
- **Framework:** React Native
- **Toolchain:** Expo
- **Language:** TypeScript

## 📂 Project Structure
- `/backend`: The Express + MySQL REST API
- `/frontend`: The Vite + React Web Application
- `/mobile`: The Expo React Native Application

## 🛠️ Quick Start

**1. Setup Database**
```bash
cd backend
# Drop/Create DB
mysql -u root -p -e "DROP DATABASE IF EXISTS event_management; CREATE DATABASE event_management;"
# Load Schema
mysql -u root -p event_management < src/config/schema.sql
```

**2. Run Backend**
```bash
cd backend
npm install
npm run dev
```

**3. Run Frontend (Web)**
```bash
cd frontend
npm install
npm run dev
```

**4. Run Mobile (App)**
```bash
cd mobile
npm install
npm run ios
```
