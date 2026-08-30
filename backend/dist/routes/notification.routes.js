"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const notification_controller_1 = require("../controllers/notification.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect); // All notification routes require auth
router.get('/', notification_controller_1.getMyNotifications);
router.put('/read-all', notification_controller_1.markAllAsRead);
router.put('/:id/read', notification_controller_1.markAsRead);
exports.default = router;
