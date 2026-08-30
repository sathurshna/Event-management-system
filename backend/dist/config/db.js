"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.pool = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const env_1 = require("./env");
// Create a connection pool to handle multiple concurrent requests
exports.pool = promise_1.default.createPool({
    uri: env_1.env.DATABASE_URL,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    timezone: '+00:00', // Force UTC so stored datetimes are read back correctly
});
// Function to test the connection (optional, can be called at startup)
const connectDB = async () => {
    try {
        const connection = await exports.pool.getConnection();
        console.log('✅ Connected to MySQL Database');
        connection.release();
    }
    catch (error) {
        console.error('❌ MySQL Connection Failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
