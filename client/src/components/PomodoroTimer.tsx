import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Coffee, BookOpen } from 'lucide-react';

const WORK_DURATION = 25 * 60; // 25 minutes
const BREAK_DURATION = 5 * 60; // 5 minutes

const PomodoroTimer = () => {
  const [secondsLeft, setSecondsLeft] = useState(WORK_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const totalSeconds = isBreak ? BREAK_DURATION : WORK_DURATION;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  useEffect(() => {
    // Create a simple beep using AudioContext when timer ends
    audioRef.current = new Audio();
    return () => {
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          // Timer done
          setIsRunning(false);
          playNotificationSound();
          if (!isBreak) {
            setCompletedSessions(s => s + 1);
            // Show notification
            if (Notification.permission === 'granted') {
              new Notification('Pomodoro Complete! 🍅', {
                body: 'Time to take a break!',
                icon: '/favicon.ico',
              });
            }
          } else {
            if (Notification.permission === 'granted') {
              new Notification('Break is over! 📖', {
                body: 'Time to get back to studying!',
                icon: '/favicon.ico',
              });
            }
          }
          // Auto switch
          setIsBreak(prev => !prev);
          return isBreak ? WORK_DURATION : BREAK_DURATION;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, isBreak]);

  const playNotificationSound = () => {
    try {
      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio not available
    }
  };

  const reset = useCallback(() => {
    setIsRunning(false);
    setSecondsLeft(isBreak ? BREAK_DURATION : WORK_DURATION);
  }, [isBreak]);

  const toggleTimer = useCallback(() => {
    // Request notification permission on first start
    if (!isRunning && Notification.permission === 'default') {
      Notification.requestPermission();
    }
    setIsRunning(prev => !prev);
  }, [isRunning]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  // Circle SVG dimensions
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        {isBreak ? (
          <Coffee className="w-4 h-4 text-amber-400" />
        ) : (
          <BookOpen className="w-4 h-4 text-primary" />
        )}
        <h3 className="text-sm font-semibold">
          {isBreak ? 'Break Time' : 'Focus Session'}
        </h3>
        <span className="ml-auto text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-secondary/70">
          {completedSessions} done
        </span>
      </div>

      <div className="flex items-center justify-center py-2">
        <div className="relative w-28 h-28">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke="hsl(var(--secondary))"
              strokeWidth="6"
            />
            <circle
              cx="50" cy="50" r={radius}
              fill="none"
              stroke={isBreak ? '#F59E0B' : 'hsl(var(--primary))'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
          {/* Timer display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold tabular-nums">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5">
              {isBreak ? 'break' : 'focus'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-2 mt-2">
        <button
          onClick={reset}
          className="p-2 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
          title="Reset"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
        <button
          onClick={toggleTimer}
          className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${
            isRunning
              ? 'bg-secondary text-foreground hover:bg-secondary/80'
              : 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Start
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default PomodoroTimer;
