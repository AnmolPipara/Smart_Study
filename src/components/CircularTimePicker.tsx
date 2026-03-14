import React, { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Button } from './ui/button';
import { Clock } from 'lucide-react';

interface CircularTimePickerProps {
  hour: number;
  minute: number;
  onChange: (hour: number, minute: number) => void;
}

const CircularTimePicker = ({ hour, minute, onChange }: CircularTimePickerProps) => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const [internalHour, setInternalHour] = useState(hour);
  const [internalMinute, setInternalMinute] = useState(minute);
  const [isPM, setIsPM] = useState(hour >= 12);

  // Constants
  const RADIUS = 90;
  const CENTER = 120; // 240/2

  const hours12 = internalHour % 12 || 12;

  const handleHourClick = (h: number) => {
    let newHour = h;
    if (isPM && h < 12) newHour += 12;
    if (!isPM && h === 12) newHour = 0;
    
    setInternalHour(newHour);
    setMode('minute');
  };

  const handleMinuteClick = (m: number) => {
    setInternalMinute(m);
  };

  const handleApply = () => {
    onChange(internalHour, internalMinute);
    setOpen(false);
    setMode('hour');
  };

  const handleOpenChange = (o: boolean) => {
    setOpen(o);
    if (o) {
      setInternalHour(hour);
      setInternalMinute(minute);
      setIsPM(hour >= 12);
      setMode('hour');
    }
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal bg-secondary border-border/50">
          <Clock className="w-4 h-4 mr-2" />
          {pad(hours12)}:{pad(minute)} {isPM ? 'PM' : 'AM'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col rounded-xl overflow-hidden bg-background border shadow-xl selection:bg-transparent">
          {/* Header */}
          <div className="bg-primary/5 p-4 flex items-center justify-between border-b">
            <div className="flex items-baseline space-x-1 text-4xl font-light">
              <button 
                className={`px-2 py-1 rounded cursor-pointer ${mode === 'hour' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setMode('hour')}
              >
                {pad(hours12)}
              </button>
              <span className="text-muted-foreground">:</span>
              <button 
                className={`px-2 py-1 rounded cursor-pointer ${mode === 'minute' ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:bg-muted'}`}
                onClick={() => setMode('minute')}
              >
                {pad(internalMinute)}
              </button>
            </div>
            <div className="flex flex-col text-sm font-medium border rounded-lg overflow-hidden shrink-0 ml-4">
              <button
                className={`px-3 py-1.5 ${!isPM ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted'}`}
                onClick={() => {
                  setIsPM(false);
                  if (internalHour >= 12) setInternalHour(internalHour - 12);
                }}
              >
                AM
              </button>
              <button
                className={`px-3 py-1.5 ${isPM ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-muted-foreground hover:bg-muted border-t'}`}
                onClick={() => {
                  setIsPM(true);
                  if (internalHour < 12) setInternalHour(internalHour + 12);
                }}
              >
                PM
              </button>
            </div>
          </div>

          {/* Clock Face */}
          <div className="p-6 flex items-center justify-center bg-card">
            <div className="relative rounded-full bg-secondary" style={{ width: CENTER * 2, height: CENTER * 2 }}>
              {/* Center Dot */}
              <div className="absolute w-2 h-2 rounded-full bg-primary" style={{ top: CENTER - 4, left: CENTER - 4 }} />
              
              {mode === 'hour' && (
                <>
                  {/* Hand */}
                  {(() => {
                    const h = isPM ? (internalHour === 12 ? 12 : internalHour % 12) : (internalHour === 0 ? 12 : internalHour);
                    const angle = (h * 30) * (Math.PI / 180);
                    const x = CENTER + (RADIUS - 20) * Math.sin(angle);
                    const y = CENTER - (RADIUS - 20) * Math.cos(angle);
                    return (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-primary" style={{ zIndex: 0 }}>
                        <line x1={CENTER} y1={CENTER} x2={x} y2={y} strokeWidth="2" />
                        <circle cx={x} cy={y} r="16" className="fill-primary" />
                      </svg>
                    );
                  })()}
                  
                  {[...Array(12)].map((_, i) => {
                    const h = i === 0 ? 12 : i;
                    const angle = (h * 30) * (Math.PI / 180);
                    const x = CENTER + RADIUS * Math.sin(angle);
                    const y = CENTER - RADIUS * Math.cos(angle);
                    
                    const isSelected = 
                      (isPM && (internalHour === (h === 12 ? 12 : h + 12))) || 
                      (!isPM && (internalHour === (h === 12 ? 0 : h)));

                    return (
                      <button
                        key={h}
                        className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-sm transition-colors z-10 ${isSelected ? 'text-primary-foreground font-semibold' : 'text-foreground hover:bg-muted'}`}
                        style={{ left: x, top: y }}
                        onClick={() => handleHourClick(h)}
                      >
                        {h}
                      </button>
                    );
                  })}
                </>
              )}

              {mode === 'minute' && (
                <>
                  {/* Hand */}
                  {(() => {
                    const angle = (internalMinute * 6) * (Math.PI / 180);
                    const x = CENTER + (RADIUS - 20) * Math.sin(angle);
                    const y = CENTER - (RADIUS - 20) * Math.cos(angle);
                    return (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-primary" style={{ zIndex: 0 }}>
                        <line x1={CENTER} y1={CENTER} x2={x} y2={y} strokeWidth="2" />
                        <circle cx={x} cy={y} r="16" className="fill-primary" />
                      </svg>
                    );
                  })()}

                  {[...Array(12)].map((_, i) => {
                    const m = i * 5;
                    const angle = (m * 6) * (Math.PI / 180);
                    const x = CENTER + RADIUS * Math.sin(angle);
                    const y = CENTER - RADIUS * Math.cos(angle);
                    const isSelected = internalMinute === m;

                    return (
                      <button
                        key={m}
                        className={`absolute w-8 h-8 -ml-4 -mt-4 rounded-full flex items-center justify-center text-sm transition-colors z-10 ${isSelected ? 'text-primary-foreground font-semibold' : 'text-foreground hover:bg-muted'}`}
                        style={{ left: x, top: y }}
                        onClick={() => handleMinuteClick(m)}
                      >
                        {m === 0 ? '00' : m}
                      </button>
                    );
                  })}
                </>
              )}
            </div>
          </div>

          <div className="p-3 border-t bg-card flex justify-end space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button variant="default" size="sm" onClick={handleApply}>OK</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CircularTimePicker;
