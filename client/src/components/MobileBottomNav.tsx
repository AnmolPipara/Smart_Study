import { LayoutList, BookOpen, BarChart2, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardSection } from '@/hooks/useDashboardNav';

interface MobileBottomNavProps {
  section: DashboardSection;
}

const MobileBottomNav = ({ section }: MobileBottomNavProps) => {
  const navigate = useNavigate();

  const items: { id: DashboardSection; label: string; icon: typeof LayoutList }[] = [
    { id: 'tasks', label: 'Tasks', icon: LayoutList },
    { id: 'notes', label: 'Notes', icon: BookOpen },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'mastery', label: 'Mastery', icon: Target },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass border-t border-border/50">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map(item => {
          const isActive = section === item.id;
          return (
            <button
              key={item.id}
              onClick={() => navigate(`/dashboard/${item.id}`)}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-xl transition-all ${
                isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
