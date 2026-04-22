import type { AuthSession, User } from '../../types/models';

/**
 * Mock authentication service.
 * Accepts any email/password — use this until a real auth backend is wired.
 *
 * TODO: Replace with real JWT auth (backend/auth endpoint or Supabase/Firebase).
 */

const MOCK_USER_PASSWORD = 'password'; // any password works in mock mode

function fakeDelay(ms = 600): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

function makeMockSession(email: string, displayName: string): AuthSession {
  const user: User = {
    id: 'user-1',
    email,
    displayName,
    createdAt: Date.now() - 30 * 24 * 60 * 60_000,
    avatarUrl: null,
  };
  return {
    user,
    accessToken: `mock-access-${Date.now()}`,
    refreshToken: `mock-refresh-${Date.now()}`,
    expiresAt: Date.now() + 7 * 24 * 60 * 60_000,
  };
}

export async function mockLogin(email: string, _password: string): Promise<AuthSession> {
  await fakeDelay(800);
  if (!email.includes('@')) throw new Error('Invalid email address.');
  const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return makeMockSession(email, name);
}

export async function mockSignUp(
  email: string,
  _password: string,
  displayName: string,
): Promise<AuthSession> {
  await fakeDelay(1000);
  if (!email.includes('@')) throw new Error('Invalid email address.');
  return makeMockSession(email, displayName);
}

export async function mockResetPassword(_email: string): Promise<void> {
  await fakeDelay(700);
  // In mock mode: always succeeds
}
