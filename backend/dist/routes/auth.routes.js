"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const validate_1 = require("../middleware/validate");
const router = (0, express_1.Router)();
// Public routes
router.post('/register', (0, validate_1.validate)(validate_1.registerSchema), auth_controller_1.register);
router.post('/login', (0, validate_1.validate)(validate_1.loginSchema), auth_controller_1.login);
router.post('/refresh', auth_controller_1.refresh);
router.post('/logout', auth_controller_1.logout);
// Protected routes (requires valid access token)
router.get('/me', auth_middleware_1.protect, auth_controller_1.getMe);
router.put('/me', auth_middleware_1.protect, auth_controller_1.updateMe);
exports.default = router;
