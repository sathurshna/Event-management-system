# Developer Setup Guide

This guide walks through setting up the Eventra environment from scratch for local development.

## 1. Prerequisites
- **Node.js**: v18.0 or higher.
- **NPM**: v9.0 or higher.
- **MySQL**: MySQL Server v8.0+ running locally or via Docker.
- **Expo Go App**: Installed on your physical iOS or Android device.

---

## 2. Database Initialization
Before running the backend, the MySQL database schema must be initialized.
We use raw SQL (`mysql2`) rather than an ORM, so the database layout is explicitly defined in `schema.sql`.

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Log in to MySQL as root and create the database:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS event_management;"
   ```
3. Load the schema into the new database:
   ```bash
   mysql -u root -p event_management < src/config/schema.sql
   ```

---

## 3. Environment Variables
You must set up environment variables for the backend to connect to the database and generate auth tokens.

1. Create a `.env` file inside the `backend/` directory:
   ```bash
   cd backend
   touch .env
   ```
2. Paste the following configuration (update `DB_PASSWORD` to match your local MySQL root password):
   ```env
   # Server
   PORT=4000
   
   # Database (MySQL)
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_secure_password
   DB_NAME=event_management
   
   # Authentication
   JWT_SECRET=super_secret_jwt_key
   
   # Frontend URL (For CORS & Email Invite Links)
   CLIENT_URL=http://localhost:5173
   ```

---

## 4. Running the Project

Because this project is decoupled, you will need to run three separate terminal sessions to start the full stack.

### Terminal 1: Backend API
```bash
cd backend
npm install
npm run dev
```
*The API will start at `http://localhost:4000`. You should also see a log indicating that the node-cron reminder scheduler has started.*

### Terminal 2: Web Client
```bash
cd frontend/web
npm install
npm run dev
```
*The React Vite app will be accessible at `http://localhost:5173`. CORS is configured on the backend to accept requests from this port.*

### Terminal 3: Mobile Client
```bash
cd frontend/mobile
npm install
npx expo start
```
*A QR code will appear in the terminal. Open the Expo Go app on your phone, scan the QR code, and the React Native app will bundle and load.*

---

## 5. Troubleshooting 
- **ECONNREFUSED on Mobile**: If the mobile app fails to connect to the backend, ensure your phone and computer are on the exact same Wi-Fi network. You may need to change API URLs in the React Native source code from `localhost:4000` to your computer's local IP address (e.g., `192.168.1.100:4000`).
- **Database Errors**: If the backend throws ER_NO_SUCH_TABLE errors, ensure you successfully ran Step 2 and populated the schema.
- **Expo SDK 57 Compatibility**: This project is built using Expo SDK ~57. If you get a "Version mismatch" or "SDK not supported" error when scanning the QR code, please ensure your physical device's Expo Go app is fully updated to the latest version via the App Store / Play Store.
