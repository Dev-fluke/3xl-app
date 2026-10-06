"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Dumbbell } from 'lucide-react';

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Temporary state to handle local -> cloud migration gracefully
  const [isMigrating, setIsMigrating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      // If user is anonymous, we shouldn't treat them as a fully logged in user for this app scope
      if (currentUser && currentUser.isAnonymous) {
        // Sign out the anonymous user so they can login properly
        await signOut(auth);
        setUser(null);
      } else {
        setUser(currentUser);
        
        // If they just logged in, check if we need to migrate LocalStorage data
        if (currentUser) {
          await migrateLocalDataToCloud(currentUser.uid);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const migrateLocalDataToCloud = async (uid: string) => {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    // Only migrate if they don't have cloud data yet
    if (!userDoc.exists()) {
      setIsMigrating(true);
      
      const checkin_history = JSON.parse(localStorage.getItem('checkin_history') || '{}');
      const weight_history = JSON.parse(localStorage.getItem('weight_history') || '{}');
      const sleep_history = JSON.parse(localStorage.getItem('sleep_history') || '{}');
      const tdee_data = JSON.parse(localStorage.getItem('tdee_data') || '{}');
      const if_status = JSON.parse(localStorage.getItem('if_status') || '{}');

      await setDoc(userDocRef, {
        checkin_history,
        weight_history,
        sleep_history,
        tdee_data,
        if_status,
        createdAt: new Date().toISOString()
      });
      
      setIsMigrating(false);
    }
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed", error);
      alert('เข้าสู่ระบบไม่สำเร็จ: ' + error.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  if (loading || isMigrating) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center flex flex-col items-center">
          <Dumbbell className="w-12 h-12 text-indigo-500 animate-bounce mb-4" />
          <p className="text-slate-500 font-bold">{isMigrating ? 'กำลังซิงค์ข้อมูลขึ้น Cloud...' : 'กำลังโหลด...'}</p>
        </div>
      </div>
    );
  }

  // If not logged in, show Login Screen
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-3xl rounded-full z-0 pointer-events-none"></div>
        
        <div className="z-10 w-full max-w-sm bg-white rounded-3xl p-8 shadow-xl text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Dumbbell className="text-indigo-600 w-10 h-10" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2 tracking-tight">3xl</h1>
          <p className="text-slate-500 text-sm mb-8 leading-relaxed">
            แอปพลิเคชันส่วนตัวสำหรับติดตามการลดไขมันและรักษามวลกล้ามเนื้อ
          </p>
          
          <button 
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold py-3.5 px-4 rounded-2xl transition-all shadow-sm active:scale-95"
          >
            {/* Google Logo SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            เข้าสู่ระบบด้วย Google
          </button>
          
          <div className="mt-8 text-xs text-slate-400">
            *ข้อมูลทั้งหมดจะถูกจัดเก็บใน Cloud ปลอดภัย 100%
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
