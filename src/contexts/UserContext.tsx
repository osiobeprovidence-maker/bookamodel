import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { onAuthStateChanged, signOut, type User as FirebaseUser } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useToast } from '../components/ui/Toast';

const LOGOUT_BROADCAST_KEY = 'bm_logout';

export const AUTH_STORAGE_PREFIXES = ['bm_session_', 'bm_login_', LOGOUT_BROADCAST_KEY];

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
  sessionEpoch?: number;
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

function parseUserAgent(ua: string) {
  let browser = 'Unknown';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';

  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/mac os x|macintosh/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  let device = 'Desktop';
  if (/android|iphone|ipod/i.test(ua)) device = 'Mobile';
  else if (/ipad|tablet/i.test(ua)) device = 'Tablet';

  return { browser, os, device };
}

function clearAuthStorage() {
  for (let i = localStorage.length - 1; i >= 0; i--) {
    const key = localStorage.key(i);
    if (key && AUTH_STORAGE_PREFIXES.some((p) => key === p || key.startsWith(p))) {
      localStorage.removeItem(key);
    }
  }
}

function broadcastLogout() {
  try {
    const channel = new BroadcastChannel('bm_auth');
    channel.postMessage({ type: 'LOGOUT' });
    channel.close();
  } catch {
    // BroadcastChannel unavailable — storage fallback covers other tabs
  }
  try {
    localStorage.setItem(LOGOUT_BROADCAST_KEY, String(Date.now()));
  } catch {
    // storage unavailable
  }
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const recordLogin = useMutation(api.settings.recordLogin);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const onRemoteLogout = () => {
      signOut(auth).catch(() => {});
    };
    const channel =
      typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('bm_auth') : null;
    channel?.addEventListener('message', (e) => {
      if (e.data?.type === 'LOGOUT') onRemoteLogout();
    });
    const onStorage = (e: StorageEvent) => {
      if (e.key === LOGOUT_BROADCAST_KEY) onRemoteLogout();
    };
    window.addEventListener('storage', onStorage);
    return () => {
      channel?.close();
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const convexUser = useQuery(
    api.users.getByFirebaseUid,
    firebaseUser?.uid ? { firebaseUid: firebaseUser.uid } : 'skip',
  ) as ConvexUser | null | undefined;

  useEffect(() => {
    if (!convexUser || !firebaseUser) return;

    const sessionKey = `bm_session_${convexUser._id}`;
    const stored = parseInt(localStorage.getItem(sessionKey) || '0', 10);
    if (convexUser.sessionEpoch && stored < convexUser.sessionEpoch) {
      clearAuthStorage();
      toast('Your session has expired. Please sign in again.', 'warning');
      signOut(auth).catch(() => {});
      navigate('/login', { replace: true });
      return;
    }

    const loginKey = `bm_login_${convexUser._id}_${new Date().toDateString()}`;
    if (localStorage.getItem(loginKey)) return;

    const { browser, os, device } = parseUserAgent(navigator.userAgent);
    recordLogin({
      userId: convexUser._id as any,
      browser,
      os,
      device,
      platform: device,
      location: Intl.DateTimeFormat().resolvedOptions().timeZone || '',
    }).catch(() => {});
    localStorage.setItem(loginKey, '1');
  }, [convexUser, firebaseUser, recordLogin]);

  const logout = useCallback(async () => {
    await signOut(auth);
    clearAuthStorage();
    broadcastLogout();
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
