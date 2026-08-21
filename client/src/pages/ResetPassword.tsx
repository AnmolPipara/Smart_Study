import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import AppLogo from '@/components/AppLogo';
import { Lock, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if the user is here with a recovery token
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const isRecovery = hashParams.get('type') === 'recovery';
    const isError = hashParams.get('error') !== null;
    
    // Using Supabase auth change listener to detect the session establishment
    // from the recovery link click
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
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 justify-center mb-8">
          <AppLogo size={48} />
          <span className="text-2xl font-bold tracking-tight">Smart Study Planner</span>
        </div>

        <div className="glass rounded-2xl p-8 shadow-card">
          <h2 className="text-xl font-semibold text-center mb-2">Update Password</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Please enter your new password below.
          </p>
          
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="New Password"
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
