import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';

export interface User {
  email: string;
  role: 'business' | 'model' | '';
  name?: string;
  convexUserId?: string;
  profileCompleted?: boolean;
}

interface UserContextType {
  user: User | null;
  login: (email: string, name?: string, role?: 'business' | 'model' | '', convexUserId?: string) => void;
  setRole: (role: 'business' | 'model') => void;
  setProfileCompleted: () => void;
  logout: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser && savedUser) {
        localStorage.removeItem('user');
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsub();
  }, []);

  const login = (email: string, name?: string, role?: 'business' | 'model' | '', convexUserId?: string) => {
    const newUser = {
      email,
      role: role || '',
      name: name || email.split('@')[0],
      convexUserId: convexUserId || undefined,
      profileCompleted: false,
    };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const setRole = (role: 'business' | 'model') => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const setProfileCompleted = () => {
    if (!user) return;
    const updated = { ...user, profileCompleted: true };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, login, setRole, setProfileCompleted, logout, isLoading }}>
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
