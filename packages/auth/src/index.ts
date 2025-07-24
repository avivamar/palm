/**
 * Auth package main index
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

// Components
export { AuthProvider, useAuth } from './components/AuthProvider';

export type { AuthProviderProps } from './components/AuthProvider';

export { SignInForm } from './components/SignInForm';
// Auth providers
export { SupabaseAuthProvider } from './providers/supabase/SupabaseAuthProvider';
// Core types
export type {
  AuthConfig,
  AuthContextType,
  AuthError,
  AuthMiddlewareConfig,
  AuthResult,
  AuthSession,
  AuthUser,
  AuthProvider as IAuthProvider,
  SignInFormProps,
  SignUpFormProps,
  UserProfile,
} from './types';

// TODO: Add more exports as we create them
// export { SignUpForm } from './components/SignUpForm';
// export { ForgotPasswordForm } from './components/ForgotPasswordForm';
// export { ResetPasswordForm } from './components/ResetPasswordForm';
// export { EmailVerification } from './components/EmailVerification';
// export { FirebaseAuthProvider } from './providers/firebase/FirebaseAuthProvider';
