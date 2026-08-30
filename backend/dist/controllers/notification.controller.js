"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markAllAsRead = exports.markAsRead = exports.getMyNotifications = void 0;
const db_1 = require("../config/db");
const getMyNotifications = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const [notifications] = await db_1.pool.execute('SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC', [userId]);
        res.status(200).json({ success: true, data: notifications });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyNotifications = getMyNotifications;
const markAsRead = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params;
        const [result] = await db_1.pool.execute('UPDATE notifications SET is_read = true WHERE id = ? AND user_id = ?', [id, userId]);
        res.status(200).json({ success: true, message: 'Notification marked as read' });
    }
    catch (error) {
        next(error);
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res, next) => {
    try {
        const userId = req.user.userId;
        await db_1.pool.execute('UPDATE notifications SET is_read = true WHERE user_id = ? AND is_read = false', [userId]);
        res.status(200).json({ success: true, message: 'All notifications marked as read' });
    }
    catch (error) {
        next(error);
    }
};
exports.markAllAsRead = markAllAsRead;
