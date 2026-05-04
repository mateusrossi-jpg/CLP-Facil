export type AccountProvider = 'email' | 'google';

export type AccountSession = {
  isSignedIn: boolean;
  provider: AccountProvider | null;
  email: string | null;
  googleSubject?: string;
  signedInAt?: string;
};

export const initialAccountSession: AccountSession = {
  isSignedIn: false,
  provider: null,
  email: null,
};

export function normalizeAccountEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isValidAccountEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeAccountEmail(email));
}

export function signInWithEmailBetaMock(email: string): AccountSession {
  const normalizedEmail = normalizeAccountEmail(email);
  if (!isValidAccountEmail(normalizedEmail)) return initialAccountSession;

  return {
    isSignedIn: true,
    provider: 'email',
    email: normalizedEmail,
    signedInAt: new Date().toISOString(),
  };
}

export function signInWithGoogleBetaMock(email: string): AccountSession {
  const normalizedEmail = normalizeAccountEmail(email);
  if (!isValidAccountEmail(normalizedEmail)) return initialAccountSession;

  return {
    isSignedIn: true,
    provider: 'google',
    email: normalizedEmail,
    googleSubject: `beta-google-${normalizedEmail}`,
    signedInAt: new Date().toISOString(),
  };
}
