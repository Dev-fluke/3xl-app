"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Trophy, Moon, Sun } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';

type Question = {
  id: string;
  text: string;
};

const getQuestionsForToday = (): Question[] => {
  const day = new Date().getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  
  const coreQuestions: Question[] = [
    { id: 'q_meals', text: 'คุมอาหารหลัก 3 มื้อได้ดีไหม?' },
    { id: 'q_water', text: 'ดื่มน้ำเพียงพอไหม?' },
  ];
  
  const avoidJunk: Question = { id: 'q_junk', text: 'งดของหวาน ของมัน ของทอดได้ไหม?' };

  if ([1, 3, 5].includes(day)) {
    return [
      ...coreQuestions,
      avoidJunk,
      { id: 'q_workout', text: 'ทำกิจกรรม (ออกกำลังกาย/พักผ่อน) ตามตาราง Workout วันนี้สำเร็จไหม?' },
      { id: 'q_protein', text: 'ได้รับโปรตีนถึงเป้าหมายเพื่อรักษากล้ามเนื้อไหม?' }
    ];
  } else if ([2, 4].includes(day)) {
    return [
      ...coreQuestions,
      avoidJunk,
      { id: 'q_cardio', text: 'ได้คาร์ดิโอ หรือขยับร่างกายตามตารางวันนี้ไหม?' },
      { id: 'q_fatigue', text: 'คุมแคลอรีรวมไม่ให้เกินเป้าหมายได้ดีไหม?' }
    ];
  } else {
    return [
      ...coreQuestions,
      { id: 'q_rest', text: 'ให้เวลาร่างกายพักผ่อนฟื้นฟูตามตารางเต็มที่ไหม?' },
      { id: 'q_mindful', text: 'คุมสติในการกินวันพัก ไม่ให้หลุดโลกใช่ไหม?' }
    ];
  }
};

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSleeping, setIsSleeping] = useState(false);
  const [showSleepResult, setShowSleepResult] = useState<{ hours: number } | null>(null);

  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    setQuestions(getQuestionsForToday());
    setDateStr(format(new Date(), 'EEEE, d MMM yyyy'));
    
    // Check sleep status first
    const sleepStatus = JSON.parse(localStorage.getItem('sleep_status') || '{"isSleeping": false}');
    if (sleepStatus.isSleeping) {
      setIsSleeping(true);
      return; // Skip normal checkin init
    }

    // Check if already completed check-in today
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const history = JSON.parse(localStorage.getItem('checkin_history') || '{}');
    if (history[todayStr]) {
      setIsCompleted(true);
    }
  }, []);

  const handleAnswer = (answer: boolean) => {
    const currentQ = questions[currentIndex];
    const newAnswers = { ...answers, [currentQ.id]: answer };
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishCheckin(newAnswers);
    }
  };

  const finishCheckin = (finalAnswers: Record<string, boolean>) => {
    setIsCompleted(true);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const history = JSON.parse(localStorage.getItem('checkin_history') || '{}');
    
    const score = Object.values(finalAnswers).filter(Boolean).length;
    const total = questions.length;
    
    history[todayStr] = {
      answers: finalAnswers,
      score,
      total,
      percentage: (score / total) * 100
    };
    
    localStorage.setItem('checkin_history', JSON.stringify(history));
  };

  const handleSleepClick = () => {
    const sleepData = { isSleeping: true, startTime: new Date().toISOString() };
    localStorage.setItem('sleep_status', JSON.stringify(sleepData));
    setIsSleeping(true);
  };

  const handleWakeUpClick = () => {
    const sleepStatus = JSON.parse(localStorage.getItem('sleep_status') || '{}');
    if (!sleepStatus.startTime) return;

    const start = new Date(sleepStatus.startTime);
    const end = new Date();
    const mins = differenceInMinutes(end, start);
    const hours = mins / 60; // For testing, even if it's 0.01 hours, we calculate it

    // Save to sleep history using today's date
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const sleepHistory = JSON.parse(localStorage.getItem('sleep_history') || '{}');
    sleepHistory[todayStr] = { durationHours: hours };
    localStorage.setItem('sleep_history', JSON.stringify(sleepHistory));

    // Clear sleep status
    localStorage.setItem('sleep_status', JSON.stringify({ isSleeping: false }));
    setIsSleeping(false);
    setShowSleepResult({ hours });
  };

  if (questions.length === 0) return <div className="p-4">Loading...</div>;

  // --- RENDER SLEEP RESULT MODAL ---
  if (showSleepResult) {
    const h = showSleepResult.hours;
    const isGood = h >= 7;
    return (
      <main className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-white items-center justify-center p-6 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-sm w-full bg-slate-50 p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6 ${isGood ? 'bg-emerald-100 text-emerald-500' : 'bg-amber-100 text-amber-500'}`}>
            <Sun size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">อรุณสวัสดิ์!</h2>
          <p className="text-slate-600 mb-2">เมื่อคืนคุณนอนหลับไป</p>
          <div className="text-4xl font-black text-indigo-600 mb-4">{h.toFixed(1)} <span className="text-lg">ชม.</span></div>
          
          {isGood ? (
            <p className="text-sm text-emerald-600 font-bold mb-8">เยี่ยมมาก! ร่างกายฟื้นฟูเต็มที่พร้อมสร้างกล้ามเนื้อ</p>
          ) : (
            <p className="text-sm text-amber-600 font-bold mb-8">พักผ่อนน้อยไปนิด ระวังจะส่งผลต่อการสร้างกล้ามเนื้อและการเผาผลาญนะ</p>
          )}

          <button 
            onClick={() => { setShowSleepResult(null); setIsCompleted(true); }} // Return to completed state for today
            className="w-full bg-indigo-600 text-white font-bold py-4 rounded-2xl hover:bg-indigo-700 transition"
          >
            เริ่มต้นวันใหม่
          </button>
        </motion.div>
      </main>
    );
  }

  // --- RENDER SLEEPING STATE ---
  if (isSleeping) {
    return (
      <main className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-900 text-slate-100 items-center justify-center p-6 relative">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-20 right-16 w-3 h-3 bg-white rounded-full opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-white rounded-full opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center z-10 flex flex-col items-center">
          <Moon size={64} className="text-indigo-400 mb-6" />
          <h1 className="text-3xl font-bold mb-2">กำลังนอนหลับ...</h1>
          <p className="text-indigo-200/60 mb-12 text-sm">ระบบกำลังบันทึกเวลาพักผ่อนของคุณ</p>

          <button 
            onClick={handleWakeUpClick}
            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-4 px-12 rounded-full backdrop-blur-md transition flex items-center gap-2"
          >
            <Sun size={20} />
            ฉันตื่นแล้ว
          </button>
        </motion.div>
      </main>
    );
  }

  // --- RENDER NORMAL CHECK-IN ---
  return (
    <main className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-slate-50 relative">
      <div className="pt-8 pb-4 px-6 bg-white shadow-sm z-10">
        <h1 className="text-2xl font-bold text-slate-800">Check-in</h1>
        <p className="text-slate-500 text-sm">{dateStr}</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
        <AnimatePresence mode="wait">
          {!isCompleted ? (
            <motion.div
              key={currentIndex}
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center absolute"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, { offset, velocity }) => {
                const swipe = offset.x;
                if (swipe < -50) handleAnswer(false);
                else if (swipe > 50) handleAnswer(true);
              }}
            >
              <div className="text-sm font-medium text-indigo-500 mb-6 bg-indigo-50 px-3 py-1 rounded-full">
                Question {currentIndex + 1} of {questions.length}
              </div>
              
              <h2 className="text-2xl font-bold text-slate-800 mb-10 leading-tight">
                {questions[currentIndex].text}
              </h2>

              <div className="flex w-full justify-between gap-4 mt-auto">
                <button
                  onClick={() => handleAnswer(false)}
                  className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-red-50 text-red-600 active:bg-red-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                    <X size={24} />
                  </div>
                  <span className="font-semibold">ไม่ใช่ / พลาด</span>
                </button>
                <button
                  onClick={() => handleAnswer(true)}
                  className="flex-1 flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-emerald-50 text-emerald-600 active:bg-emerald-100 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Check size={24} />
                  </div>
                  <span className="font-semibold">ใช่ / สำเร็จ</span>
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-6">หรือปัดซ้าย-ขวา เพื่อตอบ</p>
            </motion.div>
          ) : (
            <motion.div
              key="completed"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-full max-w-sm bg-white rounded-3xl shadow-xl p-8 flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-6">
                <Trophy size={40} className="text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">ยอดเยี่ยมมาก!</h2>
              <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                คุณประเมินตัวเองสำหรับวันนี้เรียบร้อยแล้ว<br/>เตรียมตัวพักผ่อนเพื่อฟื้นฟูกล้ามเนื้อได้เลย
              </p>
              
              <button 
                onClick={handleSleepClick}
                className="w-full bg-indigo-900 text-white font-bold py-4 rounded-2xl mb-4 hover:bg-slate-800 transition flex items-center justify-center gap-2 shadow-md"
              >
                <Moon size={20} />
                คุณกำลังจะเข้านอนใช่ไหม?
              </button>

              <button 
                onClick={() => {
                  const todayStr = format(new Date(), 'yyyy-MM-dd');
                  const history = JSON.parse(localStorage.getItem('checkin_history') || '{}');
                  delete history[todayStr];
                  localStorage.setItem('checkin_history', JSON.stringify(history));
                  setIsCompleted(false);
                  setCurrentIndex(0);
                  setAnswers({});
                }}
                className="text-xs text-slate-400 font-medium underline underline-offset-4"
              >
                ทำแบบประเมินใหม่ (ทดสอบ)
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
