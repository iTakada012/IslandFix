/**
 * Sample user accounts for the demo.
 *
 * There is no server, so accounts are defined here in the app. Signing in
 * checks the email and password against this list. Passwords are stored in
 * plain text because this is a demo only. A real app would check them on a
 * server and never ship them inside the app.
 */
import type {AppUser} from './types';

export type DemoAccount = AppUser & {
  email: string;
  password: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  // Citizens (ids match the reporters in seed-reports.ts)
  {id: 'aisha', name: 'Aisha', role: 'citizen', email: 'aisha@islandfix.mv', password: 'citizen123'},
  {id: 'ibrahim', name: 'Ibrahim', role: 'citizen', email: 'ibrahim@islandfix.mv', password: 'citizen123'},

  // Agency staff
  {id: 'council-sara', name: 'Sara', role: 'staff', agency: 'council', email: 'council@islandfix.mv', password: 'staff123'},
  {id: 'stelco-ali', name: 'Ali', role: 'staff', agency: 'stelco', email: 'stelco@islandfix.mv', password: 'staff123'},
  {id: 'mwsc-hawwa', name: 'Hawwa', role: 'staff', agency: 'mwsc', email: 'mwsc@islandfix.mv', password: 'staff123'},
];

/**
 * Check an email + password. Returns the user (without the password) if they
 * match, or null if they don't. Email is not case-sensitive.
 */
export function authenticate(email: string, password: string): AppUser | null {
  const account = DEMO_ACCOUNTS.find(
    a => a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password,
  );
  if (!account) return null;

  const {email: _email, password: _password, ...user} = account;
  return user;
}