-- Smart Notes System
CREATE TABLE public.study_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL DEFAULT 'General',
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  parent_id UUID NULL REFERENCES public.study_notes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.study_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes" ON public.study_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own notes" ON public.study_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.study_notes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own notes" ON public.study_notes FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_study_notes_updated_at BEFORE UPDATE ON public.study_notes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_study_notes_user_id ON public.study_notes(user_id);

-- Study Analytics Dashboard (optional persisted daily summary)
CREATE TABLE public.daily_study_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  total_minutes INTEGER NOT NULL DEFAULT 0,
  completed_tasks INTEGER NOT NULL DEFAULT 0,
  total_tasks INTEGER NOT NULL DEFAULT 0,
  focus_score INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);

ALTER TABLE public.daily_study_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats" ON public.daily_study_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON public.daily_study_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON public.daily_study_stats FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_daily_study_stats_updated_at BEFORE UPDATE ON public.daily_study_stats
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX idx_daily_stats_user_id_day ON public.daily_study_stats(user_id, day);

