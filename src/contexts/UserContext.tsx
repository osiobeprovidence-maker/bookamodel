import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useQuery, useConvex } from 'convex/react';
import { api } from '../../convex/_generated/api';

export interface ConvexUser {
  _id: string;
  firebaseUid: string;
  email: string;
  name: string;
  role?: 'model' | 'business' | 'admin';
  imageUrl?: string;
  phone?: string;
  profileCompleted: boolean;
  onboardingStep: number;
  createdAt: number;
  lastActive?: number;
  isOnline?: boolean;
}

interface UserContextType {
  firebaseUser: FirebaseUser | null;
  convexUser: ConvexUser | null;
  profileCompleted: boolean;
  onboardingStep: number;
  isLoading: boolean;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  const convexUser = useQuery(
    api.users.getByFirebaseUid,
    firebaseUser?.uid ? { firebaseUid: firebaseUser.uid } : 'skip',
  ) as ConvexUser | null | undefined;

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value: UserContextType = {
    firebaseUser,
    convexUser: convexUser ?? null,
    profileCompleted: convexUser?.profileCompleted ?? false,
    onboardingStep: convexUser?.onboardingStep ?? 0,
    isLoading: isLoading || (firebaseUser !== null && convexUser === undefined),
    logout,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
