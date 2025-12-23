-- Add this to your Supabase SQL Editor to create the payments table

-- 1. Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES public.books(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    razorpay_payment_id TEXT NOT NULL,
    razorpay_order_id TEXT,
    razorpay_signature TEXT,
    amount INTEGER NOT NULL,  -- Amount in paise
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS policies
CREATE POLICY "Users can view own payments" ON public.payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own payments" ON public.payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 4. Add pdf_url column to books if not exists
ALTER TABLE public.books ADD COLUMN IF NOT EXISTS pdf_url TEXT;

-- Done! 🎉
