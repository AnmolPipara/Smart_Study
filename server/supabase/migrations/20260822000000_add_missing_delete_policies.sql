-- Add missing DELETE policies for security completeness

-- Profiles: Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);

-- Daily study stats: Allow users to delete their own stats
CREATE POLICY "Users can delete their own stats" ON public.daily_study_stats FOR DELETE USING (auth.uid() = user_id);

-- Study sessions: Allow users to delete their own sessions
CREATE POLICY "Users can delete their own sessions" ON public.study_sessions FOR DELETE USING (auth.uid() = user_id);
