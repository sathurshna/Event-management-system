# Eventra - Event Management Platform

![Eventra Cover](https://via.placeholder.com/1200x400?text=Eventra)

Eventra is a modern, full-stack event management application that allows users to seamlessly discover, create, and manage events. Designed with a sleek "glassmorphism" aesthetic, Eventra delivers a premium user experience across both Web and Mobile platforms.

## 🌐 Live Deployments

| Platform | Link |
|---|---|
| 🌍 **Web App** | [event-management-system-chi-bice.vercel.app](https://event-management-system-chi-bice.vercel.app) |
| ⚙️ **Backend API** | [event-management-system-a0j8.onrender.com](https://event-management-system-a0j8.onrender.com) |
| 🗄️ **Database** | [Railway MySQL](https://railway.app) — hosted on Railway |
| 📱 **Android APK** | [Download from EAS](https://expo.dev/accounts/sathurshnau/projects/eventra/builds/71fbbec7-76d8-450f-b274-e9646b7eaa5f) |
| 📲 **Expo Go (Mobile)** | `@sathurshnau/eventra` on Expo Go |

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

#### 📱 Testing on a Device

**Option A — iOS Simulator (Mac only, free)**
> Requires [Xcode](https://apps.apple.com/app/xcode/id497799835) installed from the Mac App Store.
```bash
npx expo start --ios
```

**Option B — Android Emulator**
> Requires [Android Studio](https://developer.android.com/studio) installed.
```bash
npx expo start --android
```

**Option C — Real Android Phone (direct APK install)**
```bash
# Build a preview APK via EAS (requires free Expo account)
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```
When the build finishes, you'll get a download link. Open it on the Android phone and install the APK directly. You may need to enable **"Install from unknown sources"** in phone Settings → Apps → Special app access.

**Option D — Real iPhone via Expo Go**
1. Install **Expo Go** from the App Store
2. Sign in with the project owner's Expo account
3. Search for `@sathurshnau/eventra` inside Expo Go

#### 🚀 Publishing an OTA Update (EAS Update)
```bash
cd frontend/mobile
eas update --branch preview --message "your message" --platform all
```

#### 📦 Publishing to Play Store / App Store
```bash
# Android (.aab for Play Store)
eas build --platform android --profile production
eas submit --platform android

# iOS (requires Apple Developer account - $99/year)
eas build --platform ios --profile production
eas submit --platform ios
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
