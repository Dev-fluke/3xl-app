"use client";

import { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Upload, Loader2, Trash2, CheckCircle2, Circle, X, Download, CheckSquare } from 'lucide-react';
import { signInAnonymously } from 'firebase/auth';
import { collection, addDoc, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

type PhotoDoc = {
  id: string;
  url: string; // Base64
  timestamp: number;
  weightAtTime?: number;
};

export default function ProgressGallery() {
  const [userId, setUserId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<PhotoDoc[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // New states for Selection and Lightbox
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [enlargedPhoto, setEnlargedPhoto] = useState<PhotoDoc | null>(null);

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
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs: PhotoDoc[] = [];
      snapshot.forEach((doc) => {
        docs.push({ id: doc.id, ...doc.data() } as PhotoDoc);
      });
      
      // เรียงลำดับจากใหม่ไปเก่าด้วย JavaScript 
      docs.sort((a, b) => b.timestamp - a.timestamp);
      setPhotos(docs);
    }, (error) => {
      console.error("Fetch photos error:", error);
    });

    return () => unsubscribe();
  }, [userId]);

  // Helper: Compress Image
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 1000;
          const MAX_HEIGHT = 1000;
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
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          resolve(dataUrl);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // 3. Handle File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (authError) return alert('เกิดข้อผิดพลาดในการยืนยันตัวตน: ' + authError);
    if (!userId) return alert('รอเชื่อมต่อฐานข้อมูลสักครู่...');

    const file = e.target.files[0];
    setIsUploading(true);

    try {
      const base64Image = await compressImage(file);
      let currentWeight = undefined;
      const savedTdee = localStorage.getItem('tdee_data');
      if (savedTdee) {
        const parsed = JSON.parse(savedTdee);
        if (parsed.weight) currentWeight = parseFloat(parsed.weight);
      }

      await addDoc(collection(db, 'progress_photos'), {
        userId,
        url: base64Image,
        timestamp: Date.now(),
        weightAtTime: currentWeight
      });

    } catch (error) {
      console.error("Upload error:", error);
      alert('อัปโหลดไม่สำเร็จ (ไฟล์อาจใหญ่เกินไป)');
    } finally {
      setIsUploading(false);
      // Reset input value to allow uploading same file again if needed
      e.target.value = '';
    }
  };

  // 4. Selection Logic
  const toggleSelection = (id: string) => {
    setSelectedPhotos(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedPhotos([]);
  };

  const handleBatchDelete = async () => {
    if (selectedPhotos.length === 0) return;
    if (!window.confirm(`ต้องการลบ ${selectedPhotos.length} รูปที่เลือกใช่หรือไม่?`)) return;

    try {
      await Promise.all(selectedPhotos.map(id => deleteDoc(doc(db, 'progress_photos', id))));
      setSelectedPhotos([]);
      setIsSelectionMode(false);
    } catch (err) {
      console.error(err);
      alert('ลบรูปภาพไม่สำเร็จ');
    }
  };

  const handleBatchDownload = () => {
    if (selectedPhotos.length === 0) return;
    
    // Download each selected photo
    selectedPhotos.forEach((id, index) => {
      const photo = photos.find(p => p.id === id);
      if (!photo) return;
      
      // Delay downloads slightly to prevent browser blocking multiple downloads
      setTimeout(() => {
        const a = document.createElement('a');
        a.href = photo.url;
        a.download = `3xl_progress_${format(photo.timestamp, 'yyyyMMdd')}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }, index * 300);
    });

    setSelectedPhotos([]);
    setIsSelectionMode(false);
  };

  const handlePhotoClick = (photo: PhotoDoc) => {
    if (isSelectionMode) {
      toggleSelection(photo.id);
    } else {
      setEnlargedPhoto(photo);
    }
  };

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] overflow-y-auto bg-slate-50 pb-8 relative">
      <div className="pt-8 pb-4 px-6 bg-white shadow-sm sticky top-0 z-20 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Progress</h1>
        {photos.length > 0 && (
          <button 
            onClick={toggleSelectionMode}
            className={`text-sm font-bold px-3 py-1.5 rounded-full transition-colors ${
              isSelectionMode ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-100'
            }`}
          >
            {isSelectionMode ? 'ยกเลิก' : 'เลือกรูป'}
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Upload Card - Hide when in selection mode */}
        {!isSelectionMode && (
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
        )}

        {/* Gallery Grid */}
        <div>
          {!isSelectionMode && (
            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
              <ImageIcon size={16} className="text-slate-400" /> แกลลอรี่ของคุณ
            </h3>
          )}

          {photos.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 flex flex-col items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
              <Camera size={48} className="mb-3 opacity-20" />
              <p className="text-sm font-medium">ยังไม่มีรูปภาพ</p>
              <p className="text-xs mt-1 text-center">เริ่มอัปโหลดรูปภาพแรกของคุณ<br/>เพื่อดูพัฒนาการกันเถอะ</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {photos.map((photo) => {
                const isSelected = selectedPhotos.includes(photo.id);
                
                return (
                  <div 
                    key={photo.id} 
                    onClick={() => handlePhotoClick(photo)}
                    className={`bg-white rounded-2xl overflow-hidden shadow-sm border relative group cursor-pointer transition-all ${
                      isSelected ? 'border-indigo-500 ring-2 ring-indigo-500 scale-[0.98]' : 'border-slate-100 hover:border-indigo-300'
                    }`}
                  >
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

                    {/* Selection Checkbox Overlay */}
                    {isSelectionMode && (
                      <div className="absolute top-2 right-2 z-10">
                        {isSelected ? (
                          <div className="bg-indigo-600 text-white rounded-full p-0.5 shadow-sm">
                            <CheckCircle2 size={24} />
                          </div>
                        ) : (
                          <div className="text-white/70 drop-shadow-md">
                            <Circle size={24} />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar for Selection Mode */}
      <AnimatePresence>
        {isSelectionMode && selectedPhotos.length > 0 && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-20 left-4 right-4 bg-slate-900 text-white rounded-2xl p-4 shadow-2xl z-30 flex items-center justify-between"
          >
            <span className="text-sm font-bold ml-2">เลือก {selectedPhotos.length} รูป</span>
            <div className="flex gap-2">
              <button 
                onClick={handleBatchDownload}
                className="bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition-colors text-white"
                title="ดาวน์โหลดรูปลงเครื่อง"
              >
                <Download size={20} />
              </button>
              <button 
                onClick={handleBatchDelete}
                className="bg-rose-500 hover:bg-rose-600 p-2.5 rounded-xl transition-colors text-white"
                title="ลบรูปภาพ"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox / Fullscreen Image */}
      <AnimatePresence>
        {enlargedPhoto && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
          >
            <div className="flex justify-between items-center p-4 text-white">
              <div className="text-sm">
                <p className="font-bold">{format(enlargedPhoto.timestamp, 'd MMMM yyyy')}</p>
                {enlargedPhoto.weightAtTime && <p className="text-white/60">น้ำหนัก: {enlargedPhoto.weightAtTime} กก.</p>}
              </div>
              <button 
                onClick={() => setEnlargedPhoto(null)}
                className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 flex items-center justify-center p-4 overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={enlargedPhoto.url} 
                alt="Enlarged Progress" 
                className="max-w-full max-h-full object-contain"
              />
            </div>

            <div className="p-6 flex justify-center gap-6">
              <button 
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = enlargedPhoto.url;
                  a.download = `3xl_progress_${format(enlargedPhoto.timestamp, 'yyyyMMdd')}.jpg`;
                  a.click();
                }}
                className="flex flex-col items-center gap-2 text-white/70 hover:text-white transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Download size={20} />
                </div>
                <span className="text-xs font-bold">บันทึกรูป</span>
              </button>
              <button 
                onClick={async () => {
                  if(window.confirm('ลบรูปภาพนี้ใช่ไหม?')) {
                    await deleteDoc(doc(db, 'progress_photos', enlargedPhoto.id));
                    setEnlargedPhoto(null);
                  }
                }}
                className="flex flex-col items-center gap-2 text-rose-400 hover:text-rose-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center">
                  <Trash2 size={20} />
                </div>
                <span className="text-xs font-bold">ลบรูปนี้</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
