import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  auth,
  signInWithGoogle,
  logOut,
  onAuthStateChanged,
  User
} from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: User | null;
  adminProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginDemoAdmin: () => void;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [adminProfile, setAdminProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Check if demo admin session was saved in sessionStorage
    const savedDemo = sessionStorage.getItem('brightloop_demo_admin');
    if (savedDemo) {
      try {
        const parsed = JSON.parse(savedDemo);
        setAdminProfile(parsed);
      } catch (e) {
        sessionStorage.removeItem('brightloop_demo_admin');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      if (user) {
        setAdminProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email?.split('@')[0] || 'Admin User',
          role: 'admin',
          avatarUrl: user.photoURL || undefined
        });
        sessionStorage.removeItem('brightloop_demo_admin');
      } else if (!sessionStorage.getItem('brightloop_demo_admin')) {
        setAdminProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } finally {
      setLoading(false);
    }
  };

  const loginDemoAdmin = () => {
    const demoAdmin: UserProfile = {
      uid: 'admin_dharshan_777',
      email: 'dharshan7772007@gmail.com',
      displayName: 'Dharshan (Platform Lead)',
      role: 'admin',
    };
    sessionStorage.setItem('brightloop_demo_admin', JSON.stringify(demoAdmin));
    setAdminProfile(demoAdmin);
  };

  const logout = async () => {
    sessionStorage.removeItem('brightloop_demo_admin');
    setAdminProfile(null);
    if (currentUser) {
      await logOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        adminProfile,
        loading,
        loginWithGoogle,
        loginDemoAdmin,
        logout,
        isAdmin: !!adminProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
