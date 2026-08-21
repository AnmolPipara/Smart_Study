import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import AppLogo from '@/components/AppLogo';
import {
  ArrowRight, CheckCircle2, Clock,
  Target, Zap, BookOpen, Calendar,
  GraduationCap, Timer, BarChart3, ListChecks
} from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Smart Planner',
    description: 'Visualize your study schedule with flexible daily and weekly views that adapt to your routine.',
  },
  {
    icon: Target,
    title: 'Deadline Tracking',
    description: 'Never miss an assignment or exam with intelligent reminders and overdue alerts.',
  },
  {
    icon: BarChart3,
    title: 'Progress Insights',
    description: 'Track your completion rate, study hours, and overall productivity at a glance.',
  },
  {
    icon: Timer,
    title: 'Pomodoro Timer',
    description: 'Stay focused with built-in timer sessions and track your deep work time.',
  },
  {
    icon: BookOpen,
    title: 'Revision System',
    description: 'Spaced repetition scheduling ensures you review material at optimal intervals.',
  },
  {
    icon: Zap,
    title: 'Fast & Focused',
    description: 'Clean, distraction-free interface designed for maximum productivity.',
  },
];

const navLinks = ['Features', 'Solutions', 'Resources', 'Pricing'];

const Landing = () => {
  const { user, loading } = useAuth();

  const renderAuthButton = (className: string, showIcon = false) => {
    if (loading) {
      return (
        <div className={`${className} opacity-50 cursor-wait flex items-center gap-2`}>
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
          <span>Checking...</span>
        </div>
      );
    }

    return (
      <Link
        to={user ? '/dashboard' : '/auth'}
        className={className}
      >
        {user ? 'Go to Dashboard' : (showIcon ? 'Start Planning' : 'Log In')}
        {showIcon && <ArrowRight className="w-5 h-5" />}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] relative overflow-hidden flex flex-col font-['Inter',sans-serif]">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none opacity-40"
        style={{
          backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* Soft gradient blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[50%] h-[50%] rounded-full bg-blue-100/60 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-50/60 blur-[100px]" />
      </div>

      {/* Nav */}
      <nav className="w-full px-6 py-5 z-50 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <AppLogo size={40} />
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link}
                href={`#${link.toLowerCase()}`}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                {link}
              </a>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex items-center gap-4">
            {renderAuthButton("text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors hidden sm:block")}
            {renderAuthButton(
              "bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm"
            )}
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10 w-full max-w-7xl mx-auto pt-8 pb-24">
        {/* Floating UI elements */}
        <div className="relative w-full max-w-5xl mx-auto mb-8">
          {/* Sticky note - top left */}
          <div className="absolute -left-4 top-0 md:left-8 md:top-4 w-40 md:w-48 rotate-[-6deg] z-20 animate-[float_6s_ease-in-out_infinite]">
            <div className="bg-[#fef3c7] rounded-xl p-4 shadow-lg border border-amber-200/50">
              <p className="text-xs text-amber-800 font-medium leading-relaxed" style={{ fontFamily: "'Caveat', cursive, sans-serif" }}>
                Take notes to keep track of crucial details, and accomplish more tasks with ease.
              </p>
              <div className="mt-3 flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="w-3 h-3 rounded-full bg-blue-400" />
              </div>
            </div>
            {/* Push pin */}
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-400 rounded-full shadow-sm border border-red-300" />
          </div>

          {/* Checklist card - left */}
          <div className="absolute left-0 bottom-8 md:left-4 md:bottom-12 z-20 animate-[float_5s_ease-in-out_infinite_1s]">
            <div className="bg-white rounded-2xl p-3 shadow-lg border border-gray-100">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>

          {/* Reminders card - top right */}
          <div className="absolute right-0 top-0 md:right-8 md:top-8 w-48 md:w-56 rotate-[3deg] z-20 animate-[float_7s_ease-in-out_infinite_0.5s]">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-900">Reminders</span>
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 mb-1">Today's Meeting</p>
                <p className="text-xs font-medium text-gray-700">Call with marketing team</p>
                <div className="mt-2 flex items-center gap-1 text-[10px] text-blue-500 font-medium">
                  <Timer className="w-3 h-3" />
                  <span>13:00 – 13:45</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center logo/icon */}
          <div className="flex justify-center pt-16 md:pt-20 relative z-30">
            <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-2xl shadow-lg border border-gray-100 flex items-center justify-center overflow-hidden">
              <img src="/studora-logo.png" alt="Studora" className="w-14 h-14 md:w-16 md:h-16 object-contain" />
            </div>
          </div>

          {/* Today's tasks card - bottom left */}
          <div className="absolute left-4 bottom-0 md:left-12 md:bottom-4 w-48 md:w-56 rotate-[-3deg] z-20 animate-[float_6s_ease-in-out_infinite_2s]">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm font-semibold text-gray-900 mb-3">Today's tasks</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-xs text-gray-700">New ideas for campaign</span>
                  </div>
                  <div className="flex -space-x-1">
                    <div className="w-5 h-5 rounded-full bg-blue-200 border-2 border-white" />
                    <div className="w-5 h-5 rounded-full bg-green-200 border-2 border-white" />
                  </div>
                </div>
                <div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '60%' }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Sep 10 · 60%</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-xs text-gray-700">Design PPT #4</span>
                  </div>
                  <div className="w-5 h-5 rounded-full bg-purple-200 border-2 border-white" />
                </div>
                <div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1">Sep 18 · 110%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Integrations card - bottom right */}
          <div className="absolute right-4 bottom-0 md:right-12 md:bottom-4 w-40 md:w-48 rotate-[2deg] z-20 animate-[float_5.5s_ease-in-out_infinite_1.5s]">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-gray-100">
              <p className="text-sm font-semibold text-gray-900 mb-3">100+ Integrations</p>
              <div className="flex gap-2 flex-wrap">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center border border-gray-100">
                  <span className="text-lg">📧</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center border border-gray-100">
                  <span className="text-lg">💬</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center border border-gray-100">
                  <span className="text-lg">📅</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero heading */}
          <div className="text-center relative z-30 pt-24 md:pt-32 pb-8">
            <h1
              className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.05] mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              <span className="text-gray-900">Think, plan, and track</span>
              <br />
              <span className="text-gray-400">all in one place</span>
            </h1>

            <p className="text-lg md:text-xl text-gray-500 mb-10 max-w-xl mx-auto leading-relaxed">
              Efficiently manage your tasks and boost productivity.
            </p>

            {/* CTA Button */}
            <div className="flex justify-center">
              {renderAuthButton(
                "inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="px-6 py-20 bg-white/70 backdrop-blur-sm relative z-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2
              className="text-3xl md:text-4xl font-bold mb-4 text-gray-900"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Everything you need to ace your studies
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              A complete study management toolkit designed to help you stay organized and productive.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white border border-gray-100 rounded-2xl p-8 hover:border-gray-200 transition-all duration-300 group hover:-translate-y-1 shadow-sm hover:shadow-md"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center mb-5 group-hover:bg-blue-50 transition-colors duration-300">
                  <feature.icon className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors duration-300" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 relative z-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl p-12 md:p-16 shadow-sm border border-gray-100 relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
            <h2
              className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 relative z-10"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Ready to study smarter?
            </h2>
            <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto relative z-10">
              Join thousands of students who have transformed their study habits.
            </p>
            <div className="flex justify-center relative z-10">
              {renderAuthButton(
                "inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg"
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-gray-200/60 py-8 mt-auto z-10 bg-white/50">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-gray-400 text-sm">
          <span>© {new Date().getFullYear()} Studora. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-gray-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-600 transition-colors">Terms</a>
          </div>
        </div>
      </footer>

      {/* Float animation keyframes injected via style tag */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(var(--rotate, 0deg)); }
          50% { transform: translateY(-8px) rotate(var(--rotate, 0deg)); }
        }
        .animate-\\[float_6s_ease-in-out_infinite\\] {
          animation: float 6s ease-in-out infinite;
        }
        .animate-\\[float_5s_ease-in-out_infinite_1s\\] {
          animation: float 5s ease-in-out infinite 1s;
        }
        .animate-\\[float_7s_ease-in-out_infinite_0\\.5s\\] {
          animation: float 7s ease-in-out infinite 0.5s;
        }
        .animate-\\[float_6s_ease-in-out_infinite_2s\\] {
          animation: float 6s ease-in-out infinite 2s;
        }
        .animate-\\[float_5\\.5s_ease-in-out_infinite_1\\.5s\\] {
          animation: float 5.5s ease-in-out infinite 1.5s;
        }
      `}</style>
    </div>
  );
};

export default Landing;
