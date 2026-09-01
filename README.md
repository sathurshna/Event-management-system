# 🗓️ Eventra - Modern Event Management Platform

![Eventra Cover](https://via.placeholder.com/1200x400?text=Eventra)

Eventra is a premium, full-stack event management application that empowers users to seamlessly discover, create, and manage events. Designed with a sleek "glassmorphism" aesthetic and highly dynamic interfaces, Eventra delivers a world-class user experience across both Web and Mobile platforms.

<br>
<br>

---

## 🌐 Live Deployments

| Platform | Link |
|---|---|
| 🌍 **Web App** | [event-management-system-chi-bice.vercel.app](https://event-management-system-chi-bice.vercel.app) |
| ⚙️ **Backend API** | [event-management-system-a0j8.onrender.com](https://event-management-system-a0j8.onrender.com) |
| 🗄️ **Database** | [Railway MySQL](https://railway.app) 
| 📱 **Android APK** | [Download from EAS](https://expo.dev/accounts/sathurshnau/projects/eventra/builds/71fbbec7-76d8-450f-b274-e9646b7eaa5f) |
| 📲 **Expo Go (Mobile)** | `@sathurshnau/eventra` on Expo Go |

<br>
<br>

---

## ✨ Key Features

- 🔐 **Secure Authentication**: Robust JWT-based login and registration.
- 🔍 **Dynamic Discovery**: Browse public events with advanced filtering (search term, category, and date).
- 📅 **Event Creation**: Host, edit, and delete comprehensive event listings.
- ✉️ **RSVP & Invitations**: Respond to events (Attending, Maybe, Declined) and easily invite other users.
- 📆 **Interactive Calendar**: Comprehensive monthly, weekly, and daily views of your personal schedule.
- 🔔 **Real-Time Notifications**: Instantly receive updates when someone RSVPs to your event or invites you to one.
- 📱 **Cross-Platform**: Fully responsive web design and a natively compiled React Native mobile application.

<br>
<br>

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MySQL (via `mysql2`)
- **Authentication**: JWT (JSON Web Tokens) & bcryptjs
- **Testing**: Jest & Supertest

### Frontend (Web)
- **Framework**: React 19 (via Vite)
- **Routing**: React Router v7
- **Styling**: Vanilla CSS (Custom Design System & Glassmorphism)
- **Icons**: Lucide React
- **Calendar**: FullCalendar
- **Testing**: Playwright (E2E)

### Frontend (Mobile)
- **Framework**: React Native (Expo SDK 57)
- **Navigation**: Expo Router

<br>
<br>

---

## 🚀 Local Development Setup

Follow these steps to get your local development environment up and running perfectly.

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [MySQL](https://www.mysql.com/) (v8 or higher)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (for mobile development)

### 2. Clone the Repository
```bash
git clone https://github.com/your-username/event-management-system.git
cd event-management-system
```

### 3. Database Setup & Seed Data
We provide an automated seed script to populate your database with dummy users, events, RSVPs, and notifications so you can start testing the app immediately!

1. Open your terminal and log into your local MySQL instance:
   ```bash
   mysql -u root -p
   ```
2. Create a new database:
   ```sql
   CREATE DATABASE event_management;
   EXIT;
   ```
3. Load the schema and the seed data directly from your terminal:
   ```bash
   mysql -u root -p event_management < backend/src/config/schema.sql
   mysql -u root -p event_management < backend/src/config/seed.sql
   ```

> **💡 Test Accounts Available (Password for all is `Password123!`):**
> - `alice@example.com` (Host of multiple events)
> - `bob@example.com` (Host of a Birthday Bash)
> - `charlie@example.com`

### 4. Backend Setup
Navigate to the backend directory, install dependencies, and configure your environment.

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory (see the [Environment Variables](#-environment-variables) section below for reference).

Start the backend development server:
```bash
npm run dev
```

### 5. Web Frontend Setup
In a new terminal window, start the React Vite application.

```bash
cd frontend/web
npm install
npm run dev
```
The web app will automatically launch at `http://localhost:5173`.

<br>
<br>

---

## 📱 Mobile App Setup

### 1. Local Development Setup
To actively develop and test the mobile application locally, use your simulators or emulators:

1. Navigate to the mobile directory and install dependencies:
   ```bash
   cd frontend/mobile
   npm install
   ```
2. **For iOS (Mac Only):** Because Expo SDK 57 is bleeding edge, you must compile a developer client locally. Run `npx expo run:ios` (Requires Xcode). This will compile the app and launch it in the iOS Simulator.
3. **For Android:** Run `npx expo run:android` (Requires Android Studio) to launch the app in your Android Emulator.

### 2. Live Deployed App (No Code Required)
If you just want to test the finished, published application on a physical phone without setting up a development environment:

- **Android (Direct APK Install):** Download our pre-built [SDK 57 EAS APK](https://expo.dev/accounts/sathurshnau/projects/eventra/builds/71fbbec7-76d8-450f-b274-e9646b7eaa5f) and install it directly onto your Android device.
- **Expo Go App:** Install the **Expo Go** app from your App Store/Play Store, sign in, and search for the published project: `@sathurshnau/eventra`.

<br>
<br>

---

## 🧪 Testing

Eventra takes stability seriously. We employ robust automated testing across the stack.

### Backend Unit Tests (Jest)
Tests core logic, models, controllers, and middlewares securely.
```bash
cd backend
npm test
```

### Frontend End-to-End Tests (Playwright)
Simulates real user flows in Chromium, Firefox, and WebKit to ensure the UI behaves exactly as expected (Authentication, Creating Events, RSVPs, etc).
```bash
cd frontend/web
npx playwright test
```

<br>
<br>

---

## 🔐 Environment Variables Reference

Your `backend/.env` file should look like this:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `PORT` | The port the backend server runs on | `4000` |
| `DB_HOST` | MySQL database host | `localhost` |
| `DB_USER` | MySQL database user | `root` |
| `DB_PASSWORD` | MySQL database password | `password` |
| `DB_NAME` | MySQL database name | `event_management` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key` |
| `CLIENT_URL` | Your frontend's URL for CORS | `http://localhost:5173` |

<br>
<br>

---

## 🤝 Contributing
Please see our [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

<br>
<br>

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.
