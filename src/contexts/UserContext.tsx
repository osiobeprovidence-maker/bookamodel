import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  email: string;
  role: 'business' | 'model' | '';
  name?: string;
}

interface UserContextType {
  user: User | null;
  login: (email: string, name?: string, role?: 'business' | 'model' | '') => void;
  setRole: (role: 'business' | 'model') => void;
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
    setIsLoading(false);
  }, []);

  const login = (email: string, name?: string, role?: 'business' | 'model' | '') => {
    const newUser = { email, role: role || '', name: name || email.split('@')[0] };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const setRole = (role: 'business' | 'model') => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, login, setRole, logout, isLoading }}>
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
