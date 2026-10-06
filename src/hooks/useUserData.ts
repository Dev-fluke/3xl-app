import { useState, useEffect } from 'react';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/components/AuthProvider';

export function useUserData() {
  const { user } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

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
