"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 4000;
// ─── Security & Parsing Middleware ────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true, // allow cookies from frontend
}));
app.use(express_1.default.json({ limit: '20mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '20mb' }));
app.use((0, cookie_parser_1.default)());
app.use((0, morgan_1.default)('dev'));
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// ─── Routes ───────────────────────────────────────────────────────────────────
const event_routes_1 = __importDefault(require("./routes/event.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const rsvp_routes_1 = __importDefault(require("./routes/rsvp.routes"));
const invitation_routes_1 = __importDefault(require("./routes/invitation.routes"));
app.use('/api/auth', auth_routes_1.default);
app.use('/api/events', event_routes_1.default);
app.use('/api/notifications', notification_routes_1.default);
app.use('/api/rsvps', rsvp_routes_1.default);
app.use('/api/invites', invitation_routes_1.default);
// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ─── Cron Jobs ────────────────────────────────────────────────────────────────
const reminders_1 = require("./cron/reminders");
(0, reminders_1.initCronJobs)();
// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
exports.default = app;
