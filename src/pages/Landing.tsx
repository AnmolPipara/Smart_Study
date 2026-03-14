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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="glass border-b border-border/50 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AppLogo size={36} />
            <span className="text-lg font-bold tracking-tight">Smart Study Planner</span>
          </div>
          <div>
            {user ? (
              <Link
                to="/dashboard"
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                to="/auth"
                className="bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 py-24 md:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-medium mb-6">
            <Zap className="w-3.5 h-3.5" />
            Built for students who mean business
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight mb-6">
            Plan Smarter.
            <br />
            <span className="text-primary">Study Better.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Organize your study schedule with a visual timetable, smart task priorities,
            deadline reminders, and progress tracking — all in one place.
          </p>
          <div className="flex items-center gap-4 justify-center">
            <Link
              to={user ? '/dashboard' : '/auth'}
              className="bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity glow-primary flex items-center gap-2"
            >
              Start Planning Free
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 border-t border-border/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything you need to ace your studies</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A complete study management toolkit designed to help you stay organized and productive.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass rounded-xl p-6 hover:border-primary/40 transition-all duration-300 group hover:-translate-y-1 hover:shadow-card"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-gradient-to-tr group-hover:from-primary group-hover:via-accent group-hover:to-orange-400 transition-all duration-300">
                  <feature.icon className="w-5 h-5 text-primary transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-0.5" />
                </div>
                <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="max-w-3xl mx-auto glass rounded-2xl p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Ready to transform your study routine?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of students who plan smarter and study better.
          </p>
          <Link
            to={user ? '/dashboard' : '/auth'}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity glow-primary"
          >
            Get Started Now
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/30 px-6 py-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AppLogo size={20} />
            Smart Study Planner
          </div>
          <p className="text-xs text-muted-foreground">© 2026 All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
