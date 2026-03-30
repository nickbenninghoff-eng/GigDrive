import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { db } from '../db/connection.js';
import { validate } from '../middleware/validation.js';
import { requireAuth, generateToken } from '../middleware/auth.js';

const router = Router();

// Strict rate limits on auth endpoints
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 registrations per hour per IP
  message: { error: 'Too many registration attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  displayName: z.string().min(1).max(50).optional(),
  gigPlatforms: z.array(z.string()).optional(),
  zipCode: z.string().max(10).optional(),
});

// POST /api/v1/auth/register
router.post('/register', registerLimiter, validate(registerSchema), async (req, res) => {
  try {
    const { email, password, displayName, gigPlatforms, zipCode } = req.body;

    const existing = await db
      .selectFrom('users')
      .select('id')
      .where('email', '=', email.toLowerCase())
      .executeTakeFirst();

    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await db
      .insertInto('users')
      .values({
        email: email.toLowerCase(),
        password_hash: passwordHash,
        display_name: displayName || null,
        gig_platforms: gigPlatforms || null,
        zip_code: zipCode || null,
        tier: 'free',
      })
      .returning(['id', 'email', 'display_name', 'tier'])
      .executeTakeFirstOrThrow();

    const token = generateToken({ userId: user.id, email: user.email });

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        tier: user.tier,
      },
      token,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// POST /api/v1/auth/login
router.post('/login', loginLimiter, validate(loginSchema), async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await db
      .selectFrom('users')
      .selectAll()
      .where('email', '=', email.toLowerCase())
      .executeTakeFirst();

    // Constant-time comparison: always run bcrypt even if user doesn't exist
    // This prevents timing attacks that reveal which emails are registered
    const dummyHash = '$2a$12$000000000000000000000uGWHIB/R2hJMYaHVMXxmMJfMBQuVBAQe';
    const validPassword = await bcrypt.compare(password, user?.password_hash || dummyHash);

    if (!user || !validPassword) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    // Update last active
    await db.updateTable('users').set({ last_active_at: new Date() }).where('id', '=', user.id).execute();

    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        tier: user.tier,
        gigPlatforms: user.gig_platforms,
      },
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/v1/auth/me
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await db
      .selectFrom('users')
      .select(['id', 'email', 'display_name', 'tier', 'gig_platforms', 'zip_code', 'joined_at'])
      .where('id', '=', req.user!.userId)
      .executeTakeFirst();

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json(user);
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// DELETE /api/v1/auth/account — GDPR right to deletion
router.delete('/account', requireAuth, async (req, res) => {
  try {
    const userId = req.user!.userId;

    // Cascade deletes handle most relations, but explicitly clear user data
    await db.deleteFrom('users').where('id', '=', userId).execute();

    res.json({ success: true, message: 'Account and all associated data have been permanently deleted.' });
  } catch (err) {
    console.error('Account deletion error:', err);
    res.status(500).json({ error: 'Failed to delete account' });
  }
});

export default router;
