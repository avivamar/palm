import { NextRequest } from "next/server";
import { getFirebaseAuth } from "./config";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Authenticate user from Firebase ID token in Authorization header
 */
export async function auth(request: NextRequest): Promise<AuthUser | null> {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const idToken = authHeader.substring(7); // Remove "Bearer " prefix
    
    // For now, we'll use a simple approach since Firebase Admin SDK is not fully configured
    // In production, you would verify the token using Firebase Admin SDK
    
    // TODO: Implement proper Firebase Admin SDK token verification
    // const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // For development, we'll extract user info from the token payload (not secure for production)
    try {
      const payload = JSON.parse(atob(idToken.split('.')[1]));
      return {
        uid: payload.user_id || payload.sub,
        email: payload.email || null,
        displayName: payload.name || null,
        photoURL: payload.picture || null,
      };
    } catch {
      return null;
    }
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

/**
 * Get current user from Firebase Auth (client-side)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const firebaseAuth = await getFirebaseAuth();
    if (!firebaseAuth) {
      return null;
    }

    return new Promise((resolve) => {
      const unsubscribe = firebaseAuth.onAuthStateChanged((user: any) => {
        unsubscribe();
        if (user) {
          resolve({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          });
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error("Get current user error:", error);
    return null;
  }
}