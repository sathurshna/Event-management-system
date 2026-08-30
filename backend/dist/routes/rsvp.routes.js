"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const rsvp_controller_1 = require("../controllers/rsvp.controller");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.protect);
router.get('/me', rsvp_controller_1.getMyRsvps);
exports.default = router;
