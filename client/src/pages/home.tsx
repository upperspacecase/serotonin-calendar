import React, { useState } from 'react';
import { Brain, Info, Calendar, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_OF_WEEK_SHORT = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const SerotoninCalendar = () => {
  const [events, setEvents] = useState<Record<string, boolean>>({});
  const [isYearView, setIsYearView] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const getMonthsToDisplay = () => {
    if (isYearView) {
      const months = [];
      // Start from the current month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      // Show next 12 months instead of calendar year
      for (let i = 0; i < 12; i++) {
        months.push(new Date(startOfMonth.getFullYear(), startOfMonth.getMonth() + i, 1));
      }
      return months;
    }
    return [currentDate];
  };

  const navigateMonth = (offset: number) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // EXACT LOGIC FROM PROVIDED FILE
  const calculateRecoveryLevel = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    let recoveryScore = 100;

    Object.entries(events).forEach(([eventDate, isDepletion]) => {
      if (!isDepletion) return;
      
      const eventDateObj = new Date(eventDate);
      // Using exact math from snippet: (date - eventDateObj)
      // Note: date is local 00:00, eventDateObj is UTC 00:00 (from ISO string)
      // This might lead to timezone offsets, but I must follow "functionality is the same" instruction.
      const diffDays = Math.floor((date.getTime() - eventDateObj.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays <= 90) {
        const baseRecovery = Math.min(1, diffDays / 90);
        const recoveryProgress = Math.pow(baseRecovery, 2);
        const impact = 1 - recoveryProgress;
        recoveryScore *= (1 - impact * 0.7);
      }
    });

    return Math.min(100, Math.max(0, recoveryScore));
  };

  // REFINED MODERN PALETTE - Red -> Orange -> Yellow -> Green Gradient
  const getGradientForLevel = (level: number) => {
    // 90-100%: Deep Green (Optimal)
    if (level >= 90) return 'bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20 border border-white/10 data-[contrast=light]';
    
    // 70-89%: Lime/Light Green (Good)
    if (level >= 70) return 'bg-gradient-to-br from-lime-400 to-emerald-400 shadow-lg shadow-lime-500/20 border border-white/10 data-[contrast=dark]';
    
    // 50-69%: Yellow (Moderate)
    if (level >= 50) return 'bg-gradient-to-br from-yellow-400 to-amber-400 shadow-lg shadow-yellow-500/20 border border-white/10 data-[contrast=dark]';
    
    // 30-49%: Orange (Strained)
    if (level >= 30) return 'bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20 border border-white/10 data-[contrast=light]';
    
    // 0-29%: Red (Depleted)
    return 'bg-gradient-to-br from-red-600 to-rose-600 shadow-lg shadow-red-500/20 border border-white/10 data-[contrast=light]';
  };

  const getTextColorForLevel = (level: number) => {
    // Yellow and Lime ranges (50-89%) are bright, need dark text
    if (level >= 50 && level < 90) return 'text-zinc-950 font-bold'; 
    // Ends of spectrum (Red/Orange and Deep Green) need white text
    return 'text-white font-semibold shadow-black/10 drop-shadow-sm'; 
  };
  
  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    setEvents(prev => ({
      ...prev,
      [dateStr]: !prev[dateStr]
    }));
  };

  const renderMonth = (monthDate: Date) => {
    const daysInMonth = getDaysInMonth(monthDate);
    const firstDayOfMonth = getFirstDayOfMonth(monthDate);
    const days = [];

    // Empty cells
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className={isYearView ? "h-8" : "h-24"} />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const recoveryLevel = calculateRecoveryLevel(date);
      const isDepletionDay = events[dateStr];
      const isToday = new Date().toDateString() === date.toDateString();

      days.push(
        <TooltipProvider key={dateStr}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div
                onClick={() => handleDateClick(date)}
                className={`${isYearView ? 'h-8' : 'h-24'} flex flex-col items-center 
                  ${isYearView ? 'justify-center' : 'justify-start pt-1'} p-1
                  cursor-pointer transition-all duration-500 ${getGradientForLevel(recoveryLevel)}
                  hover:scale-105 hover:bg-white/5 rounded-lg relative backdrop-blur-md group
                  ${isToday ? 'ring-1 ring-white/50 shadow-lg bg-white/5' : ''}
                  ${isDepletionDay ? 'ring-1 ring-rose-500 bg-rose-500/10' : ''}`}
              >
                <span className={`${isYearView ? 'text-xs' : 'text-lg'} font-serif
                  ${getTextColorForLevel(recoveryLevel)}`}>
                  {day}
                </span>
                {!isYearView && (
                  <span className={`text-xs mt-1 font-mono
                    ${getTextColorForLevel(recoveryLevel)} opacity-90`}>
                    {Math.round(recoveryLevel)}%
                  </span>
                )}
                {isDepletionDay && (
                  <div className={`absolute -top-1 -right-1 
                    ${isYearView ? 'w-1.5 h-1.5' : 'w-2.5 h-2.5'} 
                    bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.5)]
                    animate-pulse`} />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent className="bg-zinc-950/90 border-zinc-800 text-zinc-300 backdrop-blur-xl">
              <p className="font-serif font-semibold text-white">{date.toLocaleDateString()}</p>
              <p className="text-sm text-zinc-400">Recovery Level: <span className="text-white">{Math.round(recoveryLevel)}%</span></p>
              {isDepletionDay && <p className="text-sm text-rose-400 mt-1">Depletion Event Marked</p>}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return (
      <div key={monthDate.toISOString()} className="space-y-3">
        <h3 className={`font-serif font-medium text-zinc-400
          ${isYearView ? 'text-xs uppercase tracking-widest' : 'text-xl text-zinc-200'}`}>
          {monthDate.toLocaleDateString('default', { 
            month: isYearView ? 'short' : 'long',
            year: isYearView && monthDate.getMonth() === 0 ? 'numeric' : undefined
          })}
        </h3>
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK_SHORT.map(day => (
            <div key={day} className={`text-center ${isYearView ? 'text-[9px]' : 'text-xs'} 
              font-medium text-zinc-600 uppercase tracking-widest`}>
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 p-4 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      <Card className="max-w-7xl mx-auto bg-black/40 backdrop-blur-xl border-white/5 shadow-2xl">
        
        {/* Header Area */}
        <CardHeader className="border-b border-white/5 pb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <CardTitle className="flex items-center gap-3 text-2xl font-serif text-zinc-100">
                <div className="p-2 bg-white/5 rounded-lg backdrop-blur-sm border border-white/5">
                  <Heart className="h-5 w-5 text-rose-400/80" />
                </div>
                <span className="tracking-tight">Serotonin Recovery</span>
              </CardTitle>
              <button
                onClick={() => setIsYearView(!isYearView)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 
                border border-white/5 rounded-md text-xs font-medium transition-all duration-200 text-zinc-400 hover:text-zinc-200 uppercase tracking-wide"
              >
                <Calendar className="h-3.5 w-3.5" />
                {isYearView ? 'Detail View' : 'Overview'}
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Brief Explanation */}
          <div className="mb-8 text-zinc-400 text-sm leading-relaxed max-w-3xl">
            This calendar tracks your serotonin recovery journey. Mark depletion events (such as MDMA use) to visualize your 90-day restoration timeline through color-coded energy zones.
          </div>

          {/* Accordions for Explanations */}
          <Accordion type="single" collapsible className="w-full mb-12 border-t border-b border-white/5">
            <AccordionItem value="recovery-zones" className="border-white/5">
              <AccordionTrigger className="text-zinc-300 font-serif tracking-wide hover:text-white hover:no-underline">
                Recovery Zones & Colors
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                     { label: 'Optimal State', range: '90-100%', color: 'bg-gradient-to-br from-emerald-500 to-green-600', text: 'text-emerald-400' },
                     { label: 'Good', range: '70-89%', color: 'bg-gradient-to-br from-lime-400 to-emerald-400', text: 'text-lime-400' },
                     { label: 'Moderate', range: '50-69%', color: 'bg-gradient-to-br from-yellow-400 to-amber-400', text: 'text-yellow-400' },
                     { label: 'Strained', range: '30-49%', color: 'bg-gradient-to-br from-orange-500 to-amber-600', text: 'text-orange-400' },
                     { label: 'Depleted', range: '0-29%', color: 'bg-gradient-to-br from-red-600 to-rose-600', text: 'text-red-400' },
                  ].map((item, i) => (
                     <div key={i} className="flex items-center justify-between group cursor-default p-2 rounded-lg hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${item.color} shadow-sm shadow-white/10 opacity-90`}></div>
                          <span className="text-sm text-zinc-300">{item.label}</span>
                        </div>
                        <span className={`text-xs font-mono opacity-70 ${item.text}`}>{item.range}</span>
                     </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
            
            <AccordionItem value="guide" className="border-white/5">
              <AccordionTrigger className="text-zinc-300 font-serif tracking-wide hover:text-white hover:no-underline">
                Usage Guide & Biological Context
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-widest mb-4 text-zinc-500">How to Use</h4>
                    <ul className="text-sm space-y-4 text-zinc-400">
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5"></span>
                        <span className="leading-relaxed">Tap any date to log a <span className="text-rose-400">depletion event</span> (e.g., substance use). The calendar will immediately recalculate your recovery curve.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5"></span>
                        <span className="leading-relaxed">Color intensity indicates your estimated serotonin levels based on the 90-day recovery model.</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-sm uppercase tracking-widest mb-4 text-zinc-500">Biological Context</h4>
                    <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                      <p className="text-sm text-zinc-400 leading-relaxed mb-4">
                        <Info className="w-4 h-4 inline mr-2 text-zinc-500" />
                        Serotonin recovery is a gradual biological process. Following significant depletion (such as from MDMA use), receptors may take up to 3 months to return to baseline sensitivity.
                      </p>
                      <p className="text-xs text-zinc-600">
                        *This model is a visualization tool, not a medical diagnosis.
                      </p>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Controls above calendar */}
          <div className="flex items-center justify-end gap-4 mb-6 border-b border-white/5 pb-4">
             <button
                onClick={() => setIsYearView(!isYearView)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 
                border border-white/5 rounded-md text-xs font-medium transition-all duration-200 text-zinc-400 hover:text-zinc-200 uppercase tracking-wide"
              >
                <Calendar className="h-3.5 w-3.5" />
                {isYearView ? 'Detail View' : 'Overview'}
              </button>

             {!isYearView && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 
                  rounded-md transition-all duration-200 text-zinc-400 hover:text-zinc-200"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 bg-white/5 hover:bg-white/10 border border-white/5 
                  rounded-md transition-all duration-200 text-zinc-400 hover:text-zinc-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className={`grid ${isYearView ? 'grid-cols-1 md:grid-cols-3 lg:grid-cols-4' : 'grid-cols-1'} gap-x-8 gap-y-12`}>
            {getMonthsToDisplay().map(month => renderMonth(month))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SerotoninCalendar;
