-- =============================================
-- Phase 1: Topic Mastery & Revision System
-- =============================================

-- Subjects table
CREATE TABLE public.subjects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, name)
);

ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own subjects" ON public.subjects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subjects" ON public.subjects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subjects" ON public.subjects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own subjects" ON public.subjects FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON public.subjects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_subjects_user_id ON public.subjects(user_id);

-- Topics table
CREATE TABLE public.topics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, subject_id, name)
);

ALTER TABLE public.topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own topics" ON public.topics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own topics" ON public.topics FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own topics" ON public.topics FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own topics" ON public.topics FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_topics_updated_at BEFORE UPDATE ON public.topics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_topics_user_id ON public.topics(user_id);
CREATE INDEX idx_topics_subject_id ON public.topics(subject_id);

-- Topic mastery scores
CREATE TABLE public.topic_mastery (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  total_reviews INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  incorrect_answers INTEGER NOT NULL DEFAULT 0,
  last_studied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id)
);

ALTER TABLE public.topic_mastery ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mastery" ON public.topic_mastery FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own mastery" ON public.topic_mastery FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mastery" ON public.topic_mastery FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mastery" ON public.topic_mastery FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_topic_mastery_updated_at BEFORE UPDATE ON public.topic_mastery FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_topic_mastery_user_id ON public.topic_mastery(user_id);
CREATE INDEX idx_topic_mastery_topic_id ON public.topic_mastery(topic_id);

-- Revision schedule (spaced repetition)
CREATE TABLE public.revision_schedule (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES public.topics(id) ON DELETE CASCADE,
  next_revision_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_revision_date DATE,
  revision_count INTEGER NOT NULL DEFAULT 0,
  interval_days INTEGER NOT NULL DEFAULT 1,
  ease_factor NUMERIC NOT NULL DEFAULT 2.5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, topic_id)
);

ALTER TABLE public.revision_schedule ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own revisions" ON public.revision_schedule FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own revisions" ON public.revision_schedule FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own revisions" ON public.revision_schedule FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own revisions" ON public.revision_schedule FOR DELETE USING (auth.uid() = user_id);
CREATE TRIGGER update_revision_schedule_updated_at BEFORE UPDATE ON public.revision_schedule FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_revision_schedule_user_id ON public.revision_schedule(user_id);
CREATE INDEX idx_revision_schedule_next_date ON public.revision_schedule(user_id, next_revision_date);

-- Study sessions
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic_id UUID REFERENCES public.topics(id) ON DELETE SET NULL,
  subject TEXT,
  topic_name TEXT,
  session_type TEXT NOT NULL CHECK (session_type IN ('study', 'revision', 'quiz')),
  duration_minutes INTEGER NOT NULL DEFAULT 0,
  performance_rating TEXT CHECK (performance_rating IN ('again', 'hard', 'good', 'easy')),
  score INTEGER CHECK (score >= 0 AND score <= 100),
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_study_sessions_user_id ON public.study_sessions(user_id);
CREATE INDEX idx_study_sessions_created_at ON public.study_sessions(user_id, created_at DESC);
