import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '@/components/AppLogo';
import {
  ArrowRight, Calendar, CheckCircle2, Clock,
  Flag, Target, Zap, BarChart3
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Daily & Weekly Planner',
    description: 'Visualize your study schedule across time slots with flexible daily and weekly views.',
  },
  {
    icon: Flag,
    title: 'Task Priority System',
    description: 'Categorize tasks by High, Medium, or Low priority to focus on what matters most.',
  },
  {
    icon: Clock,
    title: 'Estimated Study Time',
    description: 'Set realistic time estimates for each task and build a balanced study schedule.',
  },
  {
    icon: Target,
    title: 'Deadline Tracking',
    description: 'Never miss an assignment or exam with smart deadline reminders and overdue alerts.',
  },
  {
    icon: BarChart3,
    title: 'Progress Insights',
    description: 'Track your completion rate, study hours, and overall productivity at a glance.',
  },
  {
    icon: Zap,
    title: 'Fast & Focused',
    description: 'Dark-themed interface designed for minimal eye strain during long study sessions.',
  },
];

const Landing = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#0D0A1A] relative overflow-hidden flex flex-col">
      {/* Background Gradients to match the deep purple/amber glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] rounded-full bg-[#7C3AED]/15 blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D97706]/10 blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="w-full px-6 py-6 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <AppLogo size={32} />
              <span className="text-xl font-bold tracking-tight text-white">Smart Study Planner</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="bg-[#1A1530] border border-[#7C3AED]/30 text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-[#2D2550] transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)]"
            >
              {user ? 'Go to Dashboard' : 'Log In'}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex items-center justify-center px-6 relative z-10 w-full max-w-7xl mx-auto min-h-[calc(100vh-180px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center w-full">
          
          {/* Left Column - Typography & CTA */}
          <div className="flex flex-col items-start text-left pt-10 lg:pt-0">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8 text-white">
              Plan Smarter.<br />
              Study Better –<br />
              <span className="text-white/90">All In One Place!</span>
            </h1>
            
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="bg-[#0D0A1A] border border-[#7C3AED]/50 text-white px-8 py-4 rounded-full text-base font-semibold hover:bg-[#1A1530] transition-all flex items-center gap-3 shadow-[0_0_20px_rgba(124,58,237,0.2)]"
            >
              Start Planning
              <ArrowRight className="w-5 h-5 text-[#C084FC]" />
            </Link>

            {/* Decorative Cursor Tag */}
            <div className="mt-12 flex items-center gap-2 animate-bounce">
              <div className="w-4 h-4 bg-[#C084FC] rounded-tl-full rounded-tr-sm rounded-br-full rounded-bl-full rotate-45" />
              <div className="bg-[#C084FC] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
                Student
              </div>
            </div>
          </div>

          {/* Right Column - Node Network Graphic */}
          <div className="relative h-[400px] md:h-[600px] w-full flex items-center justify-center hidden sm:flex">
            {/* Center Stat */}
            <div className="absolute z-20 flex flex-col items-center justify-center">
              <span className="text-5xl md:text-6xl font-bold text-white tracking-tight">10k+</span>
              <span className="text-sm md:text-base text-white/60 font-medium">Study Hours Logged</span>
            </div>

            {/* Orbit Rings */}
            <div className="absolute w-[250px] h-[250px] md:w-[320px] md:h-[320px] border border-white/30 rounded-full" />
            <div className="absolute w-[350px] h-[350px] md:w-[480px] md:h-[480px] border border-white/20 rounded-full" />
            <div className="absolute w-[450px] h-[450px] md:w-[640px] md:h-[640px] border border-white/10 rounded-full" />

            {/* Floating Nodes */}
            {/* Inner Ring */}
            <img src="/src/assets/node_avatar_1.png" alt="Avatar" className="absolute w-12 h-12 rounded-full border-2 border-[#1A1530] shadow-[0_0_15px_rgba(124,58,237,0.5)] z-30" style={{ transform: 'translate(100px, -110px)' }} onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=S&background=7C3AED&color=fff&rounded=true' }} />
            <img src="/src/assets/node_avatar_2.png" alt="Avatar" className="absolute w-10 h-10 rounded-full border-2 border-[#1A1530] shadow-[0_0_15px_rgba(192,132,252,0.4)] z-30" style={{ transform: 'translate(-80px, 90px)' }} onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=J&background=C084FC&color=fff&rounded=true' }}/>
            
            {/* Middle Ring */}
            <div className="absolute w-14 h-14 bg-[#1A1530] rounded-2xl border border-[#7C3AED]/30 flex items-center justify-center shadow-[0_0_20px_rgba(76,29,149,0.6)] z-30" style={{ transform: 'translate(-160px, -60px)' }}>
              <Zap className="w-6 h-6 text-[#4C1D95]" />
            </div>
            <div className="absolute w-12 h-12 bg-[#1A1530] rounded-2xl border border-[#C084FC]/30 flex items-center justify-center shadow-[0_0_15px_rgba(192,132,252,0.5)] z-30" style={{ transform: 'translate(180px, 120px)' }}>
               <Target className="w-5 h-5 text-[#C084FC]" />
            </div>
            <img src="/src/assets/node_avatar_3.png" alt="Avatar" className="absolute w-14 h-14 rounded-full border-2 border-[#1A1530] shadow-[0_0_20px_rgba(217,119,6,0.3)] z-30" style={{ transform: 'translate(40px, -230px)' }} onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=A&background=D97706&color=fff&rounded=true' }} />

            {/* Outer Ring */}
            <div className="absolute w-16 h-16 bg-[#1A1530] rounded-2xl border border-[#D97706]/30 flex items-center justify-center shadow-[0_0_25px_rgba(217,119,6,0.4)] z-30" style={{ transform: 'translate(-260px, 100px)' }}>
              <Clock className="w-7 h-7 text-[#D97706]" />
            </div>
            <div className="absolute w-16 h-16 bg-[#1A1530] rounded-2xl border border-[#EF4444]/30 flex items-center justify-center shadow-[0_0_25px_rgba(239,68,68,0.4)] z-30" style={{ transform: 'translate(280px, -20px)' }}>
              <Flag className="w-7 h-7 text-[#EF4444]" />
            </div>
          </div>
        </div>
      </main>

      {/* Features Grid restored per user request */}
      <section className="px-6 py-24 bg-[#0D0A1A] relative z-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Everything you need to ace your studies</h2>
            <p className="text-white/60 max-w-xl mx-auto text-lg">
              A complete study management toolkit designed to help you stay organized and productive.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-[#1A1530] border border-[#7C3AED]/20 rounded-2xl p-8 hover:border-[#7C3AED]/50 transition-all duration-300 group hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)]"
              >
                <div className="w-12 h-12 rounded-xl bg-[#0D0A1A] border border-[#7C3AED]/30 flex items-center justify-center mb-6 group-hover:bg-[#7C3AED]/10 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-[#C084FC] transition-transform duration-300 group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-semibold mb-3 text-white">{feature.title}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-white/5 py-8 mt-auto z-10">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-white/40 text-sm">
          <span>&copy; {new Date().getFullYear()} Smart Study Planner. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
