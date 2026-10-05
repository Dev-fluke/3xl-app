"use client";

import { useState, useEffect } from 'react';
import { Dumbbell, Activity, Flame, Heart, Timer, CheckCircle2, ChevronDown, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// --- DATA: 4 Levels of Workout Plans ---

const planLevel1_2 = [
  { dayId: 1, type: 'cardio', title: 'เดินเบาๆ / ขยับร่างกาย', desc: 'เน้นสร้างนิสัยขยับตัว 15-20 นาที', time: '15-20 นาที', color: 'bg-emerald-500', exercises: [{ name: 'เดินเล่นรอบหมู่บ้าน / ยืดเหยียด', reps: '15-20 นาที', tip: 'ไม่ต้องเหนื่อยมาก แค่ให้ร่างกายตื่นตัว' }] },
  { dayId: 2, type: 'rest', title: 'พักผ่อน', desc: 'ทำงานตามปกติ', time: '-', color: 'bg-slate-400', exercises: [{ name: 'พักผ่อน', reps: '-', tip: '-' }] },
  { dayId: 3, type: 'cardio', title: 'ทำงานบ้าน / ยืดเหยียด', desc: 'เพิ่ม NEAT (การขยับตัวในชีวิตประจำวัน)', time: '20 นาที', color: 'bg-emerald-500', exercises: [{ name: 'ทำงานบ้าน / เดินขึ้นบันได', reps: '-', tip: 'ขยับตัวให้บ่อยขึ้น' }] },
  { dayId: 4, type: 'rest', title: 'พักผ่อน', desc: 'ทำงานตามปกติ', time: '-', color: 'bg-slate-400', exercises: [{ name: 'พักผ่อน', reps: '-', tip: '-' }] },
  { dayId: 5, type: 'cardio', title: 'เดินเบาๆ / โยคะ', desc: 'ผ่อนคลายกล้ามเนื้อ', time: '15-20 นาที', color: 'bg-emerald-500', exercises: [{ name: 'เดินรับลม / โยคะก่อนนอน', reps: '15-20 นาที', tip: 'ช่วยให้หลับสบายขึ้น' }] },
  { dayId: 6, type: 'rest', title: 'พักผ่อน', desc: 'ทำงานตามปกติ', time: '-', color: 'bg-slate-400', exercises: [{ name: 'พักผ่อน', reps: '-', tip: '-' }] },
  { dayId: 0, type: 'rest', title: 'พักผ่อน', desc: 'ทำงานตามปกติ', time: '-', color: 'bg-slate-400', exercises: [{ name: 'พักผ่อน', reps: '-', tip: '-' }] }
];

const planLevel1_375 = [
  { dayId: 1, type: 'weight', title: 'Full Body Weight Training', desc: 'บริหารกล้ามเนื้อทุกส่วน กระตุ้นการเผาผลาญ', time: '40 นาที', color: 'bg-indigo-500', exercises: [
    { name: 'Squats', reps: '3 x 12-15 ครั้ง', tip: 'บริหารขาและก้น' },
    { name: 'Push Ups (วิดพื้น/วางเข่า)', reps: '3 x 10-12 ครั้ง', tip: 'บริหารหน้าอกและแขน' },
    { name: 'Dumbbell Row', reps: '3 x 12 ครั้ง', tip: 'บริหารหลัง' }
  ]},
  { dayId: 2, type: 'rest', title: 'พักผ่อนกล้ามเนื้อ', desc: 'ฟื้นฟูกล้ามเนื้อที่เล่นไปเมื่อวาน', time: '-', color: 'bg-slate-400', exercises: [{ name: 'พักผ่อน', reps: '-', tip: '-' }] },
  { dayId: 3, type: 'cardio', title: 'Light Cardio (Zone 2)', desc: 'ฝึกความทนทานของหัวใจ', time: '30 นาที', color: 'bg-emerald-500', exercises: [
    { name: 'เดินชัน / ปั่นจักรยาน', reps: '30 นาที', tip: 'เหนื่อยระดับที่ยังพูดคุยได้' }
  ]},
  { dayId: 4, type: 'rest', title: 'พักผ่อน', desc: '-', time: '-', color: 'bg-slate-400', exercises: [{ name: 'พักผ่อน', reps: '-', tip: '-' }] },
  { dayId: 5, type: 'weight', title: 'Full Body Weight Training', desc: 'บริหารกล้ามเนื้อทุกส่วน กระตุ้นรอบสอง', time: '40 นาที', color: 'bg-indigo-500', exercises: [
    { name: 'Lunges', reps: '3 x 10 ครั้ง/ข้าง', tip: 'บริหารขา' },
    { name: 'Dumbbell Shoulder Press', reps: '3 x 12 ครั้ง', tip: 'บริหารไหล่' },
    { name: 'Plank', reps: '3 x 45 วินาที', tip: 'แกนกลางลำตัว' }
  ]},
  { dayId: 6, type: 'rest', title: 'พักผ่อน', desc: '-', time: '-', color: 'bg-slate-400', exercises: [{ name: 'พักผ่อน', reps: '-', tip: '-' }] },
  { dayId: 0, type: 'rest', title: 'พักผ่อน', desc: '-', time: '-', color: 'bg-slate-400', exercises: [{ name: 'พักผ่อน', reps: '-', tip: '-' }] }
];

const planLevel1_55 = [
  { dayId: 1, type: 'weight', title: 'Weight Training (Push Day)', desc: 'หน้าอก ไหล่ และหลังแขน', time: '45-60 นาที', color: 'bg-indigo-500', exercises: [
    { name: 'Push Ups (วิดพื้น)', reps: '3 x 10-15 ครั้ง', tip: 'เกร็งหน้าท้องลงให้สุด' },
    { name: 'Dumbbell Bench Press', reps: '3 x 10-12 ครั้ง', tip: 'โฟกัสที่หน้าอก' },
    { name: 'Dumbbell Shoulder Press', reps: '3 x 10-12 ครั้ง', tip: 'หลังตรง ไม่เหวี่ยง' },
    { name: 'Tricep Dips', reps: '3 x 12-15 ครั้ง', tip: 'ศอกอยู่นิ่ง โฟกัสหลังแขน' },
  ]},
  { dayId: 2, type: 'cardio', title: 'Light Cardio (Zone 2)', desc: 'คาร์ดิโอเบาๆ เบิร์นไขมัน', time: '30-45 นาที', color: 'bg-emerald-500', exercises: [
    { name: 'เดินเร็ว หรือ ปั่นจักรยาน', reps: '30-45 นาที', tip: 'เป้าหมาย Heart Rate Zone 2' },
  ]},
  { dayId: 3, type: 'weight', title: 'Weight Training (Pull Day)', desc: 'หลัง หน้าแขน และหน้าท้อง', time: '45-60 นาที', color: 'bg-indigo-500', exercises: [
    { name: 'Dumbbell Row', reps: '3 x 10-12 ครั้ง', tip: 'ดึงศอกไปด้านหลัง บีบสะบัก' },
    { name: 'Lat Pulldown (ถ้ายางยืด)', reps: '3 x 10-12 ครั้ง', tip: 'ดึงลงมาที่อกบน' },
    { name: 'Bicep Curls', reps: '3 x 12-15 ครั้ง', tip: 'ล็อคศอกแนบลำตัว' },
    { name: 'Plank', reps: '3 x 45-60 วินาที', tip: 'เกร็งหน้าท้อง' },
  ]},
  { dayId: 4, type: 'cardio', title: 'Light Cardio (Zone 2)', desc: 'คาร์ดิโอเบาๆ เบิร์นไขมันต่อเนื่อง', time: '30-45 นาที', color: 'bg-emerald-500', exercises: [
    { name: 'เดินชัน (Incline Walk)', reps: '30-45 นาที', tip: 'ความชัน 5-10%' },
  ]},
  { dayId: 5, type: 'weight', title: 'Weight Training (Leg Day)', desc: 'ขา ก้น และแกนกลาง', time: '45-60 นาที', color: 'bg-indigo-500', exercises: [
    { name: 'Squats', reps: '4 x 12-15 ครั้ง', tip: 'ย่อลึก น้ำหนักลงส้นเท้า' },
    { name: 'Lunges', reps: '3 x 10-12 ครั้ง/ข้าง', tip: 'เข่าไม่เลยปลายเท้า' },
    { name: 'Glute Bridges', reps: '3 x 15 ครั้ง', tip: 'ดันสะโพก เกร็งก้น' },
    { name: 'Crunch', reps: '3 x 15-20 ครั้ง', tip: 'ม้วนหน้าท้อง' },
  ]},
  { dayId: 6, type: 'rest', title: 'Active Rest Day', desc: 'พักผ่อน ยืดเหยียด', time: '15 นาที', color: 'bg-slate-400', exercises: [
    { name: 'Stretching', reps: '15 นาที', tip: 'ลดตึงเครียดกล้ามเนื้อ' },
  ]},
  { dayId: 0, type: 'rest', title: 'Full Rest Day', desc: 'พักผ่อน 100%', time: '-', color: 'bg-slate-400', exercises: [
    { name: 'พักผ่อน', reps: '-', tip: 'นอน 7-8 ชม.' },
  ]}
];

const planLevel1_725 = [
  { dayId: 1, type: 'weight', title: 'Push Day (อก/ไหล่/หลังแขน)', desc: 'เล่นหนัก โฟกัสความแข็งแรง', time: '60 นาที', color: 'bg-indigo-500', exercises: [
    { name: 'Bench Press', reps: '4 x 8-10 ครั้ง', tip: 'เพิ่มน้ำหนัก' },
    { name: 'Overhead Press', reps: '4 x 8-10 ครั้ง', tip: '-' },
    { name: 'Tricep Extension', reps: '3 x 12 ครั้ง', tip: '-' }
  ]},
  { dayId: 2, type: 'weight', title: 'Pull Day (หลัง/หน้าแขน)', desc: 'เล่นหนัก', time: '60 นาที', color: 'bg-indigo-500', exercises: [
    { name: 'Pull Ups / Lat Pulldown', reps: '4 x 8-10 ครั้ง', tip: '-' },
    { name: 'Barbell Row', reps: '4 x 8-10 ครั้ง', tip: '-' },
    { name: 'Bicep Curls', reps: '3 x 12 ครั้ง', tip: '-' }
  ]},
  { dayId: 3, type: 'weight', title: 'Leg Day (ขา/ก้น)', desc: 'เล่นหนัก', time: '60 นาที', color: 'bg-indigo-500', exercises: [
    { name: 'Squats', reps: '4 x 8-10 ครั้ง', tip: '-' },
    { name: 'Romanian Deadlift', reps: '4 x 10 ครั้ง', tip: '-' },
    { name: 'Calf Raises', reps: '4 x 15 ครั้ง', tip: '-' }
  ]},
  { dayId: 4, type: 'cardio', title: 'Cardio / HIIT', desc: 'เผาผลาญเต็มที่', time: '40 นาที', color: 'bg-emerald-500', exercises: [
    { name: 'HIIT Sprints หรือ ปั่นจักรยานเร็วสลับช้า', reps: '20 นาที', tip: 'เร่ง Heart rate' },
    { name: 'เดินเบา Zone 2', reps: '20 นาที', tip: 'คูลดาวน์' }
  ]},
  { dayId: 5, type: 'weight', title: 'Upper Body (ตัวบนทั้งหมด)', desc: 'ปั๊มกล้ามเนื้อ', time: '60 นาที', color: 'bg-indigo-500', exercises: [
    { name: 'Incline Press', reps: '3 x 12 ครั้ง', tip: '-' },
    { name: 'Seated Cable Row', reps: '3 x 12 ครั้ง', tip: '-' },
    { name: 'Lateral Raises', reps: '4 x 15 ครั้ง', tip: '-' }
  ]},
  { dayId: 6, type: 'weight', title: 'Lower Body (ตัวล่างทั้งหมด)', desc: 'ปั๊มกล้ามเนื้อ', time: '60 นาที', color: 'bg-indigo-500', exercises: [
    { name: 'Leg Press', reps: '3 x 12 ครั้ง', tip: '-' },
    { name: 'Leg Curls', reps: '3 x 12 ครั้ง', tip: '-' },
    { name: 'Plank & Core', reps: '10 นาที', tip: '-' }
  ]},
  { dayId: 0, type: 'rest', title: 'Rest & Recover', desc: 'พักผ่อน 100%', time: '-', color: 'bg-slate-400', exercises: [
    { name: 'พักผ่อนเต็มที่', reps: '-', tip: 'กินโปรตีนให้ถึง' }
  ]}
];

// Map names for the UI subtitle
const activityLabels: Record<string, string> = {
  '1.2': 'โปรแกรมเบาพิเศษ (นั่งทำงาน/ไม่ออกกำลังกาย)',
  '1.375': 'โปรแกรมสำหรับผู้เริ่มต้น (1-3 วัน/สัปดาห์)',
  '1.55': 'โปรแกรมมาตรฐาน (3-5 วัน/สัปดาห์)',
  '1.725': 'โปรแกรมสายโหด (6 วัน/สัปดาห์)',
  '1.9': 'โปรแกรมสายโหด (6 วัน/สัปดาห์)'
};

export default function WorkoutGuide() {
  const [todayId, setTodayId] = useState(1);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const [activityLvl, setActivityLvl] = useState('1.55');

  useEffect(() => {
    // Get Activity Level from TDEE localstorage
    const tdeeData = localStorage.getItem('tdee_data');
    if (tdeeData) {
      const parsed = JSON.parse(tdeeData);
      if (parsed.activity) {
        setActivityLvl(parsed.activity);
      }
    }

    const day = new Date().getDay(); 
    setTodayId(day);
    setExpandedId(day);
  }, []);

  const toggleExpand = (id: number) => {
    if (expandedId === id) setExpandedId(null);
    else setExpandedId(id);
  };

  // Determine active plan
  let activePlan = planLevel1_55;
  if (activityLvl === '1.2') activePlan = planLevel1_2;
  else if (activityLvl === '1.375') activePlan = planLevel1_375;
  else if (activityLvl === '1.725' || activityLvl === '1.9') activePlan = planLevel1_725;

  const planName = activityLabels[activityLvl] || 'โปรแกรมมาตรฐาน';

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] overflow-y-auto bg-slate-50 pb-8 relative">
      <div className="pt-8 pb-4 px-6 bg-white shadow-sm sticky top-0 z-10 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Workout Plan</h1>
        <Dumbbell className="text-slate-400" />
      </div>

      <div className="p-4 space-y-4">
        {/* Header Summary */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 text-white shadow-md">
          <h2 className="text-lg font-bold mb-2">ตารางฝึกของคุณ 🚀</h2>
          <p className="text-xs text-indigo-100 leading-relaxed mb-4">
            ปรับเปลี่ยนอัตโนมัติจากระดับกิจกรรมที่คุณเลือกไว้ในหน้า TDEE<br/>
            (ปัจจุบัน: <strong>{planName}</strong>)
          </p>
          
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-white/10 rounded-xl p-2 border border-white/20">
              <Dumbbell size={16} className="mx-auto mb-1 text-indigo-200" />
              <span className="font-bold">เวทเทรนนิ่ง</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/20">
              <Activity size={16} className="mx-auto mb-1 text-emerald-200" />
              <span className="font-bold">คาร์ดิโอ</span>
            </div>
            <div className="bg-white/10 rounded-xl p-2 border border-white/20">
              <Heart size={16} className="mx-auto mb-1 text-rose-200" />
              <span className="font-bold">วันพัก</span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        {activityLvl === '1.2' && (
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl flex gap-2 border border-emerald-100 text-xs shadow-sm">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>เนื่องจากคุณเลือกระดับกิจกรรม <b>"ไม่ออกกำลังกาย"</b> ตารางฝึกนี้จึงเน้นไปที่การขยับตัวเบาๆ เพื่อให้คุณเริ่มสร้างนิสัยได้ง่ายๆ โดยไม่บาดเจ็บครับ</p>
          </div>
        )}
        {activityLvl === '1.375' && (
          <div className="bg-emerald-50 text-emerald-700 p-3 rounded-2xl flex gap-2 border border-emerald-100 text-xs shadow-sm">
            <Info size={16} className="shrink-0 mt-0.5" />
            <p>โปรแกรมสำหรับผู้เริ่มต้น เน้นบริหารกล้ามเนื้อทุกส่วน (Full Body) ในวันเดียว เพื่อให้มีวันพักฟื้นเยอะๆ ครับ</p>
          </div>
        )}

        {/* Schedule List */}
        <div className="space-y-3 mt-2">
          {/* Map in specific order: Mon (1) to Sun (0) */}
          {[1, 2, 3, 4, 5, 6, 0].map(dayId => {
            const plan = activePlan.find(p => p.dayId === dayId)!;
            const isToday = todayId === dayId;
            const isExpanded = expandedId === dayId;

            return (
              <div 
                key={dayId} 
                className={cn(
                  "bg-white rounded-2xl overflow-hidden shadow-sm transition-all border",
                  isToday ? "border-indigo-500 ring-1 ring-indigo-500" : "border-slate-100"
                )}
              >
                {/* Accordion Header */}
                <button 
                  onClick={() => toggleExpand(dayId)}
                  className="w-full text-left p-4 flex items-center justify-between bg-white"
                >
                  <div className="flex items-center gap-4">
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm", plan.color)}>
                      {plan.type === 'weight' && <Dumbbell size={20} />}
                      {plan.type === 'cardio' && <Flame size={20} />}
                      {plan.type === 'rest' && <Heart size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className={cn("text-xs font-bold uppercase tracking-wide", isToday ? "text-indigo-600" : "text-slate-400")}>
                          {['วันอาทิตย์', 'วันจันทร์', 'วันอังคาร', 'วันพุธ', 'วันพฤหัสบดี', 'วันศุกร์', 'วันเสาร์'][dayId]} {isToday && "(วันนี้)"}
                        </p>
                      </div>
                      <h3 className="text-sm font-bold text-slate-800">{plan.title}</h3>
                    </div>
                  </div>
                  <ChevronDown size={20} className={cn("text-slate-400 transition-transform", isExpanded ? "rotate-180" : "")} />
                </button>

                {/* Accordion Body */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 pt-1 border-t border-slate-50 mx-4">
                        <div className="flex items-center gap-2 mb-4 mt-2">
                          <Timer size={14} className="text-indigo-400" />
                          <span className="text-xs font-medium text-slate-500">เวลาที่ใช้: {plan.time}</span>
                        </div>
                        
                        <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
                          {plan.desc}
                        </p>

                        <div className="space-y-3">
                          {plan.exercises.map((ex, idx) => (
                            <div key={idx} className="flex gap-3">
                              <div className="mt-0.5">
                                <CheckCircle2 size={16} className={plan.type === 'rest' ? "text-slate-400" : "text-emerald-500"} />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-slate-800">{ex.name}</p>
                                <p className="text-xs font-medium text-indigo-600 my-0.5">{ex.reps}</p>
                                <p className="text-[11px] text-slate-500">{ex.tip}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
