import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// ─── Validation Middleware Factory ────────────────────────────────────────────

export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
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

// ─── Auth Schemas ─────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .trim(),

  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password is required'),
});

// ─── Event Schemas ────────────────────────────────────────────────────────────

export const createEventSchema = z.object({
  title: z
    .string({ required_error: 'Title is required' })
    .min(3, 'Title must be at least 3 characters')
    .max(255, 'Title cannot exceed 255 characters'),
  description: z.string().optional(),
  date: z.string().datetime({ message: 'Invalid date format' }),
  endDate: z.string().datetime({ message: 'Invalid end date format' }).optional(),
  location: z.string().max(255).optional(),
  isPublic: z.boolean().default(false),
  coverImage: z.string().optional().nullable(),
});

export const updateEventSchema = createEventSchema.partial();

// ─── RSVP & Invitation Schemas ────────────────────────────────────────────────

export const rsvpSchema = z.object({
  status: z.enum(['ATTENDING', 'MAYBE', 'DECLINED'], { required_error: 'Status is required' }),
  note: z.string().max(500).optional().nullable(),
});

export const invitationSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),
  force: z.boolean().optional(),
});

// ─── TypeScript Types from Schemas ────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type RsvpInput        = z.infer<typeof rsvpSchema>;
export type InvitationInput  = z.infer<typeof invitationSchema>;
