// frontend/src/actions/auth/cookies.ts
'use server';

import { cookies } from 'next/headers';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Keep these in sync with middleware.ts constants and backend JWT config
const ACCESS_TOKEN_MAX_AGE = 24 * 60 * 60          // 24 hours — matches backend JWT expiry; inactivity timer is the real session boundary
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7 days — rolling window

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = await cookies();
  
  // Access token: 30 min — must match backend access_token_expire_minutes.
  // Previously this was also 30 min here, but middleware.ts was setting it to
  // 15 min on refresh — that mismatch is now fixed in middleware.ts.
  cookieStore.set(ACCESS_TOKEN_KEY, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: ACCESS_TOKEN_MAX_AGE,
    path: '/',
  });

  // Refresh token: rolling 7-day window.
  // Every time we call setAuthCookies (login or token refresh), the 7-day
  // window resets. Combined with the middleware always issuing a new refresh
  // token on every /auth/refresh call, the session rolls indefinitely as long
  // as the user is active. Inactivity timeout handles the actual logout.
  cookieStore.set(REFRESH_TOKEN_KEY, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/',
  });
}

export async function getAccessToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(ACCESS_TOKEN_KEY)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(REFRESH_TOKEN_KEY)?.value;
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete(ACCESS_TOKEN_KEY);
  cookieStore.delete(REFRESH_TOKEN_KEY);
}