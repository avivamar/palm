/**
 * Auth package types
 * Following .cursorrules rule #299: "每个页面都必须使用 TypeScript，并定义清晰的 Props 类型"
 */

// Base user types
export type AuthUser = {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  provider: 'supabase' | 'firebase';
  createdAt: Date;
  lastLoginAt?: Date;
  metadata?: Record<string, any>;
};

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  provider: string;
};

// Session types
export type AuthSession = {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
  provider: 'supabase' | 'firebase';
};

// Auth provider interface
export type AuthProvider = {
  readonly name: 'supabase' | 'firebase';
  readonly isConfigured: boolean;

  // Authentication methods
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<AuthResult>;
  signOut: () => Promise<void>;

  // Password management
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;

  // User management
  getCurrentUser: () => Promise<AuthUser | null>;
  updateProfile: (updates: Partial<AuthUser>) => Promise<AuthUser>;
  deleteAccount: () => Promise<void>;

  // Session management
  getSession: () => Promise<AuthSession | null>;
  refreshSession: () => Promise<AuthSession | null>;

  // Email verification
  sendEmailVerification: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
};

// Auth results
export type AuthResult = {
  success: boolean;
  user?: AuthUser;
  session?: AuthSession;
  error?: AuthError;
};

export type AuthError = {
  code: string;
  message: string;
  provider: 'supabase' | 'firebase';
  originalError?: any;
};

// Auth configuration
export type AuthConfig = {
  supabase?: {
    url: string;
    anonKey: string;
    enabled: boolean;
  };
  firebase?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    appId: string;
    enabled: boolean;
  };
  defaultProvider: 'supabase' | 'firebase';
};

// Auth context types
export type AuthContextType = {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: AuthError | null;
  initialized: boolean;

  // Auth methods
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, displayName?: string) => Promise<AuthResult>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<AuthResult>;
  signOut: () => Promise<void>;

  // Password management
  sendPasswordResetEmail: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;

  // User management
  updateProfile: (updates: Partial<AuthUser>) => Promise<AuthUser>;
  deleteAccount: () => Promise<void>;

  // Email verification
  sendEmailVerification: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
};

// Component props
export type SignInFormProps = {
  locale: string;
  translations: {
    title: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    submitButton: string;
    forgotPassword: string;
    signUpLink: string;
    signUpText: string;
    googleSignIn: string;
    processing: string;
    error: string;
  };
  onSuccess?: (user: AuthUser) => void;
  onError?: (error: AuthError) => void;
  redirectTo?: string;
};

export type SignUpFormProps = {
  locale: string;
  translations: {
    title: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    passwordPlaceholder: string;
    confirmPasswordLabel: string;
    confirmPasswordPlaceholder: string;
    displayNameLabel: string;
    displayNamePlaceholder: string;
    submitButton: string;
    signInLink: string;
    signInText: string;
    googleSignUp: string;
    processing: string;
    error: string;
    termsAccept: string;
  };
  onSuccess?: (user: AuthUser) => void;
  onError?: (error: AuthError) => void;
  redirectTo?: string;
};

// Auth middleware types
export type AuthMiddlewareConfig = {
  publicRoutes: string[];
  authRoutes: string[];
  adminRoutes: string[];
  redirects: {
    signIn: string;
    signUp: string;
    dashboard: string;
    admin: string;
  };
};
