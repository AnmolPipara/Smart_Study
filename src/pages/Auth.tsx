import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AppLogo from '@/components/AppLogo';
import { Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        navigate('/dashboard');
      }
    } else {
      const { error } = await signUp(email, password, displayName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success('Account created! Check your email to confirm.');
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      toast.error(error.message);
      setLoading(false);
    }
    // On success Supabase will redirect; loading state will be reset on the new page load.
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 justify-center mb-8">
          <AppLogo size={48} />
          <span className="text-2xl font-bold tracking-tight">Smart Study Planner</span>
        </Link>

          <div className="glass rounded-2xl p-8 shadow-card">
          <h2 className="text-xl font-semibold text-center mb-2">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isLogin ? 'Sign in to continue planning' : 'Start organizing your study schedule'}
          </p>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full mb-4 bg-secondary text-foreground rounded-lg py-2.5 text-sm font-semibold hover:bg-secondary/80 transition-all flex items-center justify-center gap-2 border border-border/60 disabled:opacity-60"
          >
            <Chrome className="w-4 h-4" />
            Continue with Google
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  placeholder="Display name"
                  className="w-full bg-secondary rounded-lg pl-10 pr-3 py-3 text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
                />
              </div>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full bg-secondary rounded-lg pl-10 pr-3 py-3 text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-secondary rounded-lg pl-10 pr-3 py-3 text-sm text-foreground placeholder:text-muted-foreground border border-border/50 focus:border-primary/50 focus:outline-none transition-colors"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground rounded-lg py-3 text-sm font-semibold hover:opacity-90 transition-opacity glow-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
