import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'next-themes';
import { supabase } from '@/integrations/supabase/client';
import AppLogo from '@/components/AppLogo';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setTheme } = useTheme();

  // Force light theme and restore on unmount
  useEffect(() => {
    const prev = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme('light');
    return () => setTheme(prev === 'light' ? 'light' : 'dark');
  }, [setTheme]);

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const isError = hashParams.get('error') !== null;
    
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
           // Wait here, show the form
        }
      }
    );

    if (isError) {
      toast.error('The password reset link has expired or is invalid. Please request a new one.');
      navigate('/auth');
    }

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully! You can now access your account.');
      navigate('/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <AppLogo size={64} />
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-200/60">
          <h2 className="text-xl font-semibold text-center mb-2 text-gray-900">Update Password</h2>
          <p className="text-sm text-gray-500 text-center mb-6">
            Please enter your new password below.
          </p>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New Password"
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-lg py-3 text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
