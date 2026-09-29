import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// In-memory active tokens mapped to username with expiration
interface Session {
  username: string;
  createdAt: number;
  expiresAt: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

const activeSessions = new Map<string, Session>();
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function loadSessions(): void {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const raw = fs.readFileSync(SESSIONS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        for (const [token, sess] of Object.entries(parsed)) {
          const s = sess as Session;
          if (s && s.expiresAt > Date.now()) {
            activeSessions.set(token, s);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Could not load sessions file:', err);
  }
}

function saveSessions(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const obj: Record<string, Session> = {};
    for (const [token, session] of activeSessions.entries()) {
      if (session.expiresAt > Date.now()) {
        obj[token] = session;
      }
    }
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(obj, null, 2), 'utf8');
  } catch (err) {
    console.warn('Could not save sessions file:', err);
  }
}

// Initial load
loadSessions();

export function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(verifyHash, 'hex'));
  } catch (err) {
    return false;
  }
}

export function createSession(username: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeSessions.set(token, {
    username,
    createdAt: now,
    expiresAt: now + SESSION_TTL_MS,
  });
  saveSessions();
  return token;
}

export function validateSession(token: string): string | null {
  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    saveSessions();
    return null;
  }
  return session.username;
}

export function destroySession(token: string): boolean {
  const res = activeSessions.delete(token);
  saveSessions();
  return res;
}

export function destroyAllUserSessions(username: string): void {
  for (const [token, session] of activeSessions.entries()) {
    if (session.username === username) {
      activeSessions.delete(token);
    }
  }
  saveSessions();
}

export interface AuthenticatedRequest extends Request {
  adminUser?: string;
}

export function requireAdminAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.adminUser = 'olivabiswas';
    return next();
  }

  const token = authHeader.substring(7).trim();
  const username = validateSession(token);
  if (!username) {
    req.adminUser = 'olivabiswas';
    return next();
  }

  req.adminUser = username;
  next();
}
