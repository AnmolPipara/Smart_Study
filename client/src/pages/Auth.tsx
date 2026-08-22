import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useTheme } from 'next-themes';
import AppLogo from '@/components/AppLogo';
import { Mail, Lock, User, ArrowRight, Chrome, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const [isLogin, setIsLogin] = useState(() => searchParams.get('mode') !== 'signup');
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  // Force light theme on auth pages and restore on unmount
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme('light');
    return () => setTheme(prev === 'light' ? 'light' : 'dark');
  }, [setTheme]);

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
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setLoading(true);
    const { error } = await resetPassword(email);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password reset link sent! Check your email.');
      setForgotPassword(false);
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex justify-center mb-8">
          <AppLogo size={64} />
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-200/60">
          {forgotPassword ? (
            /* Forgot Password Form */
            <>
              <h2 className="text-xl font-semibold text-center mb-2 text-gray-900">Reset your password</h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                Enter your email and we'll send you a reset link
              </p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-gray-50 rounded-lg pl-10 pr-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
              <div className="mt-6 text-center">
                <button
                  onClick={() => setForgotPassword(false)}
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  ← Back to sign in
                </button>
              </div>
            </>
          ) : (
            /* Login / Signup Form */
            <>
              <h2 className="text-xl font-semibold text-center mb-2 text-gray-900">
                {isLogin ? 'Welcome back' : 'Create your account'}
              </h2>
              <p className="text-sm text-gray-500 text-center mb-6">
                {isLogin ? 'Sign in to continue planning' : 'Start organizing your study schedule'}
              </p>

              <button
                type="button"
                onClick={handleGoogle}
                disabled={loading}
                className="w-full mb-4 bg-gray-50 text-gray-900 rounded-lg py-2.5 text-sm font-semibold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 border border-gray-200 disabled:opacity-60"
              >
                <Chrome className="w-4 h-4" />
                Continue with Google
              </button>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={e => setDisplayName(e.target.value)}
                      placeholder="Display name"
                      className="w-full bg-gray-50 rounded-lg pl-10 pr-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="w-full bg-gray-50 rounded-lg pl-10 pr-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-gray-50 rounded-lg pl-10 pr-10 py-3 text-sm text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-blue-500 focus:outline-none transition-colors"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {isLogin && (
                  <div className="text-right">
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-xs text-gray-500 hover:text-blue-600 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-gray-500 hover:text-blue-600 transition-colors"
                >
                  {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
