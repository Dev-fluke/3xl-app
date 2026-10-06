"use client";

import { useState, useEffect, useCallback } from 'react';
import { Calculator, Clock, Utensils, Shuffle, Coffee, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserData } from '@/hooks/useUserData';

// Category 1: ทั่วไป (20 รายการ)
const mealsGeneral = [
  { name: 'แซลมอนย่างเกลือ + สลัด', cals: 400, protein: 35 },
  { name: 'สเต็กอกไก่พริกไทยดำ + สลัด', cals: 250, protein: 35 },
  { name: 'ปลานึ่งมะนาว + ข้าวไรซ์เบอร์รี่', cals: 280, protein: 30 },
  { name: 'สลัดโรลอกไก่พริกไทยดำ', cals: 200, protein: 25 },
  { name: 'เมี่ยงปลาเผา', cals: 300, protein: 35 },
  { name: 'ซุปฟักทอง + อกไก่ฉีก', cals: 220, protein: 25 },
  { name: 'ข้าวโอ๊ตต้มไก่สับ', cals: 250, protein: 20 },
  { name: 'โจ๊กข้าวโอ๊ตไข่ลวก', cals: 200, protein: 14 },
  { name: 'สปาเก็ตตี้โฮลวีตอกไก่สับ', cals: 380, protein: 30 },
  { name: 'ข้าวผัดแซลมอน (ใช้น้ำมันมะกอก)', cals: 450, protein: 28 },
  { name: 'เต้าหู้เย็นราดซอสพอนสึ + อกไก่ฉีก', cals: 180, protein: 22 },
  { name: 'ยำทูน่า (น้ำแร่) + ข้าวกล้อง', cals: 250, protein: 30 },
  { name: 'แซนด์วิชโฮลวีตทูน่าไข่ต้ม', cals: 320, protein: 20 },
  { name: 'สลัดเต้าหู้คินุ + น้ำสลัดงาใส', cals: 200, protein: 15 },
  { name: 'ข้าวกล้องหน้าปลาซาบะย่าง', cals: 420, protein: 25 },
  { name: 'แกงจืดเต้าหู้หมูสับเนื้อแดง + ข้าว', cals: 320, protein: 25 },
  { name: 'ต้มยำน้ำใสไก่ + ข้าว', cals: 320, protein: 25 },
  { name: 'แกงเลียงกุ้งสด + ข้าว', cals: 280, protein: 22 },
  { name: 'ข้าวไข่ขยี้กุ้ง', cals: 320, protein: 28 },
  { name: 'ยำวุ้นเส้นไก่สับ', cals: 280, protein: 25 }
];

// Category 2: อาหารตามสั่ง แบบคลีน (20 รายการ)
const mealsStreet = [
  { name: 'กะเพราอกไก่ (ไม่ใส่น้ำมัน) + ข้าว', cals: 350, protein: 35 },
  { name: 'สุกี้แห้งไก่ (ไม่ใส่น้ำมัน)', cals: 350, protein: 32 },
  { name: 'ข้าวผัดต้มยำกุ้งอกไก่ (ผัดน้ำ)', cals: 380, protein: 35 },
  { name: 'ลาบอกไก่ + ข้าวเหนียว', cals: 300, protein: 35 },
  { name: 'น้ำพริกอ่องหมูสับ (มันน้อย) + ไข่ต้ม + ข้าว', cals: 400, protein: 28 },
  { name: 'ผัดผักรวมมิตรกุ้ง (ผัดน้ำ) + ข้าว', cals: 380, protein: 25 },
  { name: 'แกงส้มชะอมกุ้ง + ข้าว', cals: 400, protein: 25 },
  { name: 'อกไก่ผัดบล็อกโคลี่ + ข้าว', cals: 350, protein: 30 },
  { name: 'ผัดกะหล่ำปลีอกไก่สับ + ข้าว', cals: 400, protein: 28 },
  { name: 'ส้มตำไทย + ไก่ย่าง (ไม่หนัง) + ข้าวเหนียว', cals: 450, protein: 35 },
  { name: 'ผัดซีอิ๊วเส้นหมี่ข้าวกล้องไก่ (ผัดน้ำ)', cals: 380, protein: 30 },
  { name: 'พล่ากุ้ง + ข้าว', cals: 300, protein: 25 },
  { name: 'อกไก่ผัดพริกแกงถั่วฝักยาว + ข้าว', cals: 420, protein: 32 },
  { name: 'ข้าวหมูกระเทียม (ใช้หมูสันใน/ผัดน้ำ)', cals: 380, protein: 28 },
  { name: 'ราดหน้าเส้นหมี่ไก่ (ไม่ใส่เต้าเจี้ยวเยอะ)', cals: 350, protein: 25 },
  { name: 'ไก่ผัดเม็ดมะม่วง (ไม่ทอด/ผัดน้ำ) + ข้าว', cals: 400, protein: 30 },
  { name: 'ผัดเปรี้ยวหวานอกไก่ + ข้าว', cals: 350, protein: 28 },
  { name: 'ต้มข่าไก่ (กะทิธัญพืช) + ข้าว', cals: 380, protein: 25 },
  { name: 'ยำหมูยอ (หมูยอคลีน) + ข้าว', cals: 300, protein: 20 },
  { name: 'ไข่ยัดไส้อกไก่สับ (ทอดน้ำ) + ข้าว', cals: 350, protein: 30 },
];

// Category 3: ราคาไม่แพง เน้นอกไก่/ไข่ (40 รายการ)
const mealsBudget = [
  { name: 'อกไก่ต้ม + ข้าวกล้อง + น้ำจิ้มแจ่ว', cals: 300, protein: 35 },
  { name: 'ไข่ต้ม 3 ฟอง + ข้าว', cals: 320, protein: 21 },
  { name: 'ไข่ดาวน้ำ 2 ฟอง + อกไก่ฉีก + ข้าว', cals: 350, protein: 30 },
  { name: 'ข้าวไข่เจียว (ทอดด้วยน้ำ) + ซอสพริก', cals: 280, protein: 14 },
  { name: 'อกไก่นาบกระทะ + ไข่ต้ม + ข้าว', cals: 380, protein: 42 },
  { name: 'กะเพราไก่สับ (ทำเอง/ผัดน้ำ) + ข้าว', cals: 320, protein: 30 },
  { name: 'ไข่ตุ๋นไมโครเวฟ (ใส่ไก่สับ) + ข้าว', cals: 300, protein: 25 },
  { name: 'ข้าวผัดไข่ใส่ไก่สับ (ไม่ใช้น้ำมัน)', cals: 350, protein: 28 },
  { name: 'ยำไข่ต้ม (3 ฟอง) + ข้าว', cals: 340, protein: 21 },
  { name: 'ไก่รวนน้ำปลา + ข้าว', cals: 300, protein: 32 },
  { name: 'อกไก่ผัดแตงกวา + ข้าว', cals: 280, protein: 28 },
  { name: 'อกไก่ผัดถั่วพู + ข้าว', cals: 320, protein: 30 },
  { name: 'ข้าวต้มไก่สับ', cals: 250, protein: 25 },
  { name: 'ต้มจืดผักกาดขาวอกไก่สับ + ข้าว', cals: 280, protein: 28 },
  { name: 'ไข่คั่วพริกเกลือ (ไข่ 2 ฟอง/ไม่มัน) + ข้าว', cals: 300, protein: 14 },
  { name: 'ไก่ผัดผักบุ้ง (ผัดน้ำ) + ข้าว', cals: 280, protein: 28 },
  { name: 'อกไก่ย่างหม้อลมร้อน + ข้าว', cals: 300, protein: 35 },
  { name: 'สลัดอกไก่ฉีก (ผักตลาด+ไก่ต้ม)', cals: 200, protein: 30 },
  { name: 'ไข่คน (Scrambled) ทอดน้ำ + ข้าว', cals: 280, protein: 14 },
  { name: 'อกไก่หมักซอสหอยนางรมนาบกระทะ + ข้าว', cals: 320, protein: 32 },
  { name: 'ผัดกะหล่ำปลีอกไก่ + ข้าว', cals: 300, protein: 28 },
  { name: 'อกไก่สับคั่วกลิ้ง + ข้าว', cals: 320, protein: 32 },
  { name: 'ยำอกไก่ยอ (ทำเอง) + ข้าว', cals: 280, protein: 30 },
  { name: 'ไข่ยัดไส้ไก่สับ (ใช้น้ำมันสเปรย์) + ข้าว', cals: 350, protein: 30 },
  { name: 'อกไก่ผัดพริกหยวก + ข้าว', cals: 300, protein: 30 },
  { name: 'น้ำพริกหนุ่ม + อกไก่ต้ม + ผักลวก', cals: 250, protein: 35 },
  { name: 'น้ำพริกตาแดง + ไข่ต้ม 2 ฟอง + ข้าว', cals: 300, protein: 14 },
  { name: 'ผัดหน่อไม้ไก่สับ (ผัดน้ำ) + ข้าว', cals: 320, protein: 28 },
  { name: 'ต้มแซ่บอกไก่ + ข้าว', cals: 300, protein: 35 },
  { name: 'อกไก่ผัดขิง + ข้าว', cals: 310, protein: 30 },
  { name: 'ข้าวหน้าไก่เทอริยากิ (ซอสคลีน)', cals: 350, protein: 32 },
  { name: 'ไข่ข้น (ใช้นม0%) + ไก่สับ + ข้าว', cals: 350, protein: 25 },
  { name: 'ผัดมะเขือยาวอกไก่ + ข้าว', cals: 320, protein: 28 },
  { name: 'ไก่สับผัดผงกะหรี่ (ผัดน้ำ) + ข้าว', cals: 350, protein: 30 },
  { name: 'อกไก่ผัดพริกเผา (พริกเผาคลีน) + ข้าว', cals: 340, protein: 30 },
  { name: 'ก๋วยเตี๋ยวลุยสวนอกไก่ (ทำเอง)', cals: 250, protein: 25 },
  { name: 'ฟักทองผัดไข่ใส่ไก่สับ + ข้าว', cals: 350, protein: 25 },
  { name: 'ต้มข่าไก่ (ใช้นมสด0%แทนกะทิ) + ข้าว', cals: 320, protein: 30 },
  { name: 'แกงป่าไก่สับ + ข้าว', cals: 280, protein: 30 },
  { name: 'น้ำตกอกไก่ย่าง + ข้าว', cals: 320, protein: 35 },
];

type MealPlanItem = {
  name: string;
  cals: number;
  protein: number;
  portion: number;
  time: string;
  isSnack?: boolean;
};

type MealCategory = 'general' | 'street' | 'budget';

// Helper function to generate practical ingredients breakdown
const getPracticalDetails = (name: string, protein: number, cals: number, portion: number) => {
  // We deduce base values from the multiplied values, because state holds the final values
  const baseProtein = protein / portion;
  const baseCals = cals / portion;

  let meatText = "";
  let baseMeatCals = 0;
  
  if (name.includes('ไข่') && !name.includes('ไก่') && !name.includes('หมู')) {
    const eggCount = Math.round((baseProtein / 7) * portion);
    meatText = `ไข่ไก่ ${eggCount} ฟอง`;
    baseMeatCals = (baseProtein / 7) * 75; 
  } else if (name.includes('กุ้ง')) {
    const shrimpCount = Math.round((baseProtein / 1.5) * portion);
    meatText = `กุ้ง ${shrimpCount} ตัว`;
    baseMeatCals = baseProtein * 4.5;
  } else if (name.includes('ปลา') || name.includes('แซลมอน') || name.includes('ซาบะ') || name.includes('ทูน่า')) {
    const fishGrams = Math.round((baseProtein / 20 * 100) * portion);
    meatText = name.includes('แซลมอน') ? `แซลมอน ${fishGrams}g` : `เนื้อปลา ${fishGrams}g`;
    baseMeatCals = name.includes('แซลมอน') ? baseProtein * 6 : baseProtein * 4.5;
  } else if (name.includes('หมู')) {
    const porkGrams = Math.round((baseProtein / 20 * 100) * portion);
    meatText = `หมูชิ้น/หมูสับ ${porkGrams}g`;
    baseMeatCals = baseProtein * 5.5;
  } else {
    // Default to Chicken
    const chickenGrams = Math.round((baseProtein / 23 * 100) * portion);
    const kheed = (chickenGrams / 100).toFixed(1).replace('.0', '');
    meatText = `อกไก่ ${chickenGrams}g (${kheed}ขีด)`;
    baseMeatCals = baseProtein * 4.5; 
  }

  // Calculate Carbs
  let carbText = "";
  const remainingCals = baseCals - baseMeatCals;
  const baseCarbLadles = Math.max(0, remainingCals / 80); 
  const totalLadles = (baseCarbLadles * portion).toFixed(1).replace('.0', '');

  if (name.includes('เส้น') || name.includes('สปาเก็ตตี้') || name.includes('ก๋วยเตี๋ยว')) {
    carbText = `เส้น ${totalLadles} ทัพพี`;
  } else if (name.includes('ข้าวโอ๊ต')) {
    carbText = `ข้าวโอ๊ต ${Math.round(baseCarbLadles * 3 * portion)} ชต.`;
  } else if (name.includes('สลัด') && !name.includes('ข้าว')) {
    carbText = `ผักสลัด 1 จานใหญ่`;
  } else if (baseCarbLadles > 0.3) {
    carbText = `ข้าว ${totalLadles} ทัพพี`;
  } else {
    carbText = `ไม่เน้นแป้ง`;
  }

  // Calculate Veggies (Dynamic name if possible)
  let vegName = "ผักรวม";
  if (name.includes('ถั่วพู')) vegName = 'ถั่วพู';
  else if (name.includes('กะหล่ำปลี')) vegName = 'กะหล่ำปลี';
  else if (name.includes('บล็อกโคลี่')) vegName = 'บล็อกโคลี่';
  else if (name.includes('แตงกวา')) vegName = 'แตงกวา';
  else if (name.includes('ฟักทอง')) vegName = 'ฟักทอง';
  else if (name.includes('ผักบุ้ง')) vegName = 'ผักบุ้ง';
  
  let vegText = `${vegName} ${(1.5 * portion).toFixed(1).replace('.0', '')} ทัพพี`;

  if (carbText === 'ไม่เน้นแป้ง') return `${meatText} • ${vegText}`;
  return `${meatText} • ${carbText} • ${vegText}`;
};

export default function TDEECalculator() {
  const { userData, updateData } = useUserData();
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState('1.2');
  
  const [targetWeight, setTargetWeight] = useState('');
  const [targetMonths, setTargetMonths] = useState('');

  const [result, setResult] = useState<{
    bmr: number;
    tdee: number;
    targetCalories: number;
    targetProtein: number;
    warningMessage?: string;
  } | null>(null);

  const [mealCategory, setMealCategory] = useState<MealCategory>('general');
  const [dailyMeals, setDailyMeals] = useState<MealPlanItem[]>([]);
  const [isSpinningMeals, setIsSpinningMeals] = useState(false);

  const [isFasting, setIsFasting] = useState(false);
  const [fastingStartTime, setFastingStartTime] = useState<string | null>(null);
  const [elapsedTimeStr, setElapsedTimeStr] = useState('00:00:00');

  useEffect(() => {
    if (userData?.tdee_data) {
      const data = userData.tdee_data;
      if (!weight && data.weight) setWeight(data.weight);
      if (!height && data.height) setHeight(data.height);
      if (!age && data.age) setAge(data.age);
      if (data.gender) setGender(data.gender);
      if (data.activity) setActivity(data.activity);
      if (data.category) setMealCategory(data.category);
    }
    
    if (userData?.if_status) {
      const data = userData.if_status;
      setIsFasting(data.isFasting || false);
      setFastingStartTime(data.startTime || null);
    }
  }, [userData]);

  useEffect(() => {
    let interval: any;
    if (isFasting && fastingStartTime) {
      interval = setInterval(() => {
        const start = new Date(fastingStartTime).getTime();
        const now = new Date().getTime();
        const diff = now - start;
        
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        
        setElapsedTimeStr(`${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isFasting, fastingStartTime]);

  const toggleFasting = () => {
    if (isFasting) {
      setIsFasting(false);
      updateData('if_status', { isFasting: false, startTime: null });
    } else {
      setIsFasting(true);
      const now = new Date().toISOString();
      setFastingStartTime(now);
      updateData('if_status', { isFasting: true, startTime: now });
    }
  };

  const randomizeMeals = useCallback((
    currentResult: { targetCalories: number; targetProtein: number } | null,
    category: MealCategory = mealCategory
  ) => {
    setIsSpinningMeals(true);
    
    let sourceArray = mealsGeneral;
    if (category === 'street') sourceArray = mealsStreet;
    else if (category === 'budget') sourceArray = mealsBudget;

    setTimeout(() => {
      const shuffled = [...sourceArray].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 3);
      
      let finalMeals: MealPlanItem[] = [];
      
      if (currentResult) {
        let sumCals = selected.reduce((acc, m) => acc + m.cals, 0);
        let multiplier = 1;
        
        const mainMealsTargetCals = currentResult.targetCalories * 0.85; 
        if (mainMealsTargetCals > sumCals) {
          multiplier = mainMealsTargetCals / sumCals;
        }

        const roundedMultiplier = Math.max(1, Math.round(multiplier * 2) / 2);

        finalMeals = selected.map((m, i) => ({
          name: m.name,
          cals: Math.round(m.cals * roundedMultiplier),
          protein: Math.round(m.protein * roundedMultiplier),
          portion: roundedMultiplier,
          time: i === 0 ? '10:00' : i === 1 ? '13:30' : '17:30'
        }));

        const currentProtein = finalMeals.reduce((acc, m) => acc + m.protein, 0);
        const proteinDeficit = currentResult.targetProtein - currentProtein;
        
        if (proteinDeficit > 15) {
          const wheyScoops = Math.max(1, Math.round(proteinDeficit / 25)); 
          finalMeals.splice(2, 0, {
            name: `เวย์โปรตีน ${wheyScoops} สกู๊ป / นมโปรตีนสูง`,
            cals: wheyScoops * 120,
            protein: wheyScoops * 25,
            portion: 1,
            time: '15:30',
            isSnack: true
          });
        }
      } else {
        finalMeals = selected.map((m, i) => ({
          ...m,
          portion: 1,
          time: i === 0 ? '10:00' : i === 1 ? '14:00' : '17:30'
        }));
      }

      setDailyMeals(finalMeals);
      setIsSpinningMeals(false);
    }, 400);
  }, [mealCategory]);

  useEffect(() => {
    // Only randomize meals if we haven't yet, avoiding infinite loops with userData
    if (dailyMeals.length === 0) {
      if (userData?.tdee_data) {
        const data = userData.tdee_data;
        const initialResult = calculateLogic(
          data.weight, data.height, data.age, data.gender, data.activity, 
          data.targetWeight || '', data.targetMonths || ''
        );
        setResult(initialResult);
        randomizeMeals(initialResult, data.category || 'general');
      } else {
        randomizeMeals(null, 'general');
      }
    }
  }, [userData, dailyMeals.length, randomizeMeals]);

  const handleCategoryChange = (cat: MealCategory) => {
    setMealCategory(cat);
    randomizeMeals(result, cat);
    
    if (userData?.tdee_data) {
      updateData('tdee_data', {
        ...userData.tdee_data, category: cat
      });
    }
  };

  const calculateLogic = (w: string, h: string, a: string, g: string, act: string, tw: string, tm: string) => {
    const wNum = parseFloat(w);
    const hNum = parseFloat(h);
    const aNum = parseFloat(a);
    const actNum = parseFloat(act);

    if (!wNum || !hNum || !aNum) return null;

    let bmr = (10 * wNum) + (6.25 * hNum) - (5 * aNum);
    bmr = g === 'male' ? bmr + 5 : bmr - 161;

    const tdee = bmr * actNum;
    
    let targetCalories = tdee;
    let warningMessage = undefined;

    if (tw && tm) {
      const targetWNum = parseFloat(tw);
      const monthsNum = parseFloat(tm);
      
      if (targetWNum && monthsNum > 0) {
        const weightDiff = wNum - targetWNum;
        
        if (weightDiff > 0) {
          const totalDeficit = weightDiff * 7700;
          const days = monthsNum * 30;
          const dailyDeficit = totalDeficit / days;
          targetCalories = tdee - dailyDeficit;
        } else if (weightDiff < 0) {
          const totalSurplus = Math.abs(weightDiff) * 7700;
          const days = monthsNum * 30;
          const dailySurplus = totalSurplus / days;
          targetCalories = tdee + dailySurplus;
        }

        const minSafeCals = g === 'male' ? 1500 : 1200;
        if (targetCalories < minSafeCals) {
          targetCalories = minSafeCals;
          warningMessage = `เป้าหมายลดน้ำหนักเร็วเกินไป! ปรับแคลอรีขึ้นเป็น ${minSafeCals} kcal เพื่อความปลอดภัยของร่างกาย`;
        }
      }
    } else {
      targetCalories = tdee - 400; 
    }

    const targetProtein = wNum * 2.0;

    return { bmr, tdee, targetCalories, targetProtein, warningMessage };
  };

  const calculate = (w: string, h: string, a: string, g: string, act: string, tw: string, tm: string) => {
    const res = calculateLogic(w, h, a, g, act, tw, tm);
    if (res) {
      setResult(res);
      updateData('tdee_data', {
        weight: w, height: h, age: a, gender: g, activity: act, targetWeight: tw, targetMonths: tm, category: mealCategory
      });
      randomizeMeals(res, mealCategory);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    calculate(weight, height, age, gender, activity, targetWeight, targetMonths);
  };

  const totalCals = dailyMeals.reduce((acc, curr) => acc + curr.cals, 0);
  const totalProtein = dailyMeals.reduce((acc, curr) => acc + curr.protein, 0);

  return (
    <main className="flex flex-col h-[calc(100vh-64px)] overflow-y-auto bg-slate-50 pb-8">
      <div className="pt-8 pb-4 px-6 bg-white shadow-sm sticky top-0 z-10">
        <h1 className="text-2xl font-bold text-slate-800">TDEE & Goals</h1>
      </div>

      <div className="p-4 space-y-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-slate-800 mb-2 flex items-center gap-2">
            <Calculator className="text-indigo-500" size={20} />
            ข้อมูลพื้นฐาน
          </h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">เพศ</label>
              <select 
                value={gender}
                onChange={e => setGender(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              >
                <option value="male">ชาย</option>
                <option value="female">หญิง</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">อายุ (ปี)</label>
              <input 
                type="number" 
                value={age}
                onChange={e => setAge(e.target.value)}
                placeholder="เช่น 25"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-500 mb-1">น้ำหนักปัจจุบัน (กก.)</label>
              <input 
                type="number" 
                value={weight}
                onChange={e => setWeight(e.target.value)}
                placeholder="เช่น 70"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">ส่วนสูง (ซม.)</label>
              <input 
                type="number" 
                value={height}
                onChange={e => setHeight(e.target.value)}
                placeholder="เช่น 175"
                className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">ระดับกิจกรรม</label>
            <select 
              value={activity}
              onChange={e => setActivity(e.target.value)}
              className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-slate-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
            >
              <option value="1.2">นั่งทำงานเป็นหลัก ไม่ออกกำลังกาย</option>
              <option value="1.375">ออกกำลังกายเบาๆ (1-3 วัน/สัปดาห์)</option>
              <option value="1.55">ออกกำลังกายปานกลาง (3-5 วัน/สัปดาห์)</option>
              <option value="1.725">ออกกำลังกายหนัก (6-7 วัน/สัปดาห์)</option>
              <option value="1.9">ออกกำลังกายหนักมาก / ทำงานใช้แรง</option>
            </select>
          </div>

          <div className="pt-2 border-t border-slate-100 mt-2">
            <h3 className="text-sm font-bold text-slate-800 mb-3 mt-2">เป้าหมายของคุณ (ไม่บังคับ)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">น้ำหนักที่ต้องการ (กก.)</label>
                <input 
                  type="number" 
                  value={targetWeight}
                  onChange={e => setTargetWeight(e.target.value)}
                  placeholder="เช่น 65"
                  className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-indigo-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">ระยะเวลา (เดือน)</label>
                <input 
                  type="number" 
                  value={targetMonths}
                  onChange={e => setTargetMonths(e.target.value)}
                  placeholder="เช่น 3"
                  className="w-full bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-indigo-700 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl transition-colors mt-4"
          >
            คำนวณเป้าหมาย
          </button>
        </form>

        {result && (
          <>
            {result.warningMessage && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-800">
                <AlertTriangle className="shrink-0 text-amber-500" />
                <p className="text-xs font-medium leading-relaxed">{result.warningMessage}</p>
              </div>
            )}

            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              
              <h2 className="text-lg font-bold mb-4 relative z-10">เป้าหมายของคุณ 🎯</h2>
              
              <div className="grid grid-cols-2 gap-4 relative z-10 mb-4">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                  <p className="text-indigo-100 text-xs mb-1">แคลอรีที่แนะนำ</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{Math.round(result.targetCalories)}</span>
                    <span className="text-xs text-indigo-200">kcal/วัน</span>
                  </div>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 border border-white/20">
                  <p className="text-indigo-100 text-xs mb-1">เป้าหมายโปรตีน</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{Math.round(result.targetProtein)}</span>
                    <span className="text-xs text-indigo-200">g/วัน</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-indigo-100 space-y-1 relative z-10">
                <p>• BMR (พลังงานพื้นฐาน): {Math.round(result.bmr)} kcal</p>
                <p>• TDEE (พลังงานที่ใช้ทั้งหมด): {Math.round(result.tdee)} kcal</p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-sm space-y-5">
              <div className="flex flex-col border-b border-slate-100 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Clock className={isFasting ? "text-indigo-500" : "text-orange-500"} size={20} />
                    {isFasting ? "กำลังอดอาหาร (Fasting)" : "ช่วงเวลากิน (Feeding)"}
                  </h2>
                  <button 
                    onClick={toggleFasting}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow-sm ${
                      isFasting ? 'bg-rose-50 text-rose-600 hover:bg-rose-100' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                    }`}
                  >
                    {isFasting ? "สิ้นสุดการอด" : "เริ่มอดอาหาร"}
                  </button>
                </div>
                
                {isFasting && (
                  <div className="bg-slate-900 rounded-2xl p-4 text-center">
                    <p className="text-slate-400 text-xs font-medium mb-1">ระยะเวลาที่อดมาแล้ว</p>
                    <p className="text-4xl font-black text-white tabular-nums tracking-wider">{elapsedTimeStr}</p>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                      <div className="bg-indigo-500 h-full rounded-full animate-pulse w-full"></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-md font-bold text-slate-800 flex items-center gap-2">
                    <Utensils className="text-emerald-500" size={18} />
                    ไอเดียเมนูจัดเต็มตามเป้า
                  </h3>
                  <button 
                    onClick={() => randomizeMeals(result)}
                    className="p-2 text-indigo-500 bg-indigo-50 hover:bg-indigo-100 active:scale-95 rounded-full transition-all flex items-center gap-1 text-xs font-bold pr-3"
                  >
                    <Shuffle size={14} className={isSpinningMeals ? "animate-spin" : ""} />
                    สุ่มใหม่
                  </button>
                </div>

                <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                  <button 
                    onClick={() => handleCategoryChange('general')}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${mealCategory === 'general' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    ทั่วไป
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('street')}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${mealCategory === 'street' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    อาหารตามสั่งคลีน
                  </button>
                  <button 
                    onClick={() => handleCategoryChange('budget')}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${mealCategory === 'budget' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                  >
                    ราคาประหยัด/ไก่ไข่
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {!isSpinningMeals && dailyMeals.length > 0 && (
                    <motion.div 
                      key="meals"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="space-y-4"
                    >
                      {dailyMeals.map((meal, index) => (
                        <div key={index} className="flex gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className={`bg-white w-12 h-12 flex flex-col items-center justify-center rounded-xl shadow-sm border border-slate-100 shrink-0 ${meal.isSnack ? 'text-indigo-500' : 'text-slate-700'}`}>
                            {meal.isSnack ? (
                              <Coffee size={16} className="mb-1" />
                            ) : (
                              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                                มื้อ {index + 1}
                              </span>
                            )}
                            <span className="text-xs font-bold">{meal.time}</span>
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-bold text-slate-800 leading-tight">
                                {meal.name}
                                {meal.portion > 1 && !meal.isSnack && (
                                  <span className="ml-2 text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-md whitespace-nowrap inline-block">
                                    {meal.portion}x เสิร์ฟ
                                  </span>
                                )}
                              </p>
                            </div>
                            
                            {/* Practical Details */}
                            {!meal.isSnack && (
                              <div className="mt-2 p-2 bg-indigo-50/50 rounded-lg border border-indigo-100/50 flex items-start gap-2">
                                <Info size={14} className="text-indigo-400 shrink-0 mt-0.5" />
                                <p className="text-[11px] text-indigo-700 font-medium leading-relaxed">
                                  {getPracticalDetails(meal.name, meal.protein, meal.cals, meal.portion)}
                                </p>
                              </div>
                            )}

                            <div className="flex gap-4 text-[11px] mt-2 pt-2 border-t border-slate-200/60">
                              <span className="text-orange-500 font-bold">{meal.cals} kcal</span>
                              <span className="text-indigo-600 font-bold">โปรตีน {meal.protein}g</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-sm shadow-sm">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-slate-600 font-medium">แคลอรีรวมวันนี้:</span>
                          <span className={`font-bold ${Math.abs(totalCals - result.targetCalories) <= 150 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {totalCals} / {Math.round(result.targetCalories)} kcal
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 font-medium">โปรตีนรวมวันนี้:</span>
                          <span className={`font-bold ${totalProtein >= result.targetProtein * 0.9 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {totalProtein} / {Math.round(result.targetProtein)} g
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
