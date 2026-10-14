/**
 * Application Development / Testing Mode Helper
 * 
 * When DEV_MODE (or VITE_DEV_MODE) is false:
 * - Hides the top sticky RBAC simulator bar (RoleSwitcher)
 * - Hides quick preset login buttons on LoginPage
 * - Hides evaluator / instant approval simulation cards on PaymentPendingPage
 * - Hides on-screen OTP reveal helpers on RegisterPage
 * - Hides developer simulation fallback accounts on Google Auth modal
 * 
 * Set DEV_MODE=true in .env whenever you need to rapidly test all roles & flows!
 */
export const isDevMode =
  String(import.meta.env.VITE_DEV_MODE).toLowerCase() === 'true' ||
  String(import.meta.env.DEV_MODE).toLowerCase() === 'true';

export default isDevMode;
