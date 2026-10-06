"use client";

import { useEffect, useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday,
  subMonths,
  addMonths
} from 'date-fns';
import { ChevronLeft, ChevronRight, Scale, Activity, Trash2, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

import { useUserData } from '@/hooks/useUserData';

export default function CalendarStats() {
  const { userData, updateData } = useUserData();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // States
  const [history, setHistory] = useState<Record<string, any>>({});
  const [weightHistory, setWeightHistory] = useState<Record<string, number>>({});
  const [sleepHistory, setSleepHistory] = useState<Record<string, { durationHours: number }>>({});
  
  const [todayWeight, setTodayWeight] = useState('');
  const [activeTab, setActiveTab] = useState<'habits' | 'weight' | 'sleep'>('habits');

  useEffect(() => {
    if (!userData) return;

    // 1. Load Check-in History
    const data = userData.checkin_history || {};
    if (Object.keys(data).length === 0) {
      const fakeData: Record<string, any> = {};
      const today = new Date();
      for(let i=1; i<=14; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        fakeData[format(d, 'yyyy-MM-dd')] = { percentage: Math.floor(Math.random() * 50) + 50 };
      }
      setHistory(fakeData);
    } else setHistory(data);

    // 2. Load Weight History
    const wData = userData.weight_history || {};
    if (Object.keys(wData).length === 0) {
      const fakeWData: Record<string, number> = {};
      const today = new Date();
      let startWeight = 85.0;
      for(let i=30; i>=0; i-=3) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        fakeWData[format(d, 'yyyy-MM-dd')] = startWeight;
        startWeight -= (Math.random() * 0.5);
      }
      setWeightHistory(fakeWData);
    } else setWeightHistory(wData);

    // 3. Load Sleep History
    const sData = userData.sleep_history || {};
    if (Object.keys(sData).length === 0) {
      const fakeSData: Record<string, { durationHours: number }> = {};
      const today = new Date();
      for(let i=14; i>=0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        fakeSData[format(d, 'yyyy-MM-dd')] = { durationHours: 5 + Math.random() * 4 };
      }
      setSleepHistory(fakeSData);
    } else setSleepHistory(sData);

  }, [userData]);

  const handleSaveWeight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!todayWeight) return;
    const numWeight = parseFloat(todayWeight);
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    
    const newWeightHistory = { ...weightHistory, [todayStr]: numWeight };
    setWeightHistory(newWeightHistory);
    await updateData('weight_history', newWeightHistory);
    
    if (userData?.tdee_data) {
      const parsedTdee = { ...userData.tdee_data };
      parsedTdee.weight = todayWeight;
      await updateData('tdee_data', parsedTdee);
    }
    setTodayWeight('');
    alert('บันทึกน้ำหนักเรียบร้อยแล้ว!');
  };

  const handleDeleteWeight = async (dateStr: string) => {
    if (!window.confirm(`ต้องการลบน้ำหนักของวันที่ ${format(new Date(dateStr), 'd MMM yyyy')} ใช่หรือไม่?`)) return;
    const newWeightHistory = { ...weightHistory };
    delete newWeightHistory[dateStr];
    setWeightHistory(newWeightHistory);
    await updateData('weight_history', newWeightHistory);
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDay = monthStart.getDay();
  const blanks = Array.from({ length: startDay }, (_, i) => i);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getColorClass = (percentage: number) => {
    if (percentage >= 80) return 'bg-emerald-500 text-white shadow-sm';
    if (percentage >= 50) return 'bg-yellow-400 text-slate-800 shadow-sm';
    return 'bg-red-400 text-white shadow-sm';
  };

  // --- HABIT DATA ---
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });
  const habitChartData = {
    labels: last7Days.map(d => format(d, 'EEE')),
    datasets: [{
      label: 'คะแนน (%)',
      data: last7Days.map(d => history[format(d, 'yyyy-MM-dd')]?.percentage || 0),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderRadius: 6,
    }],
  };

  // --- WEIGHT DATA ---
  const sortedWeightDates = Object.keys(weightHistory).sort();
  const recentWeightDates = sortedWeightDates.slice(-10);
  const weightChartData = {
    labels: recentWeightDates.map(dateStr => format(new Date(dateStr), 'd MMM')),
    datasets: [{
      label: 'น้ำหนัก (กก.)',
      data: recentWeightDates.map(dateStr => weightHistory[dateStr]),
      borderColor: 'rgb(249, 115, 22)',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      borderWidth: 3, tension: 0.3, fill: true,
      pointBackgroundColor: 'white', pointBorderColor: 'rgb(249, 115, 22)',
      pointBorderWidth: 2, pointRadius: 4,
    }],
  };

  // --- SLEEP DATA ---
  const sortedSleepDates = Object.keys(sleepHistory).sort();
  const recentSleepDates = sortedSleepDates.slice(-14); // Last 14 days
  const sleepChartData = {
    labels: recentSleepDates.map(dateStr => format(new Date(dateStr), 'd MMM')),
    datasets: [{
      label: 'ชั่วโมงการนอน',
      data: recentSleepDates.map(dateStr => sleepHistory[dateStr].durationHours),
      backgroundColor: recentSleepDates.map(dateStr => {
        const hrs = sleepHistory[dateStr].durationHours;
        if (hrs >= 7) return 'rgba(16, 185, 129, 0.8)'; // Emerald
        if (hrs >= 5.5) return 'rgba(251, 191, 36, 0.8)'; // Amber
        return 'rgba(239, 68, 68, 0.8)'; // Red
      }),
      borderRadius: 4,
    }],
  };

  const barOptions = { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } }, plugins: { legend: { display: false } } };
  const lineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] overflow-y-auto bg-slate-50 pb-8">
      <div className="pt-8 pb-4 px-6 bg-white shadow-sm sticky top-0 z-20">
        <h1 className="text-2xl font-bold text-slate-800">Stats & Progress</h1>
      </div>

      <div className="p-4 space-y-6">
        {/* Tab Switcher */}
        <div className="flex bg-slate-200/50 p-1 rounded-2xl">
          <button onClick={() => setActiveTab('habits')} className={cn("flex-1 py-2 text-xs font-bold rounded-xl flex flex-col items-center gap-1 transition-all", activeTab === 'habits' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500")}>
            <Activity size={16} /> พฤติกรรม
          </button>
          <button onClick={() => setActiveTab('weight')} className={cn("flex-1 py-2 text-xs font-bold rounded-xl flex flex-col items-center gap-1 transition-all", activeTab === 'weight' ? "bg-white text-orange-600 shadow-sm" : "text-slate-500")}>
            <Scale size={16} /> น้ำหนัก
          </button>
          <button onClick={() => setActiveTab('sleep')} className={cn("flex-1 py-2 text-xs font-bold rounded-xl flex flex-col items-center gap-1 transition-all", activeTab === 'sleep' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500")}>
            <Moon size={16} /> การนอน
          </button>
        </div>

        {activeTab === 'habits' && (
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            {/* Calendar */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <button onClick={prevMonth} className="p-2 hover:bg-slate-100 rounded-full transition"><ChevronLeft size={20} /></button>
                <h2 className="text-lg font-bold text-slate-800">{format(currentDate, 'MMMM yyyy')}</h2>
                <button onClick={nextMonth} className="p-2 hover:bg-slate-100 rounded-full transition"><ChevronRight size={20} /></button>
              </div>
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => <div key={day}>{day}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {blanks.map(i => <div key={`blank-${i}`} className="aspect-square"></div>)}
                {daysInMonth.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const dayData = history[dateStr];
                  const isCurrentMonth = isSameMonth(day, currentDate);
                  const isTodayDate = isToday(day);
                  return (
                    <div key={dateStr} className={cn("aspect-square flex items-center justify-center rounded-xl text-sm font-bold transition-all relative", !isCurrentMonth && "opacity-30", dayData ? getColorClass(dayData.percentage) : "bg-slate-50 text-slate-400", isTodayDate && !dayData && "ring-2 ring-indigo-500 text-indigo-600 bg-indigo-50")}>
                      {format(day, 'd')}
                      {isTodayDate && <div className="absolute -bottom-1 w-1 h-1 bg-indigo-600 rounded-full"></div>}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Habit Chart */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">แนวโน้มความเป๊ะสัปดาห์นี้</h2>
              <div className="h-48 w-full"><Bar data={habitChartData} options={barOptions} /></div>
            </div>
          </motion.div>
        )}

        {activeTab === 'weight' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
              <h2 className="text-lg font-bold mb-4 relative z-10 flex items-center gap-2">อัปเดตน้ำหนักล่าสุด ⚖️</h2>
              <form onSubmit={handleSaveWeight} className="relative z-10">
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <input type="number" step="0.1" value={todayWeight} onChange={(e) => setTodayWeight(e.target.value)} placeholder="เช่น 74.5" className="w-full bg-white/20 border border-white/30 rounded-2xl px-4 py-3 text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all font-bold text-lg" required />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 font-medium text-sm">กก.</span>
                  </div>
                  <button type="submit" className="bg-white text-orange-600 font-bold px-6 py-3 rounded-2xl shadow-sm hover:bg-orange-50 active:scale-95 transition-all">บันทึก</button>
                </div>
              </form>
            </div>
            {/* Weight Chart */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <h2 className="text-lg font-bold text-slate-800 mb-4">กราฟการเปลี่ยนแปลง</h2>
              {sortedWeightDates.length > 0 ? (
                <div className="h-56 w-full"><Line data={weightChartData} options={lineOptions} /></div>
              ) : (
                <div className="h-48 w-full flex items-center justify-center flex-col text-slate-400"><Scale size={32} className="mb-2 opacity-50" /><p className="text-sm">ยังไม่มีประวัติน้ำหนัก</p></div>
              )}
            </div>
            {/* Weight History List */}
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <h2 className="text-sm font-bold text-slate-800 mb-4">ประวัติ 5 ครั้งล่าสุด</h2>
              <div className="space-y-3">
                {[...sortedWeightDates].reverse().slice(0, 5).map((dateStr) => (
                  <div key={dateStr} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                    <span className="text-xs font-bold text-slate-500">{format(new Date(dateStr), 'd MMMM yyyy')}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-800 text-sm">{weightHistory[dateStr].toFixed(1)} กก.</span>
                      <button onClick={() => handleDeleteWeight(dateStr)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'sleep' && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute right-0 top-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <Moon className="absolute right-4 bottom-4 w-24 h-24 text-white/5 rotate-[-15deg]" />
              <h2 className="text-lg font-bold mb-2 relative z-10 flex items-center gap-2">คุณภาพการนอนหลับ 💤</h2>
              <p className="text-xs text-blue-100 leading-relaxed relative z-10">
                การนอน 7-8 ชม. สำคัญเท่ากับการยกเวท เพราะร่างกายจะหลั่ง Growth Hormone ออกมาซ่อมแซมและสร้างกล้ามเนื้อขณะที่คุณหลับลึกเท่านั้น
              </p>
            </div>
            
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">ประวัติการนอน 14 วันล่าสุด</h2>
              </div>
              {sortedSleepDates.length > 0 ? (
                <>
                  <div className="h-56 w-full"><Bar data={sleepChartData} options={barOptions} /></div>
                  <div className="flex justify-center gap-4 mt-6 text-[10px] font-medium text-slate-500 uppercase tracking-wide">
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> ดีเยี่ยม (7ชม.+)</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div> พอใช้</div>
                    <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> แย่</div>
                  </div>
                </>
              ) : (
                <div className="h-48 w-full flex items-center justify-center flex-col text-slate-400">
                  <Moon size={32} className="mb-2 opacity-50" />
                  <p className="text-sm">ยังไม่มีประวัติการนอน</p>
                  <p className="text-xs mt-1">กดปุ่ม "เข้านอน" ที่หน้า Check-in เพื่อเริ่มบันทึก</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
