import AppLogo from '@/components/AppLogo';

const Header = () => {
  return (
    <header className="glass border-b border-border/50 px-6 py-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AppLogo size={40} />
          <div>
            <h1 className="text-xl font-bold tracking-tight">Smart Study Planner</h1>
            <p className="text-xs text-muted-foreground">Plan smarter, study better</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
