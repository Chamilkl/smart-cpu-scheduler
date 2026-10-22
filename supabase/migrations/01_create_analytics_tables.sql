-- ====================================================================
-- Smart CPU Scheduler – Admin Analytics Dashboard Schema
-- Version 1.0 | Educational Analytics Edition
-- Target Database: Supabase PostgreSQL
-- ====================================================================

-- 1. Create analytics_events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(50) NOT NULL,
    page_path VARCHAR(255) NOT NULL,
    session_id VARCHAR(64) NOT NULL,
    event_metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for efficient filtering and aggregations
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_type_created ON public.analytics_events(event_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_created ON public.analytics_events(session_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_page ON public.analytics_events(page_path);

-- 2. Create analytics_daily_summary table
CREATE TABLE IF NOT EXISTS public.analytics_daily_summary (
    id BIGSERIAL PRIMARY KEY,
    summary_date DATE NOT NULL UNIQUE,
    page_views INTEGER NOT NULL DEFAULT 0,
    estimated_visitors INTEGER NOT NULL DEFAULT 0,
    simulation_count INTEGER NOT NULL DEFAULT 0,
    quiz_attempt_count INTEGER NOT NULL DEFAULT 0,
    ai_usage_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_analytics_daily_summary_date ON public.analytics_daily_summary(summary_date DESC);

-- 3. Create analytics_simulations table
CREATE TABLE IF NOT EXISTS public.analytics_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    algorithm_name VARCHAR(30) NOT NULL,
    simulation_type VARCHAR(30) NOT NULL DEFAULT 'single',
    status VARCHAR(20) NOT NULL DEFAULT 'success',
    session_id VARCHAR(64),
    process_count INTEGER DEFAULT 0,
    execution_time_ms DOUBLE PRECISION DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_analytics_simulations_algo_created ON public.analytics_simulations(algorithm_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_simulations_created_at ON public.analytics_simulations(created_at DESC);

-- ====================================================================
-- Row Level Security (RLS) Policies
-- Protect data so public clients cannot directly view analytics data
-- ====================================================================
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_daily_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_simulations ENABLE ROW LEVEL SECURITY;

-- Allow server service_role key full access
CREATE POLICY "Service role full access on analytics_events"
    ON public.analytics_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on analytics_daily_summary"
    ON public.analytics_daily_summary
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Service role full access on analytics_simulations"
    ON public.analytics_simulations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ====================================================================
-- Helper Function: Aggregate Daily Summary
-- Can be called via cron job or on-demand
-- ====================================================================
CREATE OR REPLACE FUNCTION public.refresh_analytics_daily_summary(target_date DATE DEFAULT CURRENT_DATE)
RETURNS VOID AS $$
DECLARE
    v_pv INT;
    v_visitors INT;
    v_sims INT;
    v_quiz INT;
    v_ai INT;
    day_start TIMESTAMPTZ;
    day_end TIMESTAMPTZ;
BEGIN
    day_start := target_date::TIMESTAMPTZ;
    day_end := (target_date + INTERVAL '1 day')::TIMESTAMPTZ;

    -- Count page views
    SELECT COUNT(*) INTO v_pv
    FROM public.analytics_events
    WHERE created_at >= day_start AND created_at < day_end AND event_type = 'page_view';

    -- Count distinct sessions as estimated visitors
    SELECT COUNT(DISTINCT session_id) INTO v_visitors
    FROM public.analytics_events
    WHERE created_at >= day_start AND created_at < day_end;

    -- Count simulations
    SELECT COUNT(*) INTO v_sims
    FROM public.analytics_simulations
    WHERE created_at >= day_start AND created_at < day_end;

    -- Count quiz attempts
    SELECT COUNT(*) INTO v_quiz
    FROM public.analytics_events
    WHERE created_at >= day_start AND created_at < day_end AND event_type = 'quiz_submit';

    -- Count AI / AICS usage
    SELECT COUNT(*) INTO v_ai
    FROM public.analytics_events
    WHERE created_at >= day_start AND created_at < day_end AND event_type IN ('ai_recommend', 'ai_compare', 'aics_run');

    -- Upsert daily summary
    INSERT INTO public.analytics_daily_summary (
        summary_date,
        page_views,
        estimated_visitors,
        simulation_count,
        quiz_attempt_count,
        ai_usage_count,
        updated_at
    ) VALUES (
        target_date,
        v_pv,
        v_visitors,
        v_sims,
        v_quiz,
        v_ai,
        timezone('utc'::text, now())
    )
    ON CONFLICT (summary_date) DO UPDATE SET
        page_views = EXCLUDED.page_views,
        estimated_visitors = EXCLUDED.estimated_visitors,
        simulation_count = EXCLUDED.simulation_count,
        quiz_attempt_count = EXCLUDED.quiz_attempt_count,
        ai_usage_count = EXCLUDED.ai_usage_count,
        updated_at = timezone('utc'::text, now());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
