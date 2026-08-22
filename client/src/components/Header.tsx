import { useState, useRef, useEffect } from 'react';
import AppLogo from '@/components/AppLogo';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined;
  const displayName = (user?.user_metadata?.full_name || user?.user_metadata?.display_name) as string | undefined;
  const email = user?.email ?? '';
  const initials = displayName
    ? displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : email.slice(0, 2).toUpperCase();

  return (
    <header className="glass border-b border-border/40 px-6 py-3.5 sticky top-0 z-50">
      <div className="max-w-full mx-auto flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <AppLogo size={36} showName />
        </div>

        {/* Theme Toggle + User Profile */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 rounded-lg bg-secondary/70 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        {user && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen((prev) => !prev)}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-secondary/70 hover:bg-secondary transition-colors border border-border/40 group"
              aria-label="User menu"
            >
              {/* Avatar */}
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName ?? email}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/40"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-primary/30">
                  {initials}
                </div>
              )}
              {/* Email */}
              <span className="text-xs text-muted-foreground max-w-[140px] truncate hidden sm:block">
                {displayName || email}
              </span>
              {/* Chevron */}
              <svg
                className={`w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-popover border border-border/60 rounded-xl shadow-xl overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-2 duration-150">
                {/* User info */}
                <div className="px-4 py-3 border-b border-border/40 flex items-center gap-3">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={displayName ?? email}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/40"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-white ring-2 ring-primary/30">
                      {initials}
                    </div>
                  )}
                  <div className="overflow-hidden">
                    {displayName && (
                      <p className="text-sm font-semibold text-foreground truncate">{displayName}</p>
                    )}
                    <p className="text-xs text-muted-foreground truncate">{email}</p>
                  </div>
                </div>
                {/* Actions */}
                <div className="p-1.5">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </header>
  );
};

export default Header;
