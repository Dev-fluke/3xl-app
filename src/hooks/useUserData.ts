import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

export function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        // Fallback to empty structures if doc was somehow deleted
        setUserData({
          checkin_history: {},
          weight_history: {},
          sleep_history: {},
          tdee_data: {},
          if_status: {}
        });
      }
      setLoading(false);
    }, (error) => {
      console.warn("Firestore onSnapshot error (falling back to local cache):", error);
      // Fallback so the app never gets permanently stuck on a loading screen
      setUserData({
        checkin_history: JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('checkin_history') || '{}' : '{}'),
        weight_history: JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('weight_history') || '{}' : '{}'),
        sleep_history: JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('sleep_history') || '{}' : '{}'),
        tdee_data: JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('tdee_data') || '{}' : '{}'),
        if_status: JSON.parse(typeof window !== 'undefined' ? localStorage.getItem('if_status') || '{}' : '{}'),
      });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateData = async (field: string, newData: any) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [field]: newData
      });
    } catch (error) {
      console.error("Error updating document: ", error);
    }
  };

  return { userData, updateData, loading };
}
