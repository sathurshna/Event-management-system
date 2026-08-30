"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invitationSchema = exports.rsvpSchema = exports.updateEventSchema = exports.createEventSchema = exports.loginSchema = exports.registerSchema = exports.validate = void 0;
const zod_1 = require("zod");
// ─── Validation Middleware Factory ────────────────────────────────────────────
const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            const errors = result.error.errors.map((e) => ({
                field: e.path.join('.'),
                message: e.message,
            }));
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors,
            });
        }
        // Replace req.body with the parsed (type-safe) data
        req.body = result.data;
        next();
    };
};
exports.validate = validate;
// ─── Auth Schemas ─────────────────────────────────────────────────────────────
exports.registerSchema = zod_1.z.object({
    name: zod_1.z
        .string({ required_error: 'Name is required' })
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name cannot exceed 50 characters')
        .trim(),
    email: zod_1.z
        .string({ required_error: 'Email is required' })
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    password: zod_1.z
        .string({ required_error: 'Password is required' })
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: 'Email is required' })
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    password: zod_1.z
        .string({ required_error: 'Password is required' })
        .min(1, 'Password is required'),
});
// ─── Event Schemas ────────────────────────────────────────────────────────────
exports.createEventSchema = zod_1.z.object({
    title: zod_1.z
        .string({ required_error: 'Title is required' })
        .min(3, 'Title must be at least 3 characters')
        .max(255, 'Title cannot exceed 255 characters'),
    description: zod_1.z.string().optional(),
    date: zod_1.z.string().datetime({ message: 'Invalid date format' }),
    endDate: zod_1.z.string().datetime({ message: 'Invalid end date format' }).optional(),
    location: zod_1.z.string().max(255).optional(),
    isPublic: zod_1.z.boolean().default(false),
    coverImage: zod_1.z.string().optional().nullable(),
});
exports.updateEventSchema = exports.createEventSchema.partial();
// ─── RSVP & Invitation Schemas ────────────────────────────────────────────────
exports.rsvpSchema = zod_1.z.object({
    status: zod_1.z.enum(['ATTENDING', 'MAYBE', 'DECLINED'], { required_error: 'Status is required' }),
    note: zod_1.z.string().max(500).optional().nullable(),
});
exports.invitationSchema = zod_1.z.object({
    email: zod_1.z
        .string({ required_error: 'Email is required' })
        .email('Please provide a valid email address')
        .toLowerCase()
        .trim(),
    force: zod_1.z.boolean().optional(),
});
