import { useState, useEffect } from 'react';
import { isDemoMode, getLastProvider } from '@/services/aiService';
import { AlertTriangle, X } from 'lucide-react';

/**
 * Banner that appears when the app is running in demo mode
 * (all AI providers failed or DEMO_MODE=true on the server).
 */
export default function DemoModeBanner() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check periodically if we entered demo mode
    const interval = setInterval(() => {
      if (isDemoMode() && !dismissed) {
        setVisible(true);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dismissed]);

  if (!visible || dismissed) return null;

  const provider = getLastProvider();

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500/15 border-b border-amber-500/30 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <p className="text-xs font-medium">
            <span className="font-semibold">Demo Mode</span> — AI service temporarily unavailable.
            {provider === 'demo' && ' Showing sample responses.'}
          </p>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-amber-600/60 dark:text-amber-400/60 hover:text-amber-600 dark:hover:text-amber-400 transition-colors shrink-0"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
