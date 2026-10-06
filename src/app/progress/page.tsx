"use client";

import { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Upload, Loader2, Trash2 } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc, query, where, orderBy, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { format } from 'date-fns';

type PhotoDoc = {
  id: string;
  url: string; // This will now hold the Base64 string
  timestamp: number;
  weightAtTime?: number;
};

export default function ProgressGallery() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoDoc[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // 1. Authenticate Anonymously
  useEffect(() => {
    signInAnonymously(auth)
      .then((userCredential) => {
        setUserId(userCredential.user.uid);
        setAuthError(null);
      })
      .catch((error) => {
        console.error("Auth error:", error);
        setAuthError(error.message);
      });
  }, []);

  // 2. Listen to Photos from Firestore
  useEffect(() => {
    if (!userId) return;

    const q = query(
      collection(db, 'progress_photos'),
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: PhotoDoc[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as PhotoDoc);
      });
      setPhotos(docs);
    });

    return () => unsubscribe();
  }, [userId]);

  // Helper: Compress Image to Base64
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with 0.7 quality (Usually under 100kb, Firestore limit is 1MB)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // 3. Handle File Upload (Save Base64 to Firestore)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (authError) return alert('เกิดข้อผิดพลาดในการยืนยันตัวตน (Authentication): ' + authError + '\nกรุณาเช็คว่าเปิด Anonymous Login ใน Firebase แล้วหรือยัง');
    if (!userId) return alert('รอเชื่อมต่อฐานข้อมูลสักครู่...');

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      // Compress image
      const base64Image = await compressImage(file);
      
      // Get current weight if exists
      let currentWeight = undefined;
      const savedTdee = localStorage.getItem('tdee_data');
      if (savedTdee) {
        const parsed = JSON.parse(savedTdee);
        if (parsed.weight) currentWeight = parseFloat(parsed.weight);
      }

      // Save to Firestore directly
      await addDoc(collection(db, 'progress_photos'), {
        userId,
        url: base64Image,
        timestamp: Date.now(),
        weightAtTime: currentWeight
      });

    } catch (error) {
      console.error("Upload error:", error);
      alert('อัปโหลดไม่สำเร็จ กรุณาลองใหม่ (ไฟล์อาจจะใหญ่เกินไป)');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!window.confirm('คุณต้องการลบรูปภาพนี้ใช่หรือไม่?')) return;
    try {
      await deleteDoc(doc(db, 'progress_photos', photoId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] overflow-y-auto bg-slate-50 pb-8">
      <div className="pt-8 pb-4 px-6 bg-white shadow-sm sticky top-0 z-20 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Progress</h1>
        <Camera className="text-slate-400" />
      </div>

      <div className="p-4 space-y-6">
        {/* Upload Card */}
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          
          <h2 className="text-lg font-bold mb-2 relative z-10 flex items-center gap-2">
            บันทึกความเปลี่ยนแปลง 📸
          </h2>
          <p className="text-xs text-blue-100 leading-relaxed relative z-10 mb-4">
            ตัวเลขบนตาชั่งอาจจะหลอกตาได้ <br/>มาถ่ายรูปหน้ากระจกเก็บไว้สัปดาห์ละ 1 ครั้งกันเถอะ!
          </p>

          <div className="relative z-10">
            {isUploading ? (
              <div className="bg-white/20 border border-white/30 rounded-2xl p-4 text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-white" />
                <p className="text-sm font-bold">กำลังประมวลผลรูปภาพ...</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col items-center justify-center bg-white text-indigo-600 font-bold py-4 rounded-2xl cursor-pointer hover:bg-blue-50 transition-colors shadow-sm text-sm">
                  <div className="flex flex-col items-center gap-1">
                    <Camera size={24} />
                    <span>ถ่ายรูปตอนนี้</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    capture="environment"
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
                
                <label className="flex flex-col items-center justify-center bg-indigo-700 text-white font-bold py-4 rounded-2xl cursor-pointer hover:bg-indigo-800 transition-colors shadow-sm text-sm border border-indigo-500">
                  <div className="flex flex-col items-center gap-1">
                    <ImageIcon size={24} />
                    <span>เลือกจากอัลบั้ม</span>
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Gallery Grid */}
        <div>
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ImageIcon size={16} className="text-slate-400" /> แกลลอรี่ของคุณ
          </h3>

          {photos.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
              <Camera size={48} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">ยังไม่มีรูปภาพ</p>
              <p className="text-xs mt-1 text-center">เริ่มอัปโหลดรูปภาพแรกของคุณ<br/>เพื่อดูพัฒนาการกันเถอะ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo) => (
                <div key={photo.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 relative group">
                  <div className="aspect-[3/4] relative bg-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={photo.url} 
                      alt="Progress" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <p className="text-xs font-bold shadow-sm">{format(photo.timestamp, 'd MMM yyyy')}</p>
                    {photo.weightAtTime && (
                      <p className="text-[10px] text-white/80 font-medium">{photo.weightAtTime} กก.</p>
                    )}
                  </div>

                  <button 
                    onClick={() => handleDelete(photo.id)}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-red-500 transition-colors opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
