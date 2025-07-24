// Dynamic Firebase imports to avoid server-side issues during SSG
// Firebase modules will be imported only when needed in browser environment

// Firebase 配置对象 - 直接访问 process.env 的属性
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Check if Firebase is configured
const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey
  && firebaseConfig.authDomain
  && firebaseConfig.projectId
  && firebaseConfig.appId,
);

let firebaseApp: any = null;
let firebaseAnalytics: any = null;

// Initialize Firebase only in browser environment to avoid SSG issues
async function initializeFirebase() {
  if (!isFirebaseConfigured || typeof window === 'undefined') {
    return;
  }

  try {
    // Dynamic import of Firebase modules
    const { getApp, getApps, initializeApp } = await import('firebase/app');
    const { browserLocalPersistence, connectAuthEmulator, getAuth, setPersistence } = await import('firebase/auth');

    // Initialize Firebase (prevent multiple initialization)
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

    // Set persistence to LOCAL for better session management
    const auth = getAuth(firebaseApp);
    setPersistence(auth, browserLocalPersistence).catch((error) => {
      console.warn('Failed to set Firebase Auth persistence:', error);
    });

    // Connect to Auth emulator in development
    if (process.env.NODE_ENV === 'development') {
      try {
        // Only connect emulator if not already connected
        // Check if emulator is already connected using alternative approach
        const authConfig = (auth as any)._delegate?._config;
        if (!authConfig?.emulator) {
          connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        }
      } catch {
        // Emulator connection is optional in development
      }
    }

    // Initialize Analytics only if supported
    if (firebaseConfig.measurementId) {
      // Dynamic import to avoid server-side bundling issues
      import('firebase/analytics').then(({ getAnalytics, isSupported }) => {
        isSupported().then((supported) => {
          if (supported) {
            try {
              firebaseAnalytics = getAnalytics(firebaseApp);
            } catch (analyticsError) {
              console.warn('Firebase Analytics initialization failed:', analyticsError);
              firebaseAnalytics = null;
            }
          }
        }).catch((error) => {
          console.warn('Firebase Analytics support check failed:', error);
        });
      }).catch((error) => {
        console.warn('Firebase Analytics module loading failed:', error);
      });
    }
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    firebaseApp = null;
    firebaseAnalytics = null;
  }
}

// Only initialize Firebase in browser environment
if (typeof window !== 'undefined' && isFirebaseConfigured) {
  initializeFirebase();
} else if (!isFirebaseConfigured) {
  console.warn('Firebase configuration is incomplete. Missing required environment variables:');
  if (!firebaseConfig.apiKey) {
    console.warn('- NEXT_PUBLIC_FIREBASE_API_KEY');
  }
  if (!firebaseConfig.authDomain) {
    console.warn('- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');
  }
  if (!firebaseConfig.projectId) {
    console.warn('- NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  }
  if (!firebaseConfig.appId) {
    console.warn('- NEXT_PUBLIC_FIREBASE_APP_ID');
  }
}

// Export functions to check if Firebase is properly initialized
export const isFirebaseReady = () => Boolean(firebaseApp);
export const getFirebaseApp = () => firebaseApp;
export const getFirebaseAuth = async () => {
  if (!firebaseApp || typeof window === 'undefined') {
    return null;
  }
  try {
    const { getAuth } = await import('firebase/auth');
    return getAuth(firebaseApp);
  } catch (error) {
    console.error('Failed to get Firebase Auth:', error);
    return null;
  }
};
export const getFirebaseAnalytics = () => firebaseAnalytics;

// Export immutable references (for SSR/server only)
export const app = firebaseApp;
export const analytics = firebaseAnalytics;

export default firebaseApp;
