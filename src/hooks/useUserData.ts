import { useState, useEffect, useRef } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

export function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const isInitialMount = useRef(true);

  // Helper to read all local data from localStorage safely
  const getLocalData = () => {
    if (typeof window === 'undefined') {
      return {
        checkin_history: {},
        weight_history: {},
        sleep_history: {},
        tdee_data: {},
        if_status: {},
        sleep_status: {}
      };
    }
    try {
      return {
        checkin_history: JSON.parse(localStorage.getItem('checkin_history') || '{}'),
        weight_history: JSON.parse(localStorage.getItem('weight_history') || '{}'),
        sleep_history: JSON.parse(localStorage.getItem('sleep_history') || '{}'),
        tdee_data: JSON.parse(localStorage.getItem('tdee_data') || '{}'),
        if_status: JSON.parse(localStorage.getItem('if_status') || '{}'),
        sleep_status: JSON.parse(localStorage.getItem('sleep_status') || '{}'),
      };
    } catch (e) {
      return {
        checkin_history: {},
        weight_history: {},
        sleep_history: {},
        tdee_data: {},
        if_status: {},
        sleep_status: {}
      };
    }
  };

  useEffect(() => {
    // 1. First, load local cache immediately for zero delay
    if (isInitialMount.current) {
      isInitialMount.current = false;
      const initialLocal = getLocalData();
      setUserData(initialLocal);
    }

    if (!user) {
      setLoading(false);
      return;
    }

    // 2. Connect to Firestore for real-time sync
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const cloudData = docSnap.data();
        setUserData((prev: any) => ({
          ...(prev || {}),
          ...cloudData
        }));

        // Mirror to localStorage as cache
        if (typeof window !== 'undefined') {
          Object.entries(cloudData).forEach(([key, val]) => {
            if (val !== undefined && val !== null) {
              try {
                localStorage.setItem(key, typeof val === 'object' ? JSON.stringify(val) : String(val));
              } catch (_) {}
            }
          });
        }
      } else {
        // Document does not exist in Cloud yet. Create it using local data!
        const local = getLocalData();
        setUserData(local);
        setDoc(userDocRef, {
          ...local,
          createdAt: new Date().toISOString()
        }, { merge: true }).catch((err) => {
          console.warn("Failed to create initial cloud doc:", err);
        });
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore onSnapshot error (using local cache):", error);
      setUserData(getLocalData());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateData = async (field: string, newData: any) => {
    // 1. Optimistic Update in React State immediately
    setUserData((prev: any) => ({
      ...(prev || {}),
      [field]: newData
    }));

    // 2. Immediate backup to LocalStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(field, typeof newData === 'object' ? JSON.stringify(newData) : String(newData));
      } catch (e) {
        console.warn("LocalStorage save error:", e);
      }
    }

    // 3. Sync to Firestore Cloud (using setDoc with merge: true)
    if (user) {
      try {
        await setDoc(doc(db, 'users', user.uid), {
          [field]: newData,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      } catch (error: any) {
        console.error("Error saving to Firestore:", error);
        if (error?.code === 'permission-denied') {
          alert('⚠️ บันทึกข้อมูลลงเครื่องสำเร็จแล้ว แต่ซิงค์ขึ้น Cloud ไม่ได้ (Permission Denied)\nกรุณาตรวจสอบ Firestore Rules ใน Firebase Console ให้อนุญาตอ่าน/เขียน');
        }
      }
    }
  };

  return { userData, updateData, loading };
}
